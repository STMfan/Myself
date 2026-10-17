export type Locale = 'zh' | 'en';

export type Text = Record<Locale, string>;

export const CONTACT = {
  email: 'stmfanofficial@gmail.com',
  qq: '3626599388',
  github: 'https://github.com/STMfan',
  bilibili: 'https://space.bilibili.com/625979245',
  playlist: 'https://space.bilibili.com/625979245/favlist?fid=4151524245',
  maibotDocs: 'https://docs.mai-mai.org/',
  maibotImage: '/assets/maibot.webp',
  playlistCover: '/assets/playlist-cover.webp',
} as const;

export const NAV_ITEMS: { id: string; label: Text }[] = [
  { id: 'workshop', label: { zh: '技术能力', en: 'Skills' } },
  { id: 'opensource', label: { zh: '开源', en: 'Open source' } },
  { id: 'commission', label: { zh: '委托', en: 'Commissions' } },
  { id: 'extras', label: { zh: '画册', en: 'Gallery' } },
  { id: 'notes', label: { zh: '手记', en: 'Notes' } },
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
    copy: string;
    copied: string;
    backTop: string;
    source: string;
    license: string;
  };
  hero: {
    kicker: string;
    slogan: [string, string];
    latin: string;
    intro: string;
    primary: string;
    secondary: string;
    status: string;
    available: string;
    coordinates: string;
  };
  workshop: {
    title: string;
    lede: string;
    items: {
      id: string;
      key: Text;
      sub: Text;
      body: string;
      tags: string;
    }[];
  };
  opensource: {
    title: string;
    lede: string;
    caseLabel: string;
    caseTitle: string;
    caseBody: string;
    caseLink: string;
    slotsTitle: string;
    slots: { title: string; body: string }[];
  };
  commission: {
    title: string;
    lede: string;
    availability: string;
    paidTitle: string;
    paidNote: string;
    items: { id: string; title: string; body: string; pricing: string }[];
    freeTitle: string;
    freeBody: string;
    freeItems: string[];
    freeLink: string;
    cta: string;
  };
  extras: {
    title: string;
    lede: string;
    gamesLabel: string;
    castLabel: string;
    playlistLabel: string;
    playlistTitle: string;
    playlistNote: string;
    playlistLink: string;
    account: string;
    copyAccount: string;
  };
  notes: {
    lead: string;
    lines: string[];
    aside: string;
  };
  contact: {
    title: string;
    lede: string;
    emailLabel: string;
    qqLabel: string;
    githubLabel: string;
    bilibiliLabel: string;
    cta: string;
    ctaLine: string;
    ctaNote: string;
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
        'STMfan，在校学生与独立开发者。后端、服务器运维、全栈交付，接小型付费委托；开源项目看兴趣，有时免费。探月下，尘世万象。',
    },
    ui: {
      langLabel: '切换语言',
      themeLabel: '切换主题',
      themeToDark: '切换到暗色',
      themeToLight: '切换到亮色',
      menuOpen: '打开菜单',
      menuClose: '关闭菜单',
      skip: '跳到正文',
      copy: '复制',
      copied: '已复制',
      backTop: '回到顶部',
      source: '仓库',
      license: 'MIT 许可',
    },
    hero: {
      kicker: '在校学生 · 独立开发者',
      slogan: ['探月下，', '尘世万象。'],
      latin: 'To Decipher the Sublunary Sphere.',
      intro:
        '做后端，也照顾几台服务器。你把想法说清楚，我把它做成能上线、能长期运行的东西。',
      primary: '发起咨询',
      secondary: '看看能做什么',
      status: '学生 / 独立开发者',
      available: '现在可以接小型委托',
      coordinates: '31.2°N 121.5°E',
    },
    workshop: {
      title: '从接口到服务器',
      lede: '项目交给我，你只需要说清楚要解决什么问题。',
      items: [
        {
          id: 'backend',
          key: { zh: '后端', en: 'Backend' },
          sub: { zh: 'Backend', en: '后端' },
          body: '登录、支付、数据、定时任务，按你的业务来搭。',
          tags: 'Python · FastAPI · PostgreSQL',
        },
        {
          id: 'ops',
          key: { zh: '运维', en: 'Operations' },
          sub: { zh: 'Operations', en: '运维' },
          body: '服务器有人看着：部署、备份、监控，出问题及时处理。',
          tags: 'Debian · systemd · Nginx',
        },
        {
          id: 'fullstack',
          key: { zh: '全栈', en: 'Full stack' },
          sub: { zh: 'Full stack', en: '全栈' },
          body: '页面和接口一起交付，不用再找第二个人对接。',
          tags: 'React · Vite · API',
        },
        {
          id: 'mobile',
          key: { zh: '移动端', en: 'Mobile' },
          sub: { zh: 'Mobile', en: '移动端' },
          body: '需要 App 时，先用 Flutter 把核心流程做出来。',
          tags: 'Dart · Flutter',
        },
      ],
    },
    opensource: {
      title: '做过的事',
      lede: '在 MaiBot 的文档和社区里帮过忙。也在这里留了位置，给接下来的项目。',
      caseLabel: '开源贡献',
      caseTitle: 'MaiBot 文档与社区',
      caseBody: '补过文档，也回答过社区里的问题。',
      caseLink: '打开 MaiBot 文档',
      slotsTitle: '更多项目，正在整理',
      slots: [
        { title: '项目一', body: '整理中' },
        { title: '项目二', body: '整理中' },
        { title: '项目三', body: '整理中' },
      ],
    },
    commission: {
      title: '可以这样合作',
      lede: '小型委托优先。开源项目看兴趣，有时可以免费。',
      availability: '现在可以接',
      paidTitle: '付费委托',
      paidNote: '先谈清范围和报价，再开工。',
      items: [
        {
          id: 'backend',
          title: '后端开发',
          body: '一套能上线的接口服务，或把现有后端整理干净。',
          pricing: '按项目',
        },
        {
          id: 'ops',
          title: '长期运维',
          body: '服务器交给我：部署、备份、监控与故障处理。',
          pricing: '按月',
        },
        {
          id: 'fullstack',
          title: '全栈交付',
          body: '页面和接口一起做完，你只需要验收。',
          pricing: '按项目',
        },
      ],
      freeTitle: '看兴趣，也许免费',
      freeBody: '付费委托是默认。开源项目如果正好是我感兴趣的，可以考虑免费参与。',
      freeItems: ['文档整理', '部署与迁移', '后端排查'],
      freeLink: '在 GitHub 找我',
      cta: '发起咨询',
    },
    extras: {
      title: '工作之外',
      lede: '常玩的几款游戏，几个偏爱的角色，还有写代码时循环的歌单。',
      gamesLabel: '游戏',
      castLabel: '角色',
      playlistLabel: '歌单',
      playlistTitle: '写代码时的背景音',
      playlistNote: '循环很久也不腻的几首。',
      playlistLink: '在 Bilibili 打开',
      account: '账号',
      copyAccount: '复制账号',
    },
    notes: {
      lead: '我住在月亮与尘世之间。',
      lines: [
        '上面是理想主义的夜空。',
        '下面是需要重启的服务、写坏的迁移、还没跑通的接口。',
        '我的工作很小：让它继续运行，让一个想法变成别人能打开的页面。',
      ],
      aside: '探月下，尘世万象。',
    },
    contact: {
      title: '说点什么',
      lede: '有个小项目，或只是想聊聊，都可以。',
      emailLabel: '邮箱',
      qqLabel: 'QQ',
      githubLabel: 'GitHub',
      bilibiliLabel: 'Bilibili',
      cta: '发起咨询',
      ctaLine: '简单说说你的想法，我会尽快回复。',
      ctaNote: '通常一天内回信。',
    },
    footer: {
      line: '手工搭建，长期维护。',
      credits: '站点、文案与代码：STMfan',
      rights: '© 2026 STMfan',
    },
  },
  en: {
    meta: {
      title: 'STMfan | To Decipher the Sublunary Sphere.',
      description:
        'STMfan, student and independent developer. Backends, server operations and full stack delivery. Small paid commissions, plus selective free help for open source projects that interest me. To decipher the sublunary sphere.',
    },
    ui: {
      langLabel: 'Switch language',
      themeLabel: 'Switch theme',
      themeToDark: 'Switch to dark',
      themeToLight: 'Switch to light',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
      skip: 'Skip to content',
      copy: 'Copy',
      copied: 'Copied',
      backTop: 'Back to top',
      source: 'Source',
      license: 'MIT license',
    },
    hero: {
      kicker: 'Student · Independent developer',
      slogan: ['To Decipher', 'the Sublunary Sphere.'],
      latin: '探月下，尘世万象。',
      intro:
        'I build backends and keep servers running. Tell me what needs to work, and I will make it ship, and keep shipping.',
      primary: 'Start a brief',
      secondary: 'See what I build',
      status: 'Student / independent developer',
      available: 'Open for small commissions',
      coordinates: '31.2°N 121.5°E',
    },
    workshop: {
      title: 'From API to server',
      lede: 'Tell me what needs to work. I build the rest.',
      items: [
        {
          id: 'backend',
          key: { zh: '后端', en: 'Backend' },
          sub: { zh: 'Backend', en: '后端' },
          body: 'Accounts, payments, data and scheduled jobs, shaped around your product.',
          tags: 'Python · FastAPI · PostgreSQL',
        },
        {
          id: 'ops',
          key: { zh: '运维', en: 'Operations' },
          sub: { zh: 'Operations', en: '运维' },
          body: 'Someone owns the servers: deploys, backups, monitoring and incidents.',
          tags: 'Debian · systemd · Nginx',
        },
        {
          id: 'fullstack',
          key: { zh: '全栈', en: 'Full stack' },
          sub: { zh: 'Full stack', en: '全栈' },
          body: 'Pages and APIs delivered together, no second vendor to coordinate.',
          tags: 'React · Vite · API',
        },
        {
          id: 'mobile',
          key: { zh: '移动端', en: 'Mobile' },
          sub: { zh: 'Mobile', en: '移动端' },
          body: 'When you need an app, Flutter gets the core flow running first.',
          tags: 'Dart · Flutter',
        },
      ],
    },
    opensource: {
      title: 'Things I have shipped',
      lede: 'I helped with MaiBot docs and community. Here is room for what comes next.',
      caseLabel: 'Open source',
      caseTitle: 'MaiBot docs and community',
      caseBody: 'I filled in guides and answered questions in the community.',
      caseLink: 'Open the MaiBot docs',
      slotsTitle: 'More projects, in progress',
      slots: [
        { title: 'Project one', body: 'In progress' },
        { title: 'Project two', body: 'In progress' },
        { title: 'Project three', body: 'In progress' },
      ],
    },
    commission: {
      title: 'Ways to work together',
      lede: 'Small jobs first. Open source depends on how much it interests me; sometimes I help for free.',
      availability: 'Open for work',
      paidTitle: 'Paid work',
      paidNote: 'Scope and price agreed before I start.',
      items: [
        {
          id: 'backend',
          title: 'Backend development',
          body: 'An API service ready to ship, or a backend cleaned up.',
          pricing: 'Per project',
        },
        {
          id: 'ops',
          title: 'Ongoing server care',
          body: 'I look after the server: deploys, backups, monitoring and incidents.',
          pricing: 'Monthly',
        },
        {
          id: 'fullstack',
          title: 'Full stack delivery',
          body: 'Pages and APIs delivered together. You review, I ship.',
          pricing: 'Per project',
        },
      ],
      freeTitle: 'Free when it interests me',
      freeBody: 'Paid work is the default. If an open source project genuinely interests me, I may join for free.',
      freeItems: ['Docs', 'Deployment and migration', 'Backend debugging'],
      freeLink: 'Find me on GitHub',
      cta: 'Start a brief',
    },
    extras: {
      title: 'Outside work',
      lede: 'A few games, a few favourite characters, and the playlist I keep on while coding.',
      gamesLabel: 'Games',
      castLabel: 'Characters',
      playlistLabel: 'Playlist',
      playlistTitle: 'Background loops',
      playlistNote: 'A few tracks that never get old.',
      playlistLink: 'Open on Bilibili',
      account: 'Handle',
      copyAccount: 'Copy handle',
    },
    notes: {
      lead: 'I live between the moon and the ground.',
      lines: [
        "Above is an idealist's night sky.",
        'Below: a service to restart, a migration gone wrong, an endpoint still silent.',
        'My work is small. Keep it running, turn an idea into a page someone can open.',
      ],
      aside: 'To decipher the sublunary sphere.',
    },
    contact: {
      title: 'Say something',
      lede: 'A small project, or simply a conversation. Both are welcome.',
      emailLabel: 'Email',
      qqLabel: 'QQ',
      githubLabel: 'GitHub',
      bilibiliLabel: 'Bilibili',
      cta: 'Start a brief',
      ctaLine: 'Tell me the idea. I will get back to you soon.',
      ctaNote: 'Usually answered within a day.',
    },
    footer: {
      line: 'Hand-built, kept running.',
      credits: 'Site, copy and code by STMfan',
      rights: '© 2026 STMfan',
    },
  },
};

export interface GameEntry {
  id: string;
  name: Text;
  latin: Text;
  genre: Text;
  logo: string;
  href: string;
  account?: { label: Text; value: string };
}

export const games: GameEntry[] = [
  {
    id: 'phigros',
    name: { zh: 'Phigros', en: 'Phigros' },
    latin: { zh: '音乐节奏', en: 'Rhythm' },
    genre: { zh: '音游', en: 'Rhythm game' },
    logo: '/assets/games/phigros.webp',
    href: 'https://zh.moegirl.org.cn/Phigros',
  },
  {
    id: 'delta',
    name: { zh: '三角洲行动', en: 'Delta Force' },
    latin: { zh: 'Delta Force', en: '三角洲行动' },
    genre: { zh: '战术射击', en: 'Tactical FPS' },
    logo: '/assets/games/delta.webp',
    href: 'https://df.qq.com/',
  },
  {
    id: 'genshin',
    name: { zh: '原神', en: 'Genshin Impact' },
    latin: { zh: 'Genshin Impact', en: '原神' },
    genre: { zh: '开放世界', en: 'Open world' },
    logo: '/assets/games/genshin.webp',
    href: 'https://genshin.hoyoverse.com/en/home',
    account: { label: { zh: 'UID', en: 'UID' }, value: '279459622' },
  },
  {
    id: 'zzz',
    name: { zh: '绝区零', en: 'Zenless Zone Zero' },
    latin: { zh: 'Zenless Zone Zero', en: '绝区零' },
    genre: { zh: '都市动作', en: 'Urban action' },
    logo: '/assets/games/zzz.webp',
    href: 'https://zzz.hoyoverse.com/',
    account: { label: { zh: 'UID', en: 'UID' }, value: '14846660' },
  },
  {
    id: 'minecraft',
    name: { zh: 'Minecraft', en: 'Minecraft' },
    latin: { zh: 'Minecraft', en: 'Minecraft' },
    genre: { zh: '沙盒', en: 'Sandbox' },
    logo: '/assets/games/minecraft.webp',
    href: 'https://www.minecraft.net/',
    account: { label: { zh: 'ID', en: 'ID' }, value: 'STM__fan' },
  },
];

export interface CharacterEntry {
  id: string;
  zh: string;
  en: string;
  origin: Text;
  art: string;
  face: string;
  framed?: boolean;
}

export const characters: CharacterEntry[] = [
  {
    id: 'wriothesley',
    zh: '莱欧斯利',
    en: 'Wriothesley',
    origin: { zh: '原神', en: 'Genshin Impact' },
    art: '/assets/cast/wriothesley.webp',
    face: '/assets/cast/wriothesley-face.webp',
  },
  {
    id: 'varka',
    zh: '法尔伽',
    en: 'Varka',
    origin: { zh: '原神', en: 'Genshin Impact' },
    art: '/assets/cast/varka.webp',
    face: '/assets/cast/varka-face.webp',
  },
  {
    id: 'lycaon',
    zh: '莱卡恩',
    en: 'Von Lycaon',
    origin: { zh: '绝区零', en: 'Zenless Zone Zero' },
    art: '/assets/cast/lycaon.webp',
    face: '/assets/cast/lycaon-face.webp',
  },
  {
    id: 'vyron',
    zh: '威龙',
    en: 'Vyron',
    origin: { zh: '三角洲行动', en: 'Delta Force' },
    art: '/assets/cast/vyron.webp',
    face: '/assets/cast/vyron-face.webp',
  },
  {
    id: 'gizmo',
    zh: '比特',
    en: 'Gizmo',
    origin: { zh: '三角洲行动', en: 'Delta Force' },
    art: '/assets/cast/gizmo.webp',
    face: '/assets/cast/gizmo-face.webp',
  },
];
