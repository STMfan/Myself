# STMfan · Sublunary Sphere

个人介绍网页。探月下，尘世万象。

Vite + React + TypeScript + Tailwind CSS v4 + Framer Motion。最终配色为用户确认的「极地信号」；默认暗色、中文，支持快速切换并保存偏好。

## 本地开发

```powershell
./scripts/local.ps1 install
./scripts/local.ps1 dev
```

访问 http://127.0.0.1:5173/ ，配色提案位于 http://127.0.0.1:5173/themes.html 。`public/themes.html` 也可直接作为静态文件查看。依赖在 `node_modules`，Bun 缓存与安装临时文件在工作区 `.cache`，不会安装项目全局依赖。已安装的 Bun、Node 等系统工具直接复用。

```powershell
./scripts/local.ps1 licenses
./scripts/local.ps1 build
./scripts/local.ps1 check
```

其他平台：`bun install --frozen-lockfile`、`bun run dev`、`bun run licenses`、`bun run build:pages`、`bun run check:site`。版本见 `.bun-version` / `.node-version`。

## 内容补充

在 `src/content.ts` 修改个人信息与双语内容。`projects` / `articles` 添加真实标题、描述、URL 与标签后，占位卡片自动变为可点击作品。`characters` 的 `art` 字段接收透明全身或半身立绘。素材来源与版权边界见 [ASSETS.md](docs/ASSETS.md)。

## 交互

连续页面与章节悬浮导航；滚动月球视差；技术与角色标签支持方向键、Home / End；QQ 与 Minecraft ID 支持复制反馈。触控操作不依赖 hover，窄屏游戏架横向滑动；支持 `prefers-reduced-motion`、键盘焦点、跳到正文及安全区域。

## 发布与协议

Cloudflare Pages 构建说明见 [DEPLOYMENT.md](docs/DEPLOYMENT.md)。已准备 GitHub 构建流水线，未公开部署。

项目源码协议由仓库所有者选择，当前 `package.json` 以 `UNLICENSED` 表示尚未授权，未擅自添加 LICENSE。候选与已安装依赖核查见 [LICENSE-REVIEW.md](docs/LICENSE-REVIEW.md)。逐包证据见 `docs/dependency-licenses.json` 与 `docs/licenses/`，发布产物包含 `THIRD_PARTY_NOTICES.txt`。游戏商标、头像、第三方素材不自动适用未来源码协议。
