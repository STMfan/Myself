export type Locale = 'zh' | 'en';

export type Text = Record<Locale, string>;

export const CONTACT = {
  email: 'stmfanofficial@gmail.com',
  qq: '3626599388',
  github: 'https://github.com/STMfan',
  bilibili: 'https://space.bilibili.com/625979245',
  playlist:
    'https://space.bilibili.com/625979245/favlist?fid=4151524245',
  maibotDocs: 'https://docs.mai-mai.org/',
  avatar: 'https://github.com/STMfan.png?size=320',
  maibotImage:
    'https://raw.githubusercontent.com/Mai-with-u/.github/main/profile/assets/maimai2.png',
  playlistCover:
    'https://i1.hdslb.com/bfs/archive/5c8ee48913bdb5b994901950ab9047ae170af189.jpg@672w_378h_1c.webp',
} as const;

export const NAV_ITEMS: { id: string; label: Text }[] = [
  { id: 'manifesto', label: { zh: '手记', en: 'Notes' } },
  { id: 'workshop', label: { zh: '工作台', en: 'Workshop' } },
  { id: 'commission', label: { zh: '委托', en: 'Commissions' } },
  { id: 'maibot', label: { zh: '社区', en: 'Community' } },
  { id: 'games', label: { zh: '游戏', en: 'Games' } },
  { id: 'characters', label: { zh: '角色', en: 'Characters' } },
  { id: 'contact', label: { zh: '联系', en: 'Contact' } },
];

export interface Copy {
  meta: {
    title: string;
    description: string;
  };
  ui: {
    langLabel: string;
    themeLabel: string;
    themeToDark: string;
    themeToLight: string;
    menuOpen: string;
    menuClose: string;
    skip: string;
    preloaderLine: string;
    preloaderNote: string;
    copy: string;
    copied: string;
    close: string;
    backTop: string;
    source: string;
    license: string;
  };
  hero: {
    kicker: string;
    slogan: [string, string];
    latin: [string, string];
    intro: string;
    primary: string;
    secondary: string;
    coordinates: string;
    status: string;
  };
  manifesto: {
    label: string;
    lead: string;
    lines: string[];
    aside: string;
  };
  workshop: {
    label: string;
    title: string;
    lede: string;
    stack: string;
    items: {
      id: string;
      kicker: string;
      title: string;
      body: string;
      detail: string;
    }[];
  };
  commission: {
    label: string;
    title: string;
    lede: string;
    availability: string;
    items: { id: string; title: string; body: string }[];
    noteTitle: string;
    note: string;
    cta: string;
  };
  maibot: {
    label: string;
    title: string;
    body: string;
    link: string;
  };
  games: {
    label: string;
    title: string;
    lede: string;
    handleLabel: string;
    openLabel: string;
  };
  characters: {
    label: string;
    title: string;
    lede: string;
    hint: string;
    sigilAlt: string;
  };
  contact: {
    label: string;
    title: string;
    lede: string;
    emailLabel: string;
    qqLabel: string;
    playlistTitle: string;
    playlistNote: string;
    socialLabel: string;
  };
  footer: {
    line: string;
    credits: string;
    rights: string;
  };
}

export const site: Record<Locale, Copy> = {
  zh: {
    meta: {
      title: 'STMfan | 探月下，尘世万象',
      description:
        'STMfan，在校学生与个人开发者。Python / FastAPI 后端、Debian 服务器运维、全栈 Vibe Coding。探月下，尘世万象。',
    },
    ui: {
      langLabel: '切换语言',
      themeLabel: '切换主题',
      themeToDark: '切换到暗色',
      themeToLight: '切换到亮色',
      menuOpen: '打开菜单',
      menuClose: '关闭菜单',
      skip: '跳到正文',
      preloaderLine: '正在对准月下',
      preloaderNote: '一镜到底 / one continuous take',
      copy: '复制',
      copied: '已复制',
      close: '关闭',
      backTop: '回到月面',
      source: '仓库',
      license: 'MIT 许可',
    },
    hero: {
      kicker: '月下自述 / Sublunary',
      slogan: ['探月下，', '尘世万象'],
      latin: ['To Decipher', 'the Sublunary Sphere.'],
      intro:
        '我是 STMfan。写 Python 与 FastAPI，照看几台 Debian 服务器，也把模糊的想法用一句句提示词推成能跑的东西。',
      primary: '发起咨询',
      secondary: '查看 GitHub',
      coordinates: '31.2°N 121.5°E · MARE SERENITATIS',
      status: '在校学生 · 个人开发者',
    },
    manifesto: {
      label: '手记',
      lead: '我住在月亮与尘世之间。',
      lines: [
        '上面是理想主义的夜空。',
        '下面是需要重启的服务、写坏的迁移、还没跑通的接口。',
        '我的工作很小：让它继续运行，让一个想法变成别人能打开的页面。',
      ],
      aside: '探月下，尘世万象。',
    },
    workshop: {
      label: '工作台',
      title: '四件反复做的事',
      lede: '工具会换，习惯不会。先把边界画清楚，再让它跑起来。',
      stack:
        'Python · FastAPI · Debian · systemd · Nginx · Docker · SQLite · PostgreSQL · Prompt Engineering · Dart / Flutter',
      items: [
        {
          id: 'backend',
          kicker: '后端 / Backend',
          title: 'Python 与 FastAPI',
          body: '从数据模型、鉴权到定时任务，我习惯先把边界画清楚，再让接口跑起来。',
          detail: 'REST 设计 · 鉴权 · 任务队列 · 数据迁移',
        },
        {
          id: 'ops',
          kicker: '运维 / Operations',
          title: 'Debian 与几台服务器',
          body: 'systemd、Nginx、备份与监控都由我自己维护。出故障时，先读日志再动手。',
          detail: '部署 · 反向代理 · 备份 · 监控 · 故障处理',
        },
        {
          id: 'vibe',
          kicker: '全栈 / Vibe Coding',
          title: 'Prompt Engineering',
          body: '把模糊的需求拆成可验证的小步骤，和模型一起把产品写到能上线为止。',
          detail: '需求拆解 · 代码评审 · 迭代节奏 · 交付',
        },
        {
          id: 'dart',
          kicker: '移动端 / Mobile',
          title: 'Dart 与 Flutter',
          body: '短暂学过一阵。知道它在移动端能做什么，也清楚自己更偏爱服务端。',
          detail: 'Widget 组合 · 状态管理 · 基础动效',
        },
      ],
    },
    commission: {
      label: '委托',
      title: '可以找我做的事',
      lede: '正在接下偏小型的委托。范围清楚、周期短、交付干净的活，最合适。',
      availability: '可接委托',
      items: [
        {
          id: 'backend',
          title: '后端开发',
          body: '从零搭一套 FastAPI 服务，或接手一套需要整理的后端。',
        },
        {
          id: 'ops',
          title: '长期服务器运维',
          body: 'Debian 环境、部署、备份、监控与故障处理，按月陪跑。',
        },
        {
          id: 'vibe',
          title: '全栈 Vibe Coding',
          body: '从一个想法到可访问的站点与接口，一起把它做完。',
        },
      ],
      noteTitle: '也会无偿帮忙',
      note: '对感兴趣的开源项目，我愿意无偿提供文档、部署与后端上的帮助。',
      cta: '发起咨询',
    },
    maibot: {
      label: '社区',
      title: 'MaiBot',
      body: '在 MaiBot 的文档与社区里做过一点事：补过说明，也接过一些人的问题。它让我第一次意识到，写清楚一件事，和写出来同样重要。',
      link: '打开 MaiBot 文档',
    },
    games: {
      label: '游戏',
      title: '常玩的几款',
      lede: '账号随手记在这里。遇到，就一起打一局。',
      handleLabel: '账号',
      openLabel: '打开',
    },
    characters: {
      label: '角色',
      title: '偏爱的名字',
      lede: '五个我会反复回看的角色。选中一个，看它的徽记亮起来。',
      hint: '悬停或聚焦以点亮',
      sigilAlt: '徽记',
    },
    contact: {
      label: '联系',
      title: '说点什么',
      lede: '有一个小项目，或只是想说说话，都可以。',
      emailLabel: '邮箱',
      qqLabel: 'QQ',
      playlistTitle: '歌单',
      playlistNote: '一些循环播放的背景音，写代码时开着。',
      socialLabel: '别处',
    },
    footer: {
      line: '以一个连续的长镜头写成。',
      credits: '站点、文案与代码：STMfan',
      rights: '© 2026 STMfan',
    },
  },
  en: {
    meta: {
      title: 'STMfan | To Decipher the Sublunary Sphere.',
      description:
        'STMfan, student and independent developer. Python and FastAPI backends, Debian server operations, full stack vibe coding. To decipher the sublunary sphere.',
    },
    ui: {
      langLabel: 'Switch language',
      themeLabel: 'Switch theme',
      themeToDark: 'Switch to dark',
      themeToLight: 'Switch to light',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      skip: 'Skip to content',
      preloaderLine: 'Aligning to the sublunary',
      preloaderNote: 'one continuous take',
      copy: 'Copy',
      copied: 'Copied',
      close: 'Close',
      backTop: 'Back to the surface',
      source: 'Source',
      license: 'MIT license',
    },
    hero: {
      kicker: 'Sublunary / 月下',
      slogan: ['To Decipher', 'the Sublunary Sphere.'],
      latin: ['探月下，', '尘世万象'],
      intro:
        'I am STMfan. I build with Python and FastAPI, keep a handful of Debian servers alive, and push vague ideas into running products one prompt at a time.',
      primary: 'Start a brief',
      secondary: 'See GitHub',
      coordinates: '31.2°N 121.5°E · MARE SERENITATIS',
      status: 'Student · Independent developer',
    },
    manifesto: {
      label: 'Notes',
      lead: 'I live between the moon and the ground.',
      lines: [
        "Above is an idealist's night sky.",
        'Below: a service that needs a restart, a migration gone wrong, an endpoint that still will not answer.',
        'My work is small. Keep it running, and turn an idea into a page someone can open.',
      ],
      aside: 'To decipher the sublunary sphere.',
    },
    workshop: {
      label: 'Workshop',
      title: 'Four things I keep doing',
      lede: 'Tools change, habits do not. Draw the boundary first, then make it run.',
      stack:
        'Python · FastAPI · Debian · systemd · Nginx · Docker · SQLite · PostgreSQL · Prompt Engineering · Dart / Flutter',
      items: [
        {
          id: 'backend',
          kicker: 'Backend',
          title: 'Python and FastAPI',
          body: 'From data models and auth to scheduled jobs, I draw the boundaries first, then let the endpoints run.',
          detail: 'REST design · Auth · Task queues · Migrations',
        },
        {
          id: 'ops',
          kicker: 'Operations',
          title: 'Debian and a few servers',
          body: 'systemd, Nginx, backups and monitoring, all kept by hand. When something falls over, read the logs before touching anything.',
          detail: 'Deployments · Reverse proxy · Backups · Monitoring',
        },
        {
          id: 'vibe',
          kicker: 'Full stack',
          title: 'Prompt engineering',
          body: 'Breaking a vague requirement into verifiable steps, then writing the product with a model until it ships.',
          detail: 'Scoping · Code review · Iteration · Delivery',
        },
        {
          id: 'dart',
          kicker: 'Mobile',
          title: 'Dart and Flutter',
          body: 'Studied for a while. I know what it can do on mobile, and that I still prefer the server side.',
          detail: 'Widgets · State management · Basic motion',
        },
      ],
    },
    commission: {
      label: 'Commissions',
      title: 'What I can build for you',
      lede: 'I take small commissions. Clear scope, short cycles, clean handover.',
      availability: 'Open for work',
      items: [
        {
          id: 'backend',
          title: 'Backend development',
          body: 'A FastAPI service from scratch, or a backend that needs tidying up.',
        },
        {
          id: 'ops',
          title: 'Ongoing server operations',
          body: 'Debian, deployment, backups, monitoring and incident handling, month by month.',
        },
        {
          id: 'vibe',
          title: 'Full stack vibe coding',
          body: 'From an idea to a site and API someone can actually open.',
        },
      ],
      noteTitle: 'Also free of charge',
      note: 'For open source projects I care about, I happily help with docs, deployment and backend work at no cost.',
      cta: 'Start a brief',
    },
    maibot: {
      label: 'Community',
      title: 'MaiBot',
      body: 'I did a little work in the MaiBot documentation and community: filled in guides, answered questions. It taught me that explaining something clearly matters as much as building it.',
      link: 'Open the MaiBot docs',
    },
    games: {
      label: 'Games',
      title: 'What I play',
      lede: 'Handles are written down here. If we meet, let us play a round.',
      handleLabel: 'Handle',
      openLabel: 'Open',
    },
    characters: {
      label: 'Characters',
      title: 'Favourites',
      lede: 'Five names I keep coming back to. Pick one and let its sigil light up.',
      hint: 'Hover or focus to illuminate',
      sigilAlt: 'Sigil',
    },
    contact: {
      label: 'Contact',
      title: 'Say something',
      lede: 'A small project, or simply a conversation. Both are welcome.',
      emailLabel: 'Email',
      qqLabel: 'QQ',
      playlistTitle: 'Playlist',
      playlistNote: 'Ambient loops I keep on while writing code.',
      socialLabel: 'Elsewhere',
    },
    footer: {
      line: 'Written as one continuous take.',
      credits: 'Site, copy and code by STMfan',
      rights: '© 2026 STMfan',
    },
  },
};

export interface GameEntry {
  id: string;
  name: Text;
  latin: Text;
  handle: Text;
  href: string;
  year: string;
  tag: Text;
}

export const games: GameEntry[] = [
  {
    id: 'phigros',
    name: { zh: 'Phigros', en: 'Phigros' },
    latin: { zh: '音乐节奏 / Rhythm', en: 'Rhythm' },
    handle: { zh: '未提供账号', en: 'Handle not shared' },
    href: 'https://zh.moegirl.org.cn/Phigros',
    year: '2019',
    tag: { zh: '音游', en: 'Rhythm' },
  },
  {
    id: 'delta',
    name: { zh: '三角洲行动', en: 'Delta Force' },
    latin: { zh: 'Delta Force', en: '三角洲行动' },
    handle: { zh: '未提供账号', en: 'Handle not shared' },
    href: 'https://df.qq.com/',
    year: '2024',
    tag: { zh: '战术射击', en: 'Tactical FPS' },
  },
  {
    id: 'genshin',
    name: { zh: '原神', en: 'Genshin Impact' },
    latin: { zh: 'Genshin Impact', en: '原神' },
    handle: { zh: 'UID 279459622', en: 'UID 279459622' },
    href: 'https://genshin.hoyoverse.com/en/home',
    year: '2020',
    tag: { zh: '开放世界', en: 'Open world' },
  },
  {
    id: 'zzz',
    name: { zh: '绝区零', en: 'Zenless Zone Zero' },
    latin: { zh: 'Zenless Zone Zero', en: '绝区零' },
    handle: { zh: 'UID 14846660', en: 'UID 14846660' },
    href: 'https://zzz.hoyoverse.com/',
    year: '2024',
    tag: { zh: '动作', en: 'Action' },
  },
  {
    id: 'minecraft',
    name: { zh: 'Minecraft', en: 'Minecraft' },
    latin: { zh: 'Minecraft', en: 'Minecraft' },
    handle: { zh: 'STM__fan', en: 'STM__fan' },
    href: 'https://www.minecraft.net/',
    year: '2011',
    tag: { zh: '沙盒', en: 'Sandbox' },
  },
];

export interface CharacterEntry {
  id: string;
  zh: string;
  en: string;
  origin: Text;
  sigil: string;
  tone: string;
}

export const characters: CharacterEntry[] = [
  {
    id: 'wriothesley',
    zh: '莱欧斯利',
    en: 'Wriothesley',
    origin: { zh: '原神 · 梅洛彼得堡', en: 'Genshin Impact' },
    sigil: '/assets/art/sigil-wriothesley.webp',
    tone: 'frost',
  },
  {
    id: 'varka',
    zh: '法尔伽',
    en: 'Varka',
    origin: { zh: '原神 · 西风骑士团', en: 'Genshin Impact' },
    sigil: '/assets/art/sigil-varka.webp',
    tone: 'storm',
  },
  {
    id: 'lycaon',
    zh: '莱卡恩',
    en: 'Von Lycaon',
    origin: { zh: '绝区零 · 维多利亚家政', en: 'Zenless Zone Zero' },
    sigil: '/assets/art/sigil-lycaon.webp',
    tone: 'ice',
  },
  {
    id: 'vyron',
    zh: '威龙',
    en: 'Vyron',
    origin: { zh: '三角洲行动', en: 'Delta Force' },
    sigil: '/assets/art/sigil-vyron.webp',
    tone: 'signal',
  },
  {
    id: 'gizmo',
    zh: '比特',
    en: 'Gizmo',
    origin: { zh: '绝区零', en: 'Zenless Zone Zero' },
    sigil: '/assets/art/sigil-gizmo.webp',
    tone: 'ember',
  },
];
