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
    title: text('予以筋骨。', 'Give it sinew and bone.'),
    description: text('以丰富的 Python / FastAPI 后端经验，予想法以可运行的筋骨。', 'Python / FastAPI backend experience, giving ideas a structure that runs.'),
    tools: ['Python', 'FastAPI', 'API'],
  },
  {
    id: 'ops', name: 'Debian / Operations', tag: text('服务器运维', 'OPERATIONS'),
    title: text('赋其流明', 'Lend it lasting light.'),
    description: text('熟悉 Debian，照看多台私有服务器；从部署到维护，让灯火长明。', 'Debian and my private servers; deployment, upkeep, and keeping the lights alive.'),
    tools: ['Debian', 'Linux', 'Servers'],
  },
  {
    id: 'vibe', name: 'Vibe Coding', tag: text('全栈构建', 'FULL STACK'),
    title: text('下笔如有神助。', 'As if guided by a muse.'),
    description: text('擅长全栈 Vibe Coding，熟悉 Prompt Engineering；一念，经实现与验证成形。', 'Skilled in full-stack Vibe Coding, familiar with Prompt Engineering. Intent, implementation, verification.'),
    tools: ['Prompt Engineering', 'Full Stack', 'AI'],
  },
  {
    id: 'flutter', name: 'Dart / Flutter', tag: text('跨平台探索', 'EXPLORING'),
    title: text('画龙将要点睛', 'The dragon awaits its eyes.'),
    description: text('浅尝 Dart 与 Flutter；跨屏的画龙，尚待点睛。', 'Briefly explored Dart and Flutter; the final brushstroke awaits.'),
    tools: ['Dart', 'Flutter'],
  },
];

// Add real entries here. An omitted URL renders a quiet placeholder, never a dead link.
export type Work = { id: string; title?: Localized; description?: Localized; url?: string; tags?: string[] };
export const projects: Work[] = [{ id: 'project-1' }, { id: 'project-2' }];
export const articles: Work[] = [{ id: 'article-1' }, { id: 'article-2' }];

export const games: { id: string; name: Localized; genre: Localized; image: string; url: string; account?: { label: string; value: string } }[] = [
  { id: 'phigros', name: text('Phigros', 'Phigros'), genre: text('True Home, True World.', 'True Home, True World.'), image: '/assets/games/phigros.webp', url: 'https://apps.apple.com/app/id1454809109' },
  { id: 'delta', name: text('三角洲行动', 'Delta Force'), genre: text('我累铜泥丸！', 'Pl@y1ng wEith uuuUUU!'), image: '/assets/games/delta.webp', url: 'https://df.qq.com/' },
  { id: 'genshin', name: text('原神', 'Genshin Impact'), genre: text('向着星辰与深渊', 'Ad astra abyssosque'), image: '/assets/games/genshin.webp', url: 'https://genshin.hoyoverse.com/en/home', account: { label: 'UID', value: '279459622' } },
  { id: 'zzz', name: text('绝区零', 'Zenless Zone Zero'), genre: text('欢迎来到新艾利都', 'Welcome to New Eridu'), image: '/assets/games/zzz.webp', url: 'https://zzz.hoyoverse.com/', account: { label: 'UID', value: '14846660' } },
  { id: 'minecraft', name: text('Minecraft', 'Minecraft'), genre: text('？！强强 ！？', '?!gno7tStrong!?'), image: '/assets/games/minecraft.webp', url: 'https://www.minecraft.net/', account: { label: 'ID', value: 'STM__fan' } },
];

// `art` accepts a full- or half-body transparent image stored in public/assets/characters/.
// Add source/rights evidence to docs/ASSETS.md when supplying an illustration.
export const characters: { id: string; name: Localized; roman: string; art?: string }[] = [
  { id: 'wriothesley', name: text('莱欧斯利', 'Wriothesley'), roman: 'WRIOTHESLEY', art: '/assets/characters/wriothesley.webp' },
  { id: 'varka', name: text('法尔伽', 'Varka'), roman: 'VARKA', art: '/assets/characters/varka.webp' },
  { id: 'lycaon', name: text('莱卡恩', 'Von Lycann'), roman: 'VON LYCANN', art: '/assets/characters/lycaon.webp' },
  { id: 'vyron', name: text('威龙', 'Wang'), roman: 'WANG', art: '/assets/characters/vyron.webp' },
  { id: 'bit', name: text('比特', 'Rashid'), roman: 'RASHID', art: '/assets/characters/bit.webp' },
];
