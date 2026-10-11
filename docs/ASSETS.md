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
| `public/assets/games/delta.webp` | 用户指定 https://upload.wikimedia.org/wikipedia/commons/7/7a/Delta_Force_Logo_CN.png | 替换旧活动联名标志，保留透明通道 |
| `public/assets/games/minecraft.webp` | Minecraft 官网 android-icon-192x192.png | 官方 Creeper 图标 |
| `public/assets/maibot.webp` | 用户指定 Mai-with-u/.github/profile/assets/maimai2.png | 保留透明通道；显示时围绕中心顺时针旋转 35° |
| `public/assets/playlist-cover.webp` | 用户指定 Bilibili CDN 图片 | 居中圆形遮罩，作为唱片中心封面 |
| `public/assets/bilibili.svg` | Simple Icons 的 Bilibili glyph | CC0 1.0，Bilibili 商标权独立；用于联系胶囊 |
| `public/assets/qq.svg` | 用户提供 `Downloads/qq-brands-solid-full.svg`，Font Awesome Free 7.3.1 | 原样保留 SVG 与版权注释；CC BY 4.0，Copyright 2026 Fonticons, Inc.；使用 CSS 蒙版随主题显示，QQ 商标权独立 |
| `public/assets/characters/*.webp` | 用户提供的五张角色素材 | 内置 ImageGen 透明半身抠图；源文件名、SHA256、完整提示与输出校验见 `public/assets/characters/sources.json` |
| 英文字体 | Space Grotesk、DM Sans 的 Fontsource 包 | 未修改字体；保留 OFL 协议，构建输出到本地 assets |

游戏图标、名称与商标归各自权利人。这些公开来源不等于已获得开源再授权；项目源码协议不应覆盖它们。当前用于个人兴趣介绍，未声称合作或官方认可。未来替换素材时应保存来源与授权依据。

五张角色素材由 STMfan 于 2026-10-11 提供，来自本机 Downloads/Chara。莱欧斯利、法尔伽、莱卡恩的原始角色权利归 HoYoverse；威龙、比特归 Tencent / Team Jade。抠图使用 Codex 内置 ImageGen 的 background-extraction 模式，后续只用 Sharp 缩放、压缩为 WebP。生成过程可能重采样局部细节，不能把处理结果当作逐像素原图。原图保留在用户原目录，生成 PNG 副本保存在工作区 `.cache/characters/`，交付 WebP 在 `public/assets/characters/`。

第二轮批注后，莱欧斯利由内置 ImageGen 重新提取，并按用户授权补全两侧衣装缺失轮廓。经过一次针对背景与画幅的修正，采用完整的半身轮廓，输出为 900×900 透明 WebP。生成提示与中间文件名记录在素材清单中；模型可能重采样局部细节。

将新透明全身或半身素材放入 `public/assets/characters/`，在 `src/content.ts` 的 `characters` 条目修改 `art` 即可。角色按画幅使用 `contain` 或 `cover` 放大，图片跨出卡片边框，底部使用 CSS 透明渐隐接入卡片。所有新增第三方素材仍不属于本项目 MIT 授权范围。展示英文名称按所有者要求为 Wriothesley、Varka、Von Lycann、Wang、Rashid。

`scripts/inspect-assets.mjs`、`storefront-assets.mjs`、`inspect-delta.mjs` 是本次来源核查脚本，不参与构建。`prepare-assets.mjs` 使用核查得到的 `.cache/asset-pages/*.json`；`.cache` 不进 Git，因此普通克隆直接使用已入库素材，不需要重抓。

`scripts/revision-assets.mjs` 记录本次用户指定素材下载；`scripts/prepare-character-assets.mjs` 记录本机生成图片的整理、alpha 验证与压缩流程。它们不是克隆后的构建前置步骤。技术区四种展示图由 `SkillVisual.tsx` 与 CSS/SVG 构成，是技术领域的示意画面，并非服务器实时监控数据。
