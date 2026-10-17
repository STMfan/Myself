# STMfan · Sublunary (v2)

个人主页，一镜到底。从月面轨道落到地面：一颗可以拖动的月球，一段连续的夜空，一份把技术与委托讲清楚的自述。

Personal homepage, one continuous take. A giant draggable moon behind the title, a continuous night sky, and a page that gets to the point about skills and paid work.

- Slogan: 探月下，尘世万象。 / To Decipher the Sublunary Sphere.
- Branch `v2`: rebuilt from an orphan branch. `v1` remains the archived previous site.
- Information order: 技术能力 → 开源与贡献 → 付费委托（开源项目看兴趣，有时免费）→ 画册（游戏 / 角色 / 歌单三张卡片）→ 手记 → 联系.
- Character art is official artwork (Genshin Impact, Zenless Zone Zero, Delta Force), not generated. The two Delta Force key arts are cut out locally with rembg.
- The avatar is fetched from the GitHub API at runtime, with the full local avatar as an offline fallback and a 12 hour cache.
- No preloader: the page paints immediately, including on mobile.

## Stack

- Vite 8 + React 19 + TypeScript
- three.js for the real, draggable 3D moon (lazy loaded as its own chunk)
- GSAP ScrollTrigger for reveal and parallax, with **native scrolling**: no Lenis, no wheel hijack, no pinned scroll traps
- A hand written canvas starfield behind the whole page, with a lighter 30fps mobile profile
- No CSS framework. A token layer plus five scoped stylesheets
- Self hosted variable fonts via `@fontsource-variable`
- SSR prerender for crawlers, static output for Cloudflare Pages

## Scripts

```sh
bun install
bun run dev         # local dev server on 127.0.0.1
bun run typecheck   # tsc --noEmit
bun run build       # typecheck, client build, prerender
bun run preview     # preview the production build
bun run check:site  # validate the built dist (290 checks)
bun run licenses    # regenerate dependency license evidence
bun run assets      # regenerate art derivatives from assets-src
```

## Structure

```
src/
  content/site.ts      all bilingual copy and structured data
  lib/                 i18n/theme, scroll helpers, GitHub avatar, moon maths, toast
  components/          stage, nav, 3D moon, controls
  sections/            hero, skills, open source, commissions, gallery, notes, contact
  styles/              tokens, base, chrome, stage, sections, responsive
public/                static assets, headers, sitemap, robots
scripts/               prerender, site checks, license and asset pipeline
docs/                  design, deployment, assets, validation
```

## Deployment

Static output in `dist`, built by `.github/workflows/build.yml` and ready for
Cloudflare Pages Git integration. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Design

The concept, tokens, act-by-act choreography, typography, mobile performance mode
and tradeoffs are written up in [docs/DESIGN.md](docs/DESIGN.md). Asset provenance
lives in [docs/ASSETS.md](docs/ASSETS.md), and the commands that produced the
current build are recorded in [docs/VALIDATION.md](docs/VALIDATION.md).

## License

MIT for the original source. Third party trademarks, game names, character names,
official artwork and the CC BY 4.0 moon texture stay with their owners. See
[NOTICE](NOTICE).
