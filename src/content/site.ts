export type Locale = 'zh' | 'en';

export type Text = Record<Locale, string>;

export const CONTACT = {
  email: 'stmfanofficial@gmail.com',
  qq: '3626599388',
  github: 'https://github.com/STMfan',
  bilibili: 'https://space.bilibili.com/625979245',
  playlist: 'https://space.bilibili.com/625979245/favlist?fid=4151524245',
  maibotDocs: 'https://docs.mai-mai.org/',
  avatar: '/assets/avatar.png',
  logo: '/assets/logo.png',
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
    preloaderLine: string;
    preloaderNote: string;
    copy: string;
    copied: string;
    close: string;
    backTop: string;
    source: string;
    license: string;
    open: string;
    scrollHint: string;
  };
  hero: {
    kicker: string;
    slogan: [string, string];
    latin: [string, string];
    intro: string;
    primary: string;
    secondary: string;
    status: string;
    available: string;
    coordinates: string;
  };
  workshop: {
    label: string;
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
    label: string;
    title: string;
    lede: string;
    caseLabel: string;
    caseTitle: string;
    caseBody: string;
    caseTags: string[];
    caseLink: string;
    slotsTitle: string;
    slots: { title: string; body: string }[];
  };
  commission: {
    label: string;
    title: string;
    lede: string;
    availability: string;
    paidLabel: string;
    paidTitle: string;
    paidNote: string;
    items: { id: string; title: string; body: string; pricing: string }[];
    freeLabel: string;
    freeTitle: string;
    freeBody: string;
    freeItems: string[];
    freeLink: string;
    cta: string;
  };
  extras: {
    label: string;
    title: string;
    lede: string;
    tabs: { games: string; characters: string; playlist: string };
    gamesNote: string;
    charactersNote: string;
    playlistLabel: string;
    playlistTitle: string;
    playlistNote: string;
    playlistLink: string;
    account: string;
    copyAccount: string;
  };
  notes: {
    label: string;
    lead: string;
    lines: string[];
    aside: string;
  };
  contact: {
    label: string;
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
        'STMfan，在校学生与个人开发者。技术能力、付费委托与开源贡献。探月下，尘世万象。',
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
      open: '打开',
      scrollHint: '继续向下',
    },
    hero: {
      kicker: '在校学生 · 个人开发者',
      slogan: ['探月下，', '尘世万象'],
      latin: ['To Decipher', 'the Sublunary Sphere.'],
      intro:
        '我是 STMfan。做后端、守服务器，把念头变成能上线的产品。',
      primary: '发起咨询',
      secondary: '看看能做什么',
      status: '学生 / 独立开发者',
      available: '可接小型委托',
      coordinates: '31.2°N 121.5°E',
    },
    workshop: {
      label: '技术能力',
      title: '四个方向，长期在用',
      lede: '先把边界画清楚，再让它稳定运行。技术栈会变，习惯不会。',
      items: [
        {
          id: 'backend',
          key: { zh: '后端', en: 'Backend' },
          sub: { zh: 'Backend', en: '后端' },
          body: '接口、鉴权、任务与数据，从零搭到稳定运行。',
          tags: 'Python · FastAPI · PostgreSQL',
        },
        {
          id: 'ops',
          key: { zh: '运维', en: 'Operations' },
          sub: { zh: 'Operations', en: '运维' },
          body: 'Debian 服务器的部署、备份、监控与故障处理。',
          tags: 'Debian · systemd · Nginx',
        },
        {
          id: 'fullstack',
          key: { zh: '全栈', en: 'Full stack' },
          sub: { zh: 'Full stack', en: '全栈' },
          body: '从想法到可访问的站点与接口，用提示词把产品写完。',
          tags: 'Vibe Coding · Prompt Engineering',
        },
        {
          id: 'mobile',
          key: { zh: '移动端', en: 'Mobile' },
          sub: { zh: 'Mobile', en: '移动端' },
          body: '学过一阵 Flutter，知道它适合做什么，也更偏爱服务端。',
          tags: 'Dart · Flutter',
        },
      ],
    },
    opensource: {
      label: '开源与贡献',
      title: '做过的事，和留白的位置',
      lede: '感兴趣的项目我会无偿帮忙。自己的项目，正在一个个补上。',
      caseLabel: '案例 / Case',
      caseTitle: 'MaiBot 文档与社区',
      caseBody: '补过说明，也接过社区里的问题。',
      caseTags: ['文档', '社区', '无偿'],
      caseLink: '打开 MaiBot 文档',
      slotsTitle: '自主开源项目',
      slots: [
        { title: '待补充', body: '一个还在成形的小工具。' },
        { title: '待补充', body: '一个准备长期维护的服务。' },
        { title: '待补充', body: '留给下一个想法。' },
      ],
    },
    commission: {
      label: '付费委托',
      title: '小型、清楚、交付干净',
      lede: '接下边界清楚、周期短的活。也欢迎无偿的开源协作。',
      availability: '可接委托',
      paidLabel: '付费委托',
      paidTitle: '我能接的三类活',
      paidNote: '范围与报价先说清楚，再开工。',
      items: [
        {
          id: 'backend',
          title: '后端开发',
          body: '一套能上线的 API 服务，或整理一套已有的后端。',
          pricing: '按项目报价',
        },
        {
          id: 'ops',
          title: '长期运维',
          body: 'Debian 服务器的部署、备份、监控与故障处理。',
          pricing: '按月',
        },
        {
          id: 'fullstack',
          title: '全栈交付',
          body: '从想法到可访问的站点与接口，一起做完。',
          pricing: '按项目报价',
        },
      ],
      freeLabel: '无偿贡献',
      freeTitle: '也会免费帮忙',
      freeBody: '对感兴趣的开源项目，文档、部署与后端问题都可以找我。',
      freeItems: ['文档与说明整理', '部署与迁移', '后端问题排查'],
      freeLink: '在 GitHub 找我',
      cta: '发起咨询',
    },
    extras: {
      label: '画册',
      title: '游戏、角色与歌单',
      lede: '不重要的东西，放在同一页。点开看，或让它自己翻。',
      tabs: { games: '游戏', characters: '角色', playlist: '歌单' },
      gamesNote: '账号随手记在这里。',
      charactersNote: '五个我会反复回看的角色。',
      playlistLabel: '歌单',
      playlistTitle: '写代码时的背景音',
      playlistNote: '一些循环播放的曲子，写着代码就开着。',
      playlistLink: '在 Bilibili 打开',
      account: '账号',
      copyAccount: '复制账号',
    },
    notes: {
      label: '手记',
      lead: '我住在月亮与尘世之间。',
      lines: [
        '上面是理想主义的夜空。',
        '下面是需要重启的服务、写坏的迁移、还没跑通的接口。',
        '我的工作很小：让它继续运行，让一个想法变成别人能打开的页面。',
      ],
      aside: '探月下，尘世万象。',
    },
    contact: {
      label: '联系',
      title: '说点什么',
      lede: '有一个小项目，或只是想说说话，都可以。',
      emailLabel: '邮箱',
      qqLabel: 'QQ',
      githubLabel: 'GitHub',
      bilibiliLabel: 'Bilibili',
      cta: '发起咨询',
      ctaLine: '把范围、周期和预算发我，我来判断能不能接。',
      ctaNote: '邮件通常一天内回复。',
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
        'STMfan, student and independent developer. Skills, paid commissions and open source contributions. To decipher the sublunary sphere.',
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
      open: 'Open',
      scrollHint: 'Keep going',
    },
    hero: {
      kicker: 'Student · Independent developer',
      slogan: ['To Decipher', 'the Sublunary Sphere.'],
      latin: ['探月下，', '尘世万象'],
      intro:
        'I am STMfan. I build backends, keep servers alive, and turn ideas into products that ship.',
      primary: 'Start a brief',
      secondary: 'See what I build',
      status: 'Student / independent developer',
      available: 'Open for small work',
      coordinates: '31.2°N 121.5°E',
    },
    workshop: {
      label: 'Skills',
      title: 'Four directions I use',
      lede: 'Draw the boundary first, then keep it running. Stacks change, habits do not.',
      items: [
        {
          id: 'backend',
          key: { zh: '后端', en: 'Backend' },
          sub: { zh: 'Backend', en: '后端' },
          body: 'APIs, auth, jobs and data, built from scratch to stable.',
          tags: 'Python · FastAPI · PostgreSQL',
        },
        {
          id: 'ops',
          key: { zh: '运维', en: 'Operations' },
          sub: { zh: 'Operations', en: '运维' },
          body: 'Debian servers: deployment, backups, monitoring and incidents.',
          tags: 'Debian · systemd · Nginx',
        },
        {
          id: 'fullstack',
          key: { zh: '全栈', en: 'Full stack' },
          sub: { zh: 'Full stack', en: '全栈' },
          body: 'From idea to a site and API someone can open, written with prompts.',
          tags: 'Vibe Coding · Prompt Engineering',
        },
        {
          id: 'mobile',
          key: { zh: '移动端', en: 'Mobile' },
          sub: { zh: 'Mobile', en: '移动端' },
          body: 'Studied Flutter for a while. I know what it suits, and still prefer the server.',
          tags: 'Dart · Flutter',
        },
      ],
    },
    opensource: {
      label: 'Open source',
      title: 'Work done, room left',
      lede: 'I help open source projects for free. My own projects are coming, one at a time.',
      caseLabel: 'Case',
      caseTitle: 'MaiBot docs and community',
      caseBody: 'I filled in guides and answered questions in the community.',
      caseTags: ['Docs', 'Community', 'Free'],
      caseLink: 'Open the MaiBot docs',
      slotsTitle: 'Own projects',
      slots: [
        { title: 'To be added', body: 'A small tool still taking shape.' },
        { title: 'To be added', body: 'A service meant to run for years.' },
        { title: 'To be added', body: 'Space for the next idea.' },
      ],
    },
    commission: {
      label: 'Paid commissions',
      title: 'Small, clear, cleanly delivered',
      lede: 'I take clearly scoped, short work. Free open source help is welcome too.',
      availability: 'Open for work',
      paidLabel: 'Paid work',
      paidTitle: 'Three kinds of work I take',
      paidNote: 'Scope and price agreed first, then I start.',
      items: [
        {
          id: 'backend',
          title: 'Backend build',
          body: 'An API service ready to ship, or a backend that needs tidying.',
          pricing: 'Quoted per project',
        },
        {
          id: 'ops',
          title: 'Ongoing server care',
          body: 'Debian deployment, backups, monitoring and incident handling.',
          pricing: 'Monthly',
        },
        {
          id: 'fullstack',
          title: 'Full stack delivery',
          body: 'From an idea to a site and API someone can open.',
          pricing: 'Quoted per project',
        },
      ],
      freeLabel: 'Free help',
      freeTitle: 'Also free of charge',
      freeBody: 'For open source projects I care about: docs, deployment and backend help.',
      freeItems: ['Docs and guides', 'Deployment and migration', 'Backend troubleshooting'],
      freeLink: 'Find me on GitHub',
      cta: 'Start a brief',
    },
    extras: {
      label: 'Gallery',
      title: 'Games, characters, playlist',
      lede: 'The less important things, on one page. Click, or let them turn.',
      tabs: { games: 'Games', characters: 'Characters', playlist: 'Playlist' },
      gamesNote: 'Handles are written down here.',
      charactersNote: 'Five names I keep coming back to.',
      playlistLabel: 'Playlist',
      playlistTitle: 'Background loops while coding',
      playlistNote: 'A few tracks I leave on while writing code.',
      playlistLink: 'Open on Bilibili',
      account: 'Handle',
      copyAccount: 'Copy handle',
    },
    notes: {
      label: 'Notes',
      lead: 'I live between the moon and the ground.',
      lines: [
        "Above is an idealist's night sky.",
        'Below: a service to restart, a migration gone wrong, an endpoint still silent.',
        'My work is small. Keep it running, turn an idea into a page someone can open.',
      ],
      aside: 'To decipher the sublunary sphere.',
    },
    contact: {
      label: 'Contact',
      title: 'Say something',
      lede: 'A small project, or simply a conversation. Both are welcome.',
      emailLabel: 'Email',
      qqLabel: 'QQ',
      githubLabel: 'GitHub',
      bilibiliLabel: 'Bilibili',
      cta: 'Start a brief',
      ctaLine: 'Send the scope, timeline and budget. I will tell you if I can take it.',
      ctaNote: 'Email usually answered within a day.',
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
}

export const characters: CharacterEntry[] = [
  {
    id: 'wriothesley',
    zh: '莱欧斯利',
    en: 'Wriothesley',
    origin: { zh: '原神 · 梅洛彼得堡', en: 'Genshin Impact' },
    art: '/assets/cast/wriothesley.webp',
  },
  {
    id: 'varka',
    zh: '法尔伽',
    en: 'Varka',
    origin: { zh: '原神 · 西风骑士团', en: 'Genshin Impact' },
    art: '/assets/cast/varka.webp',
  },
  {
    id: 'lycaon',
    zh: '莱卡恩',
    en: 'Von Lycaon',
    origin: { zh: '绝区零 · 维多利亚家政', en: 'Zenless Zone Zero' },
    art: '/assets/cast/lycaon.webp',
  },
  {
    id: 'vyron',
    zh: '威龙',
    en: 'Vyron',
    origin: { zh: '三角洲行动', en: 'Delta Force' },
    art: '/assets/cast/vyron.webp',
  },
  {
    id: 'gizmo',
    zh: '比特',
    en: 'Gizmo',
    origin: { zh: '绝区零', en: 'Zenless Zone Zero' },
    art: '/assets/cast/gizmo.webp',
  },
];
