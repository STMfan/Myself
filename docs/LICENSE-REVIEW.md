# 源码协议候选与依赖核查

状态：STMfan 于 2026-10-11 明确选择 **MIT**。已添加标准根目录 LICENSE，更新 package.json，并保留第三方素材和依赖的独立授权。下文保留当时用于选择的候选分析。此分析针对当前依赖与静态网页发布形态，是协议选择的技术核查，不是无条件的法律兼容性保证。

## 核查范围与证据

2026-10-11，在 Windows x64 上核查 `package.json` 所有直接依赖及实际可达的依赖、peer 与当前平台 optional 依赖，共 **54 个包实例**。同名不同版本分别计数。依据包内 LICENSE / COPYING / NOTICE / OFL 文件与 manifest 协议字段，不根据包名猜测。

`docs/dependency-licenses.json` 保存版本、用途、原始路径、证据副本与 SHA-256。`docs/licenses/` 保存完整原文，每次核查更新本工具生成的证据快照；报告中的文件列表代表本次实际依赖。`public/THIRD_PARTY_NOTICES.txt` 收录本次实际依赖的协议/声明，构建时复制到 `dist`。名为 Copyright 的图标源码不被误识别为版权声明。

| 包声明的协议 | 包实例数 | 主要范围 |
| --- | ---: | --- |
| MIT | 38 | React、Framer Motion、Phosphor 及多数工具依赖 |
| Apache-2.0 | 4 | TypeScript、sharp 等构建/素材工具 |
| Apache-2.0 AND LGPL-3.0-or-later | 1 | Windows sharp 原生包，构建/素材处理用 |
| MPL-2.0 | 4 | Lightning CSS 两个版本与对应原生包，构建用 |
| ISC | 3 | 工具链依赖 |
| BSD-3-Clause | 1 | 工具链依赖 |
| 0BSD | 1 | tslib |
| OFL-1.1 | 2 | Space Grotesk、DM Sans 字体 |

实际随网页运行/发给浏览器的依赖图是 10 个包：7 个 MIT、1 个 0BSD、2 个 OFL 字体包。没有把 sharp、TypeScript、Lightning CSS 原生工具打入网站运行代码。

核查例外与边界：

- `@rolldown/binding-win32-x64-msvc@1.2.13` 声明 MIT，但包未携带独立 LICENSE。已比对同版本 `rolldown@1.2.13` 的 MIT 声明，保存它的 LICENSE 作为明确标记的共享上游证据；不声称原生包原本含有该文件。
- sharp 的 Windows 预编译包包含 libvips 与一组第三方原生库。其 README 列出 LGPLv3、MPL1.1、BSD、MIT、zlib、libpng 等更细的协议，并说明 LGPLv3 经早期 LGPL 的 “any later version” 条款使用；这份 README 也保存为证据。包的 LICENSE 本身是 Apache-2.0，不能单靠它概括所有 DLL。
- `node_modules`、缓存与原生 DLL 不进入 Git 或 `dist`。当前没有分发/修改这些原生库。若未来打包桌面程序、Docker 开发镜像或分发依赖二进制，需要重新评估原生库与其源码/声明义务。
- Linux/macOS 的平台专用包当前没有安装，未假称已逐文件核查。GitHub Linux 流水线会在实际安装后生成该平台声明。跨平台发布应保存对应审计结果。
- OFL 字体保持独立授权且保留版权/协议，不能被重新指定为项目源码协议。当前未修改字体或使用保留名称制作衍生字体。[OFL 官方 FAQ](https://openfontlicense.org/ofl-faq/)
- 构建工具中的 MPL 文件没有被修改或作为网站运行代码分发；若将来修改/分发其代码，应按文件级义务处理。[Mozilla MPL FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)
- 游戏图标、角色素材、商标、GitHub 头像等另见 `ASSETS.md`，公开可下载不等于可被本项目开源协议再授权。

## 可选源码协议

基于当前发布形态，以下是可行候选；原有依赖声明仍需保留。

| 候选 | 适合你的意图 | 主要条件 |
| --- | --- | --- |
| **MIT（建议）** | 希望主页代码易被参考、改造和用于商业项目 | 保留版权与许可声明；不要求下游公开修改源码。[协议说明](https://choosealicense.com/licenses/mit/) |
| **Apache-2.0** | 宽松复用，同时希望明确专利许可 | 保留许可/版权，标记修改，处理上游 NOTICE；不自动授权商标。[协议说明](https://choosealicense.com/licenses/apache-2.0/) |
| **GPL-3.0-only** | 希望分发衍生程序的人继续开放源码 | 分发衍生作品需按 GPL 条件提供对应源码与权利；允许商用，不是禁止商业使用的协议。[协议说明](https://choosealicense.com/licenses/gpl-3.0/) |
| MPL-2.0 | 希望修改过的源码文件保持开放，同时允许组合其它协议的文件 | 文件级 copyleft，集成宽松；需添加文件头/源码获取声明。[官方 FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/) |

建议 MIT：当前是原创个人主页，浏览器依赖主要为宽松授权，MIT 对参考和二次创作最简单。若强调专利条款可选 Apache-2.0；若重视衍生版本持续开放可选 GPL-3.0-only 或 MPL-2.0。STMfan 已选定 MIT。

决定后操作已完成：根目录 LICENSE 与 NOTICE、`package.json` 的 `license`、README 状态均已更新；发布产物包含 `PROJECT_LICENSE.txt` 与第三方声明。第三方素材继续遵守各自权利条件，不将未获再授权的游戏素材标记为 MIT。
