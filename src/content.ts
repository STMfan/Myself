export type Language = 'zh' | 'en';
export type Localized = { zh: string; en: string };
export const text = (zh: string, en: string): Localized => ({ zh, en });

export const profile = {
  name: 'STMfan',
  github: 'https://github.com/STMfan',
  email: 'stmfanofficial@gmail.com',
  bilibili: 'https://space.bilibili.com/625979245',
  qq: '3626599388',
  minecraft: 'STM__fan',
  playlist: 'https://space.bilibili.com/625979245/favlist?fid=4151524245',
};

export const skills = [
  {
    id: 'backend', name: 'Python / FastAPI', tag: text('后端开发', 'BACKEND'),
    title: text('让想法，有迹可循。', 'Give ideas a structure.'),
    description: text('丰富的 Python 与 FastAPI 后端搭建经验，把想法接入真实的服务。', 'Extensive experience building Python and FastAPI backends, bringing ideas into working services.'),
    nodes: [text('请求', 'Request'), text('类型验证', 'Validation'), text('业务逻辑', 'Service'), text('响应', 'Response')],
    tools: ['Python', 'FastAPI', 'API'],
  },
  {
    id: 'ops', name: 'Debian / Operations', tag: text('服务器运维', 'OPERATIONS'),
    title: text('照看每一处，长明的灯。', 'Keep the lights on.'),
    description: text('熟悉 Debian，拥有多个私人服务器。在部署与长期维护中积累运维实操经验。', 'Familiar with Debian, with multiple private servers and hands-on experience in deployment and ongoing maintenance.'),
    nodes: [text('系统', 'System'), text('部署', 'Deploy'), text('维护', 'Maintain'), text('服务', 'Serve')],
    tools: ['Debian', 'Linux', 'Servers'],
  },
  {
    id: 'vibe', name: 'Vibe Coding', tag: text('全栈构建', 'FULL STACK'),
    title: text('从一句话，到一个世界。', 'From a prompt to a world.'),
    description: text('擅长全栈 Vibe Coding，熟悉 Prompt Engineering。让意图、实现与验证连成一线。', 'Full-stack Vibe Coding and Prompt Engineering. Connecting intention, implementation, and verification.'),
    nodes: [text('意图', 'Intent'), text('提示', 'Prompt'), text('构建', 'Build'), text('验证', 'Verify')],
    tools: ['Prompt Engineering', 'Full Stack', 'AI'],
  },
  {
    id: 'flutter', name: 'Dart / Flutter', tag: text('曾经探索', 'EXPLORED'),
    title: text('也曾，探向另一块屏幕。', 'An encounter with another screen.'),
    description: text('短暂学习过 Dart 与 Flutter，探索跨平台应用的另一种表达。', 'Briefly studied Dart and Flutter, exploring another way to build cross-platform applications.'),
    nodes: [text('Dart', 'Dart'), text('组件', 'Widgets'), text('布局', 'Layout'), text('屏幕', 'Screen')],
    tools: ['Dart', 'Flutter'],
  },
];

// Add real entries here. An omitted URL renders a quiet placeholder, never a dead link.
export type Work = { id: string; title?: Localized; description?: Localized; url?: string; tags?: string[] };
export const projects: Work[] = [{ id: 'project-1' }, { id: 'project-2' }];
export const articles: Work[] = [{ id: 'article-1' }, { id: 'article-2' }];

export const games = [
  { id: 'phigros', name: text('Phigros', 'Phigros'), genre: text('节奏之间', 'Between beats'), image: '/assets/games/phigros.webp', url: 'https://apps.apple.com/app/id1454809109' },
  { id: 'delta', name: text('三角洲行动', 'Delta Force'), genre: text('并肩行动', 'Side by side'), image: '/assets/games/delta.webp', url: 'https://df.qq.com/' },
  { id: 'genshin', name: text('原神', 'Genshin Impact'), genre: text('漫游提瓦特', 'Across Teyvat'), image: '/assets/games/genshin.webp', url: 'https://genshin.hoyoverse.com/en/home' },
  { id: 'zzz', name: text('绝区零', 'Zenless Zone Zero'), genre: text('新艾利都来电', 'New Eridu calling'), image: '/assets/games/zzz.webp', url: 'https://zzz.hoyoverse.com/' },
  { id: 'minecraft', name: text('Minecraft', 'Minecraft'), genre: text('方块，亦是世界', 'A world in blocks'), image: '/assets/games/minecraft.webp', url: 'https://www.minecraft.net/' },
];

// `art` accepts a full- or half-body transparent image stored in public/assets/characters/.
// Add source/rights evidence to docs/ASSETS.md when supplying an illustration.
export const characters: { id: string; name: Localized; roman: string; art?: string }[] = [
  { id: 'wriothesley', name: text('莱欧斯利', 'Wriothesley'), roman: 'WRIOTHESLEY' },
  { id: 'varka', name: text('法尔伽', 'Varka'), roman: 'VARKA' },
  { id: 'lycaon', name: text('莱卡恩', 'Lycaon'), roman: 'LYCAON' },
  { id: 'vyron', name: text('威龙', 'Vyron'), roman: 'VYRON' },
  { id: 'bit', name: text('比特', 'Bit'), roman: 'BIT' },
];
