# Cloudflare Pages 构建与部署准备

此项目是静态 Vite 网站，没有服务端、数据库或运行时密钥。当前已准备流水线，尚未创建 Cloudflare 项目或公开部署。

## 推荐：Pages Git 集成

1. 在 Cloudflare Pages 连接 `STMfan/Myself`，选择生产分支 `main`。
2. 框架预设选 Vite 或 None；根目录为仓库根目录。
3. 构建命令：`bun install --frozen-lockfile && bun run licenses && bun run build:pages && bun run check:site`。
4. 输出目录：`dist`。
5. 设置 `BUN_VERSION=1.4.0`、`NODE_VERSION=24`、`SKIP_DEPENDENCY_INSTALL=true`，由上述命令执行锁定安装。
6. 可添加自己的域名；添加后补充 HTML 的 `og:url` 与 canonical。当前未虚构生产域名。

项目的 `.bun-version`、`.node-version`、`bun.lock` 与 `bunfig.toml` 配合复现依赖。Bun 包缓存留在工作区 `.cache/bun`。Cloudflare 默认构建镜像行为应以连接时控制台与官方文档为准：https://developers.cloudflare.com/pages/configuration/build-image/ 。React/Vite 的静态输出部署指南：https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/ 。

## GitHub 构建流水线

`.github/workflows/build.yml` 在 main 推送、PR 和手动触发时锁定安装、重新生成第三方协议声明、执行类型检查与生产构建、检查发布文件，并上传 `cloudflare-pages-dist` 构建产物。

此流水线只构建。公开发布由将来配置的 Pages Git 集成完成，不在仓库放入 API Token。`public/_headers` 提供基础响应头与静态素材缓存配置；Vite 会复制到 `dist`。只有锚点导航，没有额外路由，不需要 SPA 路由函数。
