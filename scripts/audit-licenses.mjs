import { readdir, readFile, mkdir, writeFile, realpath, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const inventory = [];
const seen = new Set();
const notices = [];
await mkdir('docs/licenses', { recursive: true });
async function packageDirs(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
    if (entry.name.startsWith('.')) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.name.startsWith('@')) {
      for (const scoped of await readdir(entryPath, { withFileTypes: true })) found.push(path.join(entryPath, scoped.name));
    } else found.push(entryPath);
  }
  return found;
}
async function resolveDependency(name, from) {
  let folder = path.resolve(from);
  while (folder.startsWith(root)) {
    const candidate = path.join(folder, 'node_modules', name);
    try { await readFile(path.join(candidate, 'package.json')); return candidate; } catch { /* Try ancestor. */ }
    if (folder === root) break;
    folder = path.dirname(folder);
  }
}
async function inspect(directory, usage) {
  const canonical = await realpath(directory).catch(() => directory);
  if (seen.has(canonical)) return;
  seen.add(canonical);
  let manifest;
  try { manifest = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8')); } catch { return; }
  const files = [];
  async function licenseFiles(folder, insideLicenseDirectory = false) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      const isLicense = /^(?:licen[sc]e|copying|notice|ofl|copyright)(?:[.-]|$)/i.test(entry.name) && !/\.(?:tsx?|jsx?|mjs|cjs|map)$/i.test(entry.name);
      const file = path.join(folder, entry.name);
      if (entry.isFile() && (isLicense || insideLicenseDirectory)) files.push(file);
      else if (entry.isDirectory()) await licenseFiles(file, insideLicenseDirectory || isLicense);
    }
  }
  await licenseFiles(directory);
  if (manifest.name.startsWith('@img/sharp-')) {
    const notice = path.join(directory, 'README.md');
    const contents = await readFile(notice, 'utf8').catch(() => '');
    if (contents.includes('third-party libraries')) files.push(notice);
  }
  const shipsLicenseFile = files.length > 0;
  let sharedLicenseSource;
  if (!shipsLicenseFile && manifest.name.startsWith('@rolldown/binding-')) {
    const parent = JSON.parse(await readFile('node_modules/rolldown/package.json', 'utf8'));
    if (parent.version === manifest.version && parent.license === manifest.license) {
      sharedLicenseSource = 'node_modules/rolldown/LICENSE';
      files.push(path.resolve(sharedLicenseSource));
    }
  }
  const evidence = [];
  for (const file of files) {
    const raw = await readFile(file);
    const suffix = sharedLicenseSource ? 'shared-upstream-LICENSE' : path.relative(directory, file).replaceAll(path.sep, '__');
    const filename = `${manifest.name.replaceAll('/', '__')}@${manifest.version}__${suffix}`;
    await writeFile(path.join('docs/licenses', filename), raw);
    evidence.push({ source: path.relative(root, file).replaceAll(path.sep, '/'), saved: `docs/licenses/${filename}`, sha256: createHash('sha256').update(raw).digest('hex') });
    notices.push(`\n${'='.repeat(72)}\n${manifest.name}@${manifest.version} / ${path.relative(directory, file)}\n${'='.repeat(72)}\n${raw.toString('utf8')}`);
  }
  inventory.push({ name: manifest.name, version: manifest.version, usage, license: typeof manifest.license === 'string' ? manifest.license : manifest.license?.type || 'NOT DECLARED', direct: pkg.dependencies?.[manifest.name] ? 'runtime' : pkg.devDependencies?.[manifest.name] ? 'development' : 'transitive', files: evidence, shipsLicenseFile, sharedLicenseSource, missingLicenseFile: files.length === 0 });
  for (const name of Object.keys({ ...manifest.dependencies, ...manifest.optionalDependencies, ...manifest.peerDependencies })) {
    const nested = await resolveDependency(name, directory);
    if (nested) await inspect(nested, usage);
  }
}
for (const [kind, usage] of [['dependencies', 'runtime'], ['devDependencies', 'development']]) {
  for (const name of Object.keys(pkg[kind])) {
    const directory = await resolveDependency(name, root);
    if (!directory) throw new Error(`Required dependency not installed: ${name}`);
    await inspect(directory, usage);
  }
}
inventory.sort((a, b) => a.name.localeCompare(b.name));
// Only replace our own generated evidence snapshot. Never recurse or remove user files.
const evidenceRoot = path.resolve(root, 'docs/licenses');
const activeEvidence = new Set(inventory.flatMap(p => p.files.map(f => path.basename(f.saved))));
for (const filename of await readdir(evidenceRoot)) {
  if (!/^[^/\\]+@\d[^/\\]*__/.test(filename) || activeEvidence.has(filename)) continue;
  const target = path.resolve(evidenceRoot, filename);
  if (path.dirname(target) !== evidenceRoot) throw new Error('Evidence path escaped its directory');
  await unlink(target);
}
const counts = {};
for (const dep of inventory) counts[dep.license] = (counts[dep.license] || 0) + 1;
await writeFile('docs/dependency-licenses.json', JSON.stringify({ generatedAt: new Date().toISOString(), platform: process.platform, scope: 'Installed reachable dependency graph including peers and current-platform optional packages; excludes stale/extraneous directories.', packageCount: inventory.length, counts, packages: inventory }, null, 2) + '\n');
await writeFile('public/THIRD_PARTY_NOTICES.txt', `STMfan website dependency notices\nOriginal website source license: ${pkg.license}. Third-party packages retain their own terms. These notices do not license game artwork or trademarks.\n` + notices.join('\n'));
try { await writeFile('public/PROJECT_LICENSE.txt', await readFile('LICENSE')); } catch (error) { if (pkg.license !== 'UNLICENSED') throw error; }
console.log(JSON.stringify({ packageCount: inventory.length, counts, missingFiles: inventory.filter(x => x.missingLicenseFile).map(x => x.name), report: 'docs/dependency-licenses.json' }, null, 2));
