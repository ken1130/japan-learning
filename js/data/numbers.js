// 數字讀法、價格、時間、量詞

const DIGIT = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];

// 百、千有音變（さんびゃく、ろっぴゃく、はっぴゃく、さんぜん、はっせん）
const HUNDRED = ['', 'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく'];
const THOUSAND = ['', 'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん'];

function under10000(n) {
  const th = Math.floor(n / 1000);
  const hu = Math.floor((n % 1000) / 100);
  const te = Math.floor((n % 100) / 10);
  const on = n % 10;
  const parts = [THOUSAND[th], HUNDRED[hu]];
  if (te) parts.push((te === 1 ? '' : DIGIT[te]) + 'じゅう');
  parts.push(DIGIT[on]);
  return parts.filter(Boolean);
}

/**
 * 數字 → 平假名讀音（0 ~ 99,999,999）
 * sep：每個位數之間的分隔字，例如 numberToKana(1280, ' ') → 'せん にひゃく はちじゅう'
 */
export function numberToKana(n, sep = '') {
  if (n === 0) return 'ゼロ';
  const man = Math.floor(n / 10000);
  const rest = n % 10000;
  const parts = [];
  // 一萬要說「いちまん」，under10000(1) 已經是「いち」
  if (man) parts.push(under10000(man).join('') + 'まん');
  if (rest) parts.push(...under10000(rest));
  return parts.join(sep);
}

export const BASIC_NUMBERS = [
  { n: 0, kanji: '〇', kana: 'ゼロ／れい' },
  { n: 1, kanji: '一', kana: 'いち' },
  { n: 2, kanji: '二', kana: 'に' },
  { n: 3, kanji: '三', kana: 'さん' },
  { n: 4, kanji: '四', kana: 'よん／し', note: '「し」跟「死」同音，常用よん' },
  { n: 5, kanji: '五', kana: 'ご' },
  { n: 6, kanji: '六', kana: 'ろく' },
  { n: 7, kanji: '七', kana: 'なな／しち' },
  { n: 8, kanji: '八', kana: 'はち' },
  { n: 9, kanji: '九', kana: 'きゅう／く' },
  { n: 10, kanji: '十', kana: 'じゅう' },
  { n: 100, kanji: '百', kana: 'ひゃく' },
  { n: 1000, kanji: '千', kana: 'せん' },
  { n: 10000, kanji: '万', kana: 'いちまん', note: '日文以「萬」為單位，跟中文一樣！' },
];

// 要特別注意的音變
export const TRICKY = [300, 600, 800, 3000, 8000];

// 「～個」的通用量詞（不知道用什麼量詞時用這個最安全）
export const TSU_COUNTER = [
  { n: 1, kana: 'ひとつ' }, { n: 2, kana: 'ふたつ' }, { n: 3, kana: 'みっつ' },
  { n: 4, kana: 'よっつ' }, { n: 5, kana: 'いつつ' }, { n: 6, kana: 'むっつ' },
  { n: 7, kana: 'ななつ' }, { n: 8, kana: 'やっつ' }, { n: 9, kana: 'ここのつ' }, { n: 10, kana: 'とお' },
];

// 「～人」：餐廳報人數用
export const PEOPLE_COUNTER = [
  { n: 1, kana: 'ひとり' }, { n: 2, kana: 'ふたり' }, { n: 3, kana: 'さんにん' },
  { n: 4, kana: 'よにん' }, { n: 5, kana: 'ごにん' }, { n: 6, kana: 'ろくにん' },
];

// 「～点」：衣服、商品的件數（服飾店試衣間、結帳時）
export const TEN_COUNTER = [
  { n: 1, kana: 'いってん' }, { n: 2, kana: 'にてん' }, { n: 3, kana: 'さんてん' },
  { n: 4, kana: 'よんてん' }, { n: 5, kana: 'ごてん' },
];

// 「～枚」：扁平的東西（車票、毛巾、紙、襯衫）
export const MAI_COUNTER = [
  { n: 1, kana: 'いちまい' }, { n: 2, kana: 'にまい' }, { n: 3, kana: 'さんまい' },
  { n: 4, kana: 'よんまい' }, { n: 5, kana: 'ごまい' },
];

// 「～時」：幾點
export const HOURS = [
  { n: 1, kana: 'いちじ' }, { n: 2, kana: 'にじ' }, { n: 3, kana: 'さんじ' }, { n: 4, kana: 'よじ', tricky: true },
  { n: 5, kana: 'ごじ' }, { n: 6, kana: 'ろくじ' }, { n: 7, kana: 'しちじ', tricky: true }, { n: 8, kana: 'はちじ' },
  { n: 9, kana: 'くじ', tricky: true }, { n: 10, kana: 'じゅうじ' }, { n: 11, kana: 'じゅういちじ' }, { n: 12, kana: 'じゅうにじ' },
];

export const WEEKDAYS = [
  { kanji: '月曜日', kana: 'げつようび', zh: '星期一' },
  { kanji: '火曜日', kana: 'かようび', zh: '星期二' },
  { kanji: '水曜日', kana: 'すいようび', zh: '星期三' },
  { kanji: '木曜日', kana: 'もくようび', zh: '星期四' },
  { kanji: '金曜日', kana: 'きんようび', zh: '星期五' },
  { kanji: '土曜日', kana: 'どようび', zh: '星期六' },
  { kanji: '日曜日', kana: 'にちようび', zh: '星期日' },
];

/** 產生隨機的「像真的」價格 */
export function randomPrice(level) {
  const pools = {
    easy: () => (Math.floor(Math.random() * 9) + 1) * 100,
    mid: () => (Math.floor(Math.random() * 290) + 10) * 10, // 100 ~ 2,990
    hard: () => Math.floor(Math.random() * 29900) + 100, // 100 ~ 29,999
  };
  return (pools[level] || pools.easy)();
}
