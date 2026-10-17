#!/usr/bin/env node
/**
 * scripts/audit-licenses.mjs
 *
 * Reproducible license evidence for every installed dependency.
 *
 *   bun run licenses
 *
 * What it does:
 *   1. Resolves the installed dependency graph from package.json through
 *      node_modules. Production closure = dependencies + optionalDependencies;
 *      build closure = devDependencies. Both are audited and labelled with a
 *      scope so the artifact is honest about what ships and what only builds.
 *   2. Detects the declared license from each package.json (string, legacy
 *      {type,url} object, or licenses[] array). When a package declares nothing
 *      but ships a license text, the text is sniffed for the common SPDX ids.
 *   3. Copies shipped license/notice texts to
 *      docs/licenses/<name>@<version>__LICENSE* (scoped names use `+` instead of
 *      the path separator, so the directory stays portable).
 *   4. Writes a deterministic docs/dependency-licenses.json (no timestamps,
 *      stable ordering).
 *   5. Refreshes the two notices served by the site:
 *      public/assets/PROJECT_LICENSE.txt  (verbatim copy of LICENSE)
 *      public/assets/THIRD_PARTY_NOTICES.txt (NOTICE + generated package list)
 *
 * Idempotent: docs/licenses is rebuilt from scratch on every run. Exits 1 when a
 * production package declares no license, or when a declared non-optional
 * dependency is not installed.
 */

import { readFile, writeFile, readdir, mkdir, rm, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const NODE_MODULES = path.join(ROOT, 'node_modules');
const LICENSES_DIR = path.join(ROOT, 'docs', 'licenses');
const JSON_FILE = path.join(ROOT, 'docs', 'dependency-licenses.json');
const SITE_ASSETS = path.join(ROOT, 'public', 'assets');
const PROJECT_LICENSE_OUT = path.join(SITE_ASSETS, 'PROJECT_LICENSE.txt');
const NOTICES_OUT = path.join(SITE_ASSETS, 'THIRD_PARTY_NOTICES.txt');
const LICENSE_FILE = path.join(ROOT, 'LICENSE');
const NOTICE_FILE = path.join(ROOT, 'NOTICE');

const LICENSE_FILE_PATTERN =
  /^(?:licen[cs]e|copying|copyright|notice|unlicense)(?:[._-].*)?$/i;
const MAX_LICENSE_FILE_BYTES = 2 * 1024 * 1024;

const warnings = [];
const failures = [];

const warn = (message) => warnings.push(message);
const fail = (message) => failures.push(message);
const safeName = (name) => name.replace(/\//g, '+');

/** Node-style resolution: package dir inside node_modules, walking up from `fromDir`. */
function resolvePackageDir(name, fromDir) {
  let dir = fromDir;
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name);
    if (existsSync(path.join(candidate, 'package.json'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function detectDeclaredLicense(pkg) {
  if (typeof pkg.license === 'string' && pkg.license.trim()) {
    return { expression: pkg.license.trim(), url: null };
  }
  if (pkg.license && typeof pkg.license === 'object') {
    const expression =
      typeof pkg.license.type === 'string' ? pkg.license.type.trim() : '';
    const url = typeof pkg.license.url === 'string' ? pkg.license.url : null;
    if (expression) return { expression, url };
  }
  if (Array.isArray(pkg.licenses)) {
    const parts = pkg.licenses
      .map((entry) =>
        typeof entry === 'string'
          ? entry
          : typeof entry?.type === 'string'
            ? entry.type
            : null,
      )
      .filter(Boolean)
      .map((part) => part.trim());
    if (parts.length > 0) return { expression: parts.join(' OR '), url: null };
  }
  return { expression: null, url: null };
}

/** Best-effort SPDX id from a shipped license text, only used when package.json is silent. */
function sniffLicenseText(text) {
  if (/SIL OPEN FONT LICENSE/i.test(text)) return 'OFL-1.1';
  if (/Apache License,?\s+Version 2\.0/i.test(text)) return 'Apache-2.0';
  if (/MIT License/i.test(text)) return 'MIT';
  if (/ISC License/i.test(text)) return 'ISC';
  if (/BSD 3-Clause/i.test(text)) return 'BSD-3-Clause';
  if (/BSD 2-Clause/i.test(text)) return 'BSD-2-Clause';
  if (/Mozilla Public License,?\s+Version 2\.0/i.test(text)) return 'MPL-2.0';
  if (/GNU LESSER GENERAL PUBLIC LICENSE/i.test(text)) return 'LGPL';
  if (/GNU GENERAL PUBLIC LICENSE/i.test(text)) return 'GPL';
  return null;
}

async function listLicenseFiles(pkgDir, pkg) {
  const entries = await readdir(pkgDir, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile() && LICENSE_FILE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort();

  // "SEE LICENSE IN <file>" should be picked up even when the file is not named
  // like a license, e.g. "SEE LICENSE IN COPYRIGHT.txt".
  if (typeof pkg.license === 'string') {
    const see = pkg.license.match(/SEE LICEN[CS]E IN\s+(.+)$/i);
    if (see && see[1]) {
      const referenced = see[1].trim();
      if (!names.includes(referenced) && existsSync(path.join(pkgDir, referenced))) {
        names.push(referenced);
      }
    }
  }

  const kept = [];
  for (const name of names.sort()) {
    const info = await stat(path.join(pkgDir, name));
    if (info.size > 0 && info.size <= MAX_LICENSE_FILE_BYTES) kept.push(name);
  }
  return kept;
}

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));

async function main() {
  if (!existsSync(NODE_MODULES)) {
    process.stderr.write('[licenses] node_modules is missing. Run `bun install` first.\n');
    process.exit(1);
  }

  const rootPkg = await readJson(path.join(ROOT, 'package.json'));

  /** @type {Map<string, {name:string, version:string, scope:'production'|'development', dir:string}>} */
  const packages = new Map();

  /** Breadth-first closure over dependencies + optionalDependencies, resolved the way Node does. */
  async function collect(rootNames, scope) {
    const queue = rootNames.map((name) => ({ name, fromDir: ROOT, optional: false }));
    while (queue.length > 0) {
      const item = queue.shift();
      const dir = resolvePackageDir(item.name, item.fromDir);
      if (!dir) {
        if (!item.optional) {
          fail(
            `declared dependency ${item.name} is not installed in node_modules (${scope} closure)`,
          );
        }
        continue;
      }

      const key = path.relative(ROOT, dir).replace(/\\/g, '/');
      if (packages.has(key)) continue;

      const pkgJson = await readJson(path.join(dir, 'package.json'));
      packages.set(key, {
        name: String(pkgJson.name || item.name),
        version: String(pkgJson.version || '0.0.0'),
        scope,
        dir,
      });

      for (const child of Object.keys(pkgJson.dependencies || {}).sort()) {
        queue.push({ name: child, fromDir: dir, optional: false });
      }
      for (const child of Object.keys(pkgJson.optionalDependencies || {}).sort()) {
        queue.push({ name: child, fromDir: dir, optional: true });
      }
    }
  }

  const productionRoots = [
    ...new Set([
      ...Object.keys(rootPkg.dependencies || {}),
      ...Object.keys(rootPkg.optionalDependencies || {}),
    ]),
  ].sort();
  const developmentRoots = Object.keys(rootPkg.devDependencies || {}).sort();

  await collect(productionRoots, 'production');
  await collect(developmentRoots, 'development');

  // ------------------------------------------------------------- licenses
  await rm(LICENSES_DIR, { recursive: true, force: true });
  await mkdir(LICENSES_DIR, { recursive: true });

  const sorted = [...packages.values()].sort((a, b) => {
    if (a.name !== b.name) return a.name < b.name ? -1 : 1;
    if (a.version !== b.version) return a.version < b.version ? -1 : 1;
    return a.scope < b.scope ? -1 : a.scope > b.scope ? 1 : 0;
  });

  const entries = [];
  let copiedFiles = 0;
  let productionCount = 0;
  let developmentCount = 0;

  for (const pkg of sorted) {
    const pkgJson = await readJson(path.join(pkg.dir, 'package.json'));
    const declared = detectDeclaredLicense(pkgJson);
    const licenseFiles = await listLicenseFiles(pkg.dir, pkgJson);

    const copied = [];
    for (const file of licenseFiles) {
      const base = `${safeName(pkg.name)}@${pkg.version}__${file}`;
      const target = path.join(LICENSES_DIR, base);
      const content = await readFile(path.join(pkg.dir, file));
      await writeFile(target, content);
      copied.push(`docs/licenses/${base}`);
      copiedFiles += 1;
    }

    let license = declared.expression;
    let licenseSource = 'package.json';

    if (!license) {
      if (licenseFiles.length > 0) {
        const first = await readFile(path.join(pkg.dir, licenseFiles[0]), 'utf8');
        const sniffed = sniffLicenseText(first);
        license = sniffed || 'SEE LICENSE FILE';
        licenseSource = sniffed ? 'license-file+sniffed' : 'license-file';
        if (!sniffed) {
          warn(
            `${pkg.name}@${pkg.version} declares no license; copied ${licenseFiles.join(', ')} without detecting an SPDX id`,
          );
        }
      } else {
        license = 'UNKNOWN';
        licenseSource = 'unknown';
        const message = `${pkg.name}@${pkg.version} declares no license and ships no license file`;
        if (pkg.scope === 'production') fail(message);
        else warn(message);
      }
    }

    if (pkg.scope === 'production') productionCount += 1;
    else developmentCount += 1;

    entries.push({
      name: pkg.name,
      version: pkg.version,
      scope: pkg.scope,
      license,
      licenseUrl: declared.url,
      licenseSource,
      licenseFiles: copied,
    });
  }

  const json = {
    schemaVersion: 1,
    generator: 'scripts/audit-licenses.mjs',
    project: {
      name: rootPkg.name,
      version: rootPkg.version,
      license: typeof rootPkg.license === 'string' ? rootPkg.license : 'UNKNOWN',
    },
    summary: {
      packages: sorted.length,
      production: productionCount,
      development: developmentCount,
      licenseFilesCopied: copiedFiles,
    },
    packages: entries,
  };
  await writeFile(JSON_FILE, `${JSON.stringify(json, null, 2)}\n`, 'utf8');

  // ------------------------------------------------------------- notices
  await mkdir(SITE_ASSETS, { recursive: true });
  await writeFile(PROJECT_LICENSE_OUT, await readFile(LICENSE_FILE));

  const notice = (await readFile(NOTICE_FILE, 'utf8')).replace(/\r\n/g, '\n').trimEnd();
  const produced = entries.filter((entry) => entry.scope === 'production');
  const development = entries.filter((entry) => entry.scope === 'development');
  const pad = (value, width) => value.padEnd(width, ' ');

  const inventory = [
    '',
    '-'.repeat(78),
    'GENERATED DEPENDENCY INVENTORY',
    'Regenerate with: bun run licenses   (source: docs/dependency-licenses.json)',
    `Packages: ${entries.length} (production ${produced.length}, build ${development.length})`,
    'Full license texts: docs/licenses/<name>@<version>__<LICENSE|NOTICE|COPYING>',
    '',
    'PRODUCTION DEPENDENCIES',
    ...produced.map(
      (entry) => `  ${pad(entry.name, 44)} ${pad(entry.version, 12)} ${entry.license}`,
    ),
    '',
    'BUILD DEPENDENCIES',
    ...development.map(
      (entry) => `  ${pad(entry.name, 44)} ${pad(entry.version, 12)} ${entry.license}`,
    ),
    '',
  ];

  await writeFile(NOTICES_OUT, `${notice}\n${inventory.join('\n')}`, 'utf8');

  // ------------------------------------------------------------- report
  for (const message of warnings) process.stderr.write(`[licenses] warn: ${message}\n`);

  if (failures.length > 0) {
    process.stderr.write(`\n[licenses] ${failures.length} problem(s):\n`);
    for (const message of failures) process.stderr.write(`  x ${message}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `[licenses] ok  ${sorted.length} packages ` +
      `(${productionCount} production, ${developmentCount} build)  ` +
      `${copiedFiles} license/notice files -> docs/licenses/  ` +
      `docs/dependency-licenses.json  public/assets/PROJECT_LICENSE.txt  ` +
      `public/assets/THIRD_PARTY_NOTICES.txt\n`,
  );
}

await main();
