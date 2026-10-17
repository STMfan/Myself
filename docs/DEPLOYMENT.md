# Deployment · STMfan / Sublunary (v2)

The site is a fully static single page. `vite build` writes `dist/`, and
`scripts/prerender.mjs` bakes the zh markup into `dist/index.html` afterwards.
There is no server, no database, no runtime secret and no SPA catch-all rule:
every route is `/`.

```
dist/
  index.html            prerendered HTML + hashed /assets/*.js + /assets/*.css
  assets/               JS, CSS, fonts, art, share/og.png, license notices
  _headers              Cloudflare Pages header rules (copied from public/)
  robots.txt
  sitemap.xml
  404.html              optional; Cloudflare serves the default if absent
```

## 1. Cloudflare Pages, Git integration

Create the project once, then let Cloudflare build every push.

| Setting | Value |
| --- | --- |
| Repository | this repo (`STMfan/...`, the one holding this workspace) |
| Project name | `stmfan` |
| Production branch | `main` |
| Preview branches | `v2` (and any other branch you choose to preview) |
| Framework preset | None |
| Build command | `bun install --frozen-lockfile && bun run licenses && bun run build:pages && bun run check:site` |
| Build output directory | `dist` |
| Root directory | `/` |
| Node version | `24` (via `NODE_VERSION`) |

Environment variables (Production and Preview):

| Name | Value | Why |
| --- | --- | --- |
| `BUN_VERSION` | `1.4.0` | Pins the package manager used by the build image. |
| `NODE_VERSION` | `24` | Pins Node for the `node scripts/*.mjs` steps. |
| `SKIP_DEPENDENCY_INSTALL` | `true` | Stops the Pages image from running its own install before the build command; `bun install --frozen-lockfile` is the only install. |

Notes:

- `BUN_VERSION` and `NODE_VERSION` are read by the Pages build image; the repo
  also carries `.bun-version` and `.node-version` so local runs agree.
- `bun install --frozen-lockfile` makes the build fail instead of silently
  updating `bun.lock`; the lockfile is committed and must stay in sync with
  `package.json`.
- `bun run licenses` regenerates `docs/dependency-licenses.json` and the two
  notice files served from `/assets/PROJECT_LICENSE.txt` and
  `/assets/THIRD_PARTY_NOTICES.txt` before the site is built, so the deployed
  notices can never drift from the installed tree.
- `bun run build:pages` is an alias of `bun run build`:
  `tsc --noEmit && vite build && node scripts/prerender.mjs`.
- `bun run check:site` runs after the build and fails the deployment on a
  missing meta tag, a missing prerendered section, a broken `/assets/...`
  reference, a stray em dash, a source map or an oversized `dist`.
- Builds are pure static output. No Functions, no KV, no R2, no `wrangler.toml`.

## 2. First deploy checklist

1. Push `main` with `bun.lock`, `.bun-version` and `.node-version` committed.
2. In Cloudflare Pages, connect the repo and set the values from the table
   above. Do not set a framework preset.
3. Trigger the first build and read the log for the four script banners:
   `licenses ok`, `built in`, `[prerender] ok`, `[check:site] ok`.
4. Add the custom domain `stmfan.tech` (and `www` redirect) in the Pages
   project. Cloudflare issues the certificate automatically.
5. Confirm after the first deploy:
   - `https://stmfan.tech/` returns the prerendered HTML with
     `探月下，尘世万象` in the source.
   - `https://stmfan.tech/sitemap.xml` and `/robots.txt` are served.
   - `https://stmfan.tech/assets/share/og.png` returns `200 image/png`.
   - `https://stmfan.tech/assets/PROJECT_LICENSE.txt` and
     `/assets/THIRD_PARTY_NOTICES.txt` are served.

## 3. Previews

`v2` is the rebuild branch. Keep it as a preview branch while the branch is in
flight:

- push to `v2` → preview deployment at `<hash>.stmfan.pages.dev`
- merge `v2` into `main` → production deployment

Preview builds use the same command and the same `dist`. Nothing in the build
reads the branch name, so a preview is byte-for-byte the production output for
the same commit.

## 4. Static headers

`public/_headers` is copied verbatim into `dist/_headers`; `check:site` fails if
the copy goes missing or differs. Current policy:

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: DENY

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/assets/*
  Cache-Control: public, max-age=604800

/index.html
  Cache-Control: public, max-age=0, must-revalidate
```

Because Vite fingerprints every emitted file (`index-<hash>.js`,
`style-<hash>.css`, font and art hashes), `/assets/*` can be cached hard. The
HTML stays `must-revalidate` so a new deploy is picked up immediately. When the
asset policy changes, edit `public/_headers` only; the copy inside `dist/` is
generated.

## 5. Cache and invalidation behaviour

- Deploy = new hashed asset names. No purge needed for JS, CSS, fonts or art.
- `index.html` is revalidated on every request, so a deploy is visible on the
  next navigation.
- If a revert is needed, use Cloudflare Pages "Rollback" to the previous
  deployment. The old hashed assets are still addressable because Pages keeps
  every deployment.
- If a stale HTML is still served, purge `stmfan.tech/index.html` in the
  Cloudflare cache. Do not purge the whole zone: hashed assets do not need it.

## 6. GitHub Actions

`.github/workflows/build.yml` is the independent verification path. It runs on
pushes to `main` and `v2`, on pull requests and on demand:

```sh
bun install --frozen-lockfile
bun run licenses
bun run build:pages
bun run check:site
```

and uploads the result as the artifact `cloudflare-pages-dist` (7 day
retention). To ship that artifact instead of a Git build, download it and use
`wrangler pages deploy dist --project-name stmfan`. The artifact name is part
of the contract: keep it `cloudflare-pages-dist`.

## 7. Local reproduction

```sh
bun install --frozen-lockfile
bun run licenses
bun run build:pages
bun run check:site
bun run preview        # http://127.0.0.1:4173
```

`bun run build` writes `dist/` and `.ssr/`; both are git ignored. `bun run
preview` serves exactly the deployed files, including `_headers`, `robots.txt`
and `sitemap.xml`, so check the prerendered source there before deploying.

## 8. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `prerender FAILED: dist/index.html not found` | `vite build` did not run first | use `bun run build` / `bun run build:pages`, not `node scripts/prerender.mjs` alone |
| `prerender FAILED: already contains prerendered markup` | prerender ran twice on the same `dist` | rebuild (`vite build` empties `dist`) |
| `check:site` lists missing `/assets/...` | `public/assets` files are absent or not committed | restore them, rebuild, rerun |
| `check:site` lists `em dash` | a U+2014 character reached `index.html` or prerendered markup | replace it with a comma or a hyphen |
| `check:site` says `dist is ... over the 24 MB ceiling` | oversized art or fonts | shrink the asset pipeline output, not the ceiling |
| `tsc --noEmit` fails only on files you did not touch | concurrent local edits | rerun after the other change lands; CI only sees pushed commits |
| `licenses` fails with `declares no license` | a new production dependency ships no license field and no license text | add it to the audit allow list only after adding the text, or drop the dependency |
| Pages build ignores the command | `SKIP_DEPENDENCY_INSTALL` unset | set it to `true`; the image otherwise installs with a different Node version |

## 9. What must never be committed

- `dist/`, `.ssr/`, `node_modules/`, `.cache/`, `.wrangler/`, `artifacts/`,
  `output/`, `assets-src/`, `*.tsbuildinfo`, `.env*` (see `.gitignore`).
- Generated license files are the exception: `docs/dependency-licenses.json`,
  `docs/licenses/`, `public/assets/PROJECT_LICENSE.txt` and
  `public/assets/THIRD_PARTY_NOTICES.txt` are regenerated by
  `bun run licenses`, deterministic, and are committed so the repository is
  auditable without a build.

## 10. Related docs

- `docs/VALIDATION.md`: exact commands and their real output for this build.
- `docs/ASSETS.md`: image provenance and the asset pipeline (owned by the
  asset pipeline).
- `README.md`: project overview and the full script list.
