# STMfan · Sublunary (v2)

个人主页，一镜到底。从月下轨道缓缓落到地面：一段连续的镜头，一张会呼吸的夜空，一篇中英双语的自述。

Personal homepage, one continuous take. A slow descent from lunar orbit to the ground, in a single unbroken shot.

- Slogan: 探月下，尘世万象 / To Decipher the Sublunary Sphere.
- Branch `v2`: rebuilt from an orphan branch. `v1` remains the archived previous site.

## Stack

- Vite 8 + React 19 + TypeScript
- GSAP ScrollTrigger for the scroll choreography, Lenis for inertia
- A hand written canvas stage for the sky, moon and dust
- No CSS framework. A small token layer plus scoped stylesheets
- Self hosted variable fonts via `@fontsource-variable`

## Scripts

```sh
bun install
bun run dev         # local dev server on 127.0.0.1
bun run typecheck   # tsc --noEmit
bun run build       # typecheck, client build, prerender
bun run preview     # preview the production build
bun run check:site  # validate the built dist
bun run licenses    # regenerate dependency license evidence
```

## Structure

```
src/
  content/site.ts      all bilingual copy and structured data
  lib/                 i18n, theme, motion, smooth scroll, shared stores
  components/          stage, cursor, navigation, preloader, controls
  sections/            one file per act of the continuous shot
  styles/              tokens, base, layout, sections
public/                static assets, headers, sitemap, robots
scripts/               prerender, site checks, license and asset pipeline
docs/                  deployment, assets, validation
```

## Deployment

Static output in `dist`, built by `.github/workflows/build.yml` and ready for
Cloudflare Pages Git integration. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Design

The concept, tokens, act-by-act choreography and tradeoffs are written up in
[docs/DESIGN.md](docs/DESIGN.md). Asset provenance lives in
[docs/ASSETS.md](docs/ASSETS.md), and the commands that produced the current
build are recorded in [docs/VALIDATION.md](docs/VALIDATION.md).

## License

MIT for the original source. Third party trademarks, game names, character
names and provided artwork stay with their owners. See [NOTICE](NOTICE).
