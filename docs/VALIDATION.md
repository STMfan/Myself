# 验证记录

2026-10-11，本地 Windows 11 25H2，Bun 1.4.0、Node 26.8.1、Python 3.14.7、Rust 1.98.0。按用户要求执行了 fastfetch；本次未安装系统级工具或运行 Python/Rust 工程。

## 已验证

- `bun run typecheck`：通过严格 TypeScript 检查。
- `bun run build:pages`：Vite 生产构建通过。
- `bun run check:site`：检查 7 个网页引用图片、生产入口、配色 HTML、Cloudflare 响应头、第三方协议声明、打包 JavaScript 与自托管字体存在且非空。
- Codex 内置浏览器：320×740、390×844、844×390、768×1024、1440×900 视口；页面宽度未超过根节点 clientWidth，导航在视口内。
- 中文暗色与英文亮色视觉检查；语言与主题切换及刷新后的偏好保存。
- 章节锚点导航，技术标签点击及方向键切换，角色标签切换。
- Minecraft 用户名复制成功，并显示图标/状态反馈。QQ 使用相同复制逻辑，完整 QQ 文本与按钮可见。
- 减少动态效果媒体设置：唱片 `animation-name: none`，页面无横向溢出；测试后已恢复浏览器媒体默认值。
- 官方游戏图片及 GitHub 头像均有本地文件，检查未发现完成加载的损坏图片。
- 浏览器未发现运行错误。减少动态效果模拟时 Framer Motion 输出相关提示，符合预期。

## 范围限制

这是浏览器视口与交互验证，不是安卓/iOS 真机触控测试。未执行 macOS/Linux 本地构建或 Cloudflare 远程构建，未发布 Cloudflare 网站。当前协议核查为 Windows 已安装依赖图，Linux CI 将在实际运行时重新核查。

项目与文章内容待所有者补充；五个喜爱角色保留独立立绘插槽。未将占位内容视为真实项目、文章或已完成立绘。

截图保存在本地 `artifacts/screenshots/`（不进 Git）。已生成月球素材只作为装饰，未将其视为真实月球摄影或科学测量。
