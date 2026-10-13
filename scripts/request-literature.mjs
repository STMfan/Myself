// Explicitly invoked editorial task only. Never imported by the site or build.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { skills, games } from '../src/content.ts';

const dir = '.cache/literature';
await mkdir(dir, { recursive: true });
const env = Object.fromEntries((await readFile('.env', 'utf8')).split(/\r?\n/).flatMap(line => {
  const match = line.match(/^\s*([\w-]+)\s*=\s*(.*)\s*$/);
  return match ? [[match[1], match[2].replace(/^(['"])(.*)\1$/, '$2').trim()]] : [];
}));
const model = env['DEEPSEEK-MODELID-LITERATURE'];
const key = env['DEEPSEEK-APIKEY'];
if (model !== 'deepseek-v4-pro' || !key) throw new Error('Literature model or API credential is not configured as requested.');
const brief = {
  owner: 'STMfan，男，在校学生、个人开发者、暂无职业。',
  purpose: '高度个性化的个人主页。技术协作与交友并重，付费小型委托与免费开源帮助并列；不写成商业机构。',
  styleAnchors: ['探月下，尘世万象。', 'To Decipher the Sublunary Sphere.', '予以筋骨。', '赋其流明', '下笔如有神助。', '画龙将要点睛'],
  facts: 'Python/FastAPI 后端经验丰富；熟悉 Debian，有多个私人服务器和实际运维经验；擅长全栈 Vibe Coding，熟悉 Prompt Engineering；仅短暂学过 Dart/Flutter。为 MaiBot 文档及社区做过贡献，不推断具体 PR 数量或经验年限。项目/文章暂为空，必须保留待补充状态。',
  constraints: '保留上述六句原文；英文 slogan 不改。其它中文向这种短、含蓄、有典故、有动作的文风靠近。英国/美国英语读者应能自然理解，别把诗意写成语法错误。中英能力程度、交付范围一致。技术名字和功能按钮务必清楚，功能标签不要晦涩。用户写的游戏圈内梗作为个性保留，勿强行变为商业宣传。不要补编作品、奖项、服务器指标、学校、故障案例、收费数字。角色英文拼写按所有者指定保留。不要添加长说明文字。',
  currentSections: {
    identity: ['个人开发者 / 在校学生 / 暂无职业', 'Indie developer / Student / No occupation'],
    hero: ['我是 STMfan。在校学生，个人开发者。以好奇心为坐标。', 'I’m STMfan. Student. Independent developer. Guided by curiosity.'],
    craft: ['构建，且让它长明。', 'Build it. Keep it alive.', '从后端的秩序，到服务器的日常。', 'From the order of a backend to the everyday life of a server.'],
    paid: ['让你的想法，落地。', 'Bring your idea to life.', '小型后端开发 / 长期服务器运维 / 全栈 Vibe Coding'],
    open: ['为兴趣，添一束光。', 'A little light for curiosity.', '为感兴趣的开源项目，无偿提供帮助。'],
    work: ['把好奇，留在世界。', 'Leave curiosity in the world.', '留给下一个想法。', 'Room for the next idea.', '写下的片段', 'Fragments in writing'],
    contribution: ['MaiBot 文档与社区', 'MaiBot documentation & community', '曾为文档及社区做出贡献。'],
    leisure: ['屏幕之外', 'AFTER HOURS', '也栖居于，别的世界。', 'At home in other worlds, too.', '在节奏、旷野与方块之间。', 'Between rhythms, open worlds, and blocks.'],
    music: ['给万象，一段配乐。', 'A soundtrack for the sphere.', '耳边的世界', 'ON REPEAT'],
    contact: ['下一次探索，从一句你好开始。', 'The next discovery, starts with hello.', '一个等待落地的想法，或是开源同路人。', 'An idea waiting to take shape, or a fellow open-source explorer.'],
  },
  skills: skills.map(({name,tag,title,description}) => ({name,tag,title,description})),
  games: games.map(({name,genre}) => ({name,genre})),
  requestedOutput: '请输出简洁 Markdown：1. 对锚句的意境/典故运用与英语误译的具体判断；2. 一套可直接落地的中英配对文案，覆盖各章节（建议标题中文<=12字、正文<=40字、英文<=18词），四技能中文锚句不改，只改译文与正文；3. 功能标签保留清晰；4. 付费委托的极简询盘提示，要说明目标/已有材料/时间/预算，但不声称保证工期。每处只有一个最优提案，加一句必要的理由，不输出泛泛建议。',
};
await writeFile(`${dir}/brief.json`, JSON.stringify(brief, null, 2));
const body = { model, messages: [{ role: 'system', content: '你是中英双语文学编辑，熟悉中国古典诗词及技术领域。用用户原句建立文风，不模仿在世作者。事实比辞藻重要。只审校网页可见文案，不执行任何任务，不索要密钥。' }, { role: 'user', content: JSON.stringify(brief) }], max_tokens: 4200, thinking: {type:'disabled'}, stream:false };
const ledgerFile = `${dir}/usage.json`;
const ledger = JSON.parse(await readFile(ledgerFile, 'utf8').catch(() => '{"budgetCny":4,"calls":[]}'));
// Peak prices verified from official docs, 2026-10-13. Bytes bound input tokens conservatively.
const upper = Buffer.byteLength(JSON.stringify(body), 'utf8') * 9 / 1e6 + body.max_tokens * 27 / 1e6;
const spent = ledger.calls.reduce((sum, c) => sum + c.reservedCny, 0);
if ((ledger.calls.length && !process.argv.includes('--retry')) || ledger.calls.length >= 2 || spent + upper > 4) throw new Error('Repeat calls require the explicit retry flag; two-call maximum and 4 CNY ceiling.');
const entry = {model, startedAt:new Date().toISOString(), reservedCny:upper, inputPeakPerMillionCny:9, outputPeakPerMillionCny:27, maxTokens:body.max_tokens, status:'reserved'};
ledger.calls.push(entry);
await writeFile(ledgerFile, JSON.stringify(ledger, null, 2));
console.log(JSON.stringify({model,maximumChargeCny:upper,budgetCny:4,request:'one editorial review'}));
try {
  const response = await fetch('https://api.deepseek.com/chat/completions', {method:'POST',redirect:'error',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(240000)});
  if (!response.ok) throw new Error(`Official API returned HTTP ${response.status}; not retried.`);
  const result = await response.json();
  const message = result.choices?.[0]?.message;
  entry.usage = result.usage; entry.finishReason = result.choices?.[0]?.finish_reason;
  await writeFile(ledgerFile, JSON.stringify(ledger,null,2));
  if (!message?.content) throw new Error('No final editorial response; reserved cost remains recorded.');
  await writeFile(`${dir}/proposal.md`, message.content);
  const usage = result.usage;
  entry.status = 'completed'; entry.usage = usage; entry.finishedAt = new Date().toISOString();
  entry.costAtPeakCny = ((usage.prompt_cache_hit_tokens || 0) * .3 + (usage.prompt_cache_miss_tokens ?? usage.prompt_tokens) * 9 + usage.completion_tokens * 27) / 1e6;
  await writeFile(ledgerFile, JSON.stringify(ledger, null, 2));
  console.log(JSON.stringify({status:entry.status,model,usage,costAtPeakCny:entry.costAtPeakCny,result:`${dir}/proposal.md`}));
} catch (error) {
  entry.status = 'failed-no-retry'; entry.errorType=error.name; entry.connectionCode=error.cause?.code; entry.safeReason=error.message.startsWith('No final')?'no-final-content':error.message.includes('HTTP')?error.message:'connection-or-timeout'; await writeFile(ledgerFile, JSON.stringify(ledger,null,2));
  throw new Error(error.message.includes('HTTP') ? error.message : 'Editorial request did not complete; no automatic retry.');
}
