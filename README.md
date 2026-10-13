# STMfan · Sublunary Sphere

个人介绍网页。探月下，尘世万象。

Vite + React + TypeScript + Tailwind CSS v4 + Framer Motion。最终配色为用户确认的「极地信号」；默认暗色、中文，支持快速切换并保存偏好。

生产构建会生成可直接阅读的静态 HTML，再由 React 水合。全页流动光路、文字透视转场与悬浮器物共用连续阅读路径；可随时收敛动效，并遵循系统减少动态效果。2026-10-13 的报告分析、文案核算与新增素材提示见 [CREATIVE-2026-10-13.md](docs/CREATIVE-2026-10-13.md)。

## 本地开发

```powershell
./scripts/local.ps1 install
./scripts/local.ps1 dev
```

访问 http://127.0.0.1:5173/ 。主题已固定为「极地信号」，保留亮暗切换。依赖在 `node_modules`，Bun 缓存与安装临时文件在工作区 `.cache`，不会安装项目全局依赖。已安装的 Bun、Node 等系统工具直接复用。

```powershell
./scripts/local.ps1 licenses
./scripts/local.ps1 build
./scripts/local.ps1 check
```

其他平台：`bun install --frozen-lockfile`、`bun run dev`、`bun run licenses`、`bun run build:pages`、`bun run check:site`。版本见 `.bun-version` / `.node-version`。

## 内容补充

在 `src/content.ts` 修改个人信息与双语内容。`projects` / `articles` 添加真实标题、描述、URL 与标签后，占位卡片自动变为可点击作品。`characters` 的 `art` 字段接收透明全身或半身立绘。素材来源与版权边界见 [ASSETS.md](docs/ASSETS.md)。

## 交互

连续页面与章节悬浮导航，「联系我 ↗」及邮件 / GitHub / Bilibili 胶囊始终可见。月球浮游、旋转、缩放与滚动视差；四种技术示意场景带动态信号、服务器扫描、构建与屏幕动画。角色约每 2.8 秒纵向切换，悬停、聚焦或触屏展开选择胶囊时暂停，也可手动暂停；离开视口、后台标签页或减少动态效果设置下停止自动切换。技术与角色选择支持方向键、Home / End；游戏 UID / ID 与 QQ 支持复制反馈。五张用户提供的角色素材已处理为透明半身立绘，莱欧斯利按用户要求重新提取并补齐衣装边缘。触控操作不依赖 hover，窄屏游戏架横向滑动；支持 `prefers-reduced-motion`、键盘焦点、跳到正文及安全区域。批注处理记录见 [REVISION-2026-10-11.md](docs/REVISION-2026-10-11.md)。

## 发布与协议

Cloudflare Pages 构建说明见 [DEPLOYMENT.md](docs/DEPLOYMENT.md)。GitHub 流水线输出静态 `dist`；规范地址为 `https://stmfan.tech/`，线上发布由所有者的 Pages Git 集成控制。

原始网站源码与文档采用 **[MIT](LICENSE)**，由 STMfan 于 2026-10-11 确认。游戏商标、头像、游戏图标和其它第三方素材不被重新授权；字体继续遵守 OFL，范围见 [NOTICE](NOTICE) 与 [ASSETS.md](docs/ASSETS.md)。候选分析与已安装依赖核查见 [LICENSE-REVIEW.md](docs/LICENSE-REVIEW.md)。逐包证据见 `docs/dependency-licenses.json` 与 `docs/licenses/`，发布产物包含 `THIRD_PARTY_NOTICES.txt` 和 `PROJECT_LICENSE.txt`。
