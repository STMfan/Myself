# 素材来源与补充

全部网页图片与英文字体自托管，运行时无需向图片或字体 CDN 发请求。

| 文件 | 来源 | 处理与边界 |
| --- | --- | --- |
| `public/assets/avatar.png` | https://github.com/STMfan.png?size=320，实际重定向到 GitHub 用户 102839732 的头像 | 用户指定头像，320px 本地副本 |
| `public/assets/moon-source.png` | Codex 内置 ImageGen 本次生成 | 保留原始透明 PNG |
| `public/assets/moon.webp` | 同上 | 缩放为 960px，保留透明通道；构图提示见 `imagegen-prompt.md` |
| `public/assets/games/phigros.webp` | Apple 官方 App Store，1454809109，厦门鸽游 | 开发商官方游戏图标，原始 CDN 见 `public/assets/sources.json` |
| `public/assets/games/genshin.webp` | Apple 官方 App Store，1517783697，COGNOSPHERE | 官方游戏图标 |
| `public/assets/games/zzz.webp` | Apple 官方 App Store，1606356401，COGNOSPHERE | 官方游戏图标 |
| `public/assets/games/delta.webp` | https://df.qq.com/cp/a20240906main/index.html | 常规官网标志，避开周年活动联名标志 |
| `public/assets/games/minecraft.webp` | Minecraft 官网 android-icon-192x192.png | 官方 Creeper 图标 |
| 英文字体 | Space Grotesk、DM Sans 的 Fontsource 包 | 未修改字体；保留 OFL 协议，构建输出到本地 assets |

游戏图标、名称与商标归各自权利人。这些公开来源不等于已获得开源再授权；项目源码协议不应覆盖它们。当前用于个人兴趣介绍，未声称合作或官方认可。未来替换素材时应保存来源与授权依据。

角色立绘当前按用户要求保留位置，未补造角色图片。将透明全身或半身素材放入 `public/assets/characters/`，在 `src/content.ts` 的 `characters` 条目添加 `art: '/assets/characters/name.webp'` 即可。保持人物完整，人物图片用 `object-fit: contain`。若需抠图，可用 ImageGen 的透明背景编辑，并保留源图。

`scripts/inspect-assets.mjs`、`storefront-assets.mjs`、`inspect-delta.mjs` 是本次来源核查脚本，不参与构建。`prepare-assets.mjs` 使用核查得到的 `.cache/asset-pages/*.json`；`.cache` 不进 Git，因此普通克隆直接使用已入库素材，不需要重抓。
