// 迴轉壽司點餐平板。欄位：jp、kana、zh、price（円）、emoji、cat、tip（選填）
export const SUSHI_CATS = [
  { id: 'nigiri', name: 'にぎり', zh: '握壽司' },
  { id: 'gunkan', name: '軍艦', zh: '軍艦卷' },
  { id: 'maki', name: '巻物', zh: '細卷' },
  { id: 'side', name: 'サイド', zh: '副餐' },
  { id: 'dessert', name: 'デザート', zh: '甜點' },
];

export const SUSHI = [
  { jp: 'まぐろ', kana: 'まぐろ', zh: '鮪魚（紅肉）', price: 120, emoji: '🍣', cat: 'nigiri', color: '#c8333a' },
  { jp: '中トロ', kana: 'ちゅうとろ', zh: '中腹鮪魚（油花適中）', price: 260, emoji: '🍣', cat: 'nigiri', color: '#e2707a' },
  { jp: '大トロ', kana: 'おおとろ', zh: '大腹鮪魚（最肥）', price: 360, emoji: '🍣', cat: 'nigiri', color: '#f1a7ae' },
  { jp: 'サーモン', kana: 'さーもん', zh: '鮭魚', price: 120, emoji: '🍣', cat: 'nigiri', color: '#f08a4b' },
  { jp: 'はまち', kana: 'はまち', zh: '青魽（油脂豐富的白肉魚）', price: 120, emoji: '🍣', cat: 'nigiri', color: '#f3d7c8' },
  { jp: '鯛', kana: 'たい', zh: '鯛魚', price: 180, emoji: '🍣', cat: 'nigiri', color: '#f6e3dc' },
  { jp: 'えび', kana: 'えび', zh: '鮮蝦（燙熟）', price: 120, emoji: '🍤', cat: 'nigiri', color: '#f4a261' },
  { jp: '甘えび', kana: 'あまえび', zh: '甜蝦（生）', price: 180, emoji: '🦐', cat: 'nigiri', color: '#f7b2a0' },
  { jp: 'いか', kana: 'いか', zh: '花枝', price: 120, emoji: '🦑', cat: 'nigiri', color: '#f5f2ea' },
  { jp: 'たこ', kana: 'たこ', zh: '章魚', price: 120, emoji: '🐙', cat: 'nigiri', color: '#d9534f' },
  { jp: 'ほたて', kana: 'ほたて', zh: '干貝', price: 180, emoji: '🐚', cat: 'nigiri', color: '#f3e7d3' },
  { jp: '穴子', kana: 'あなご', zh: '星鰻（甜醬）', price: 180, emoji: '🍣', cat: 'nigiri', color: '#8a5a3c' },
  { jp: '玉子', kana: 'たまご', zh: '玉子燒', price: 120, emoji: '🍳', cat: 'nigiri', color: '#f6d55c' },
  { jp: 'うに', kana: 'うに', zh: '海膽', price: 360, emoji: '🟠', cat: 'gunkan', color: '#e9a23b' },
  { jp: 'いくら', kana: 'いくら', zh: '鮭魚卵', price: 260, emoji: '🔴', cat: 'gunkan', color: '#e76f51' },
  { jp: 'ネギトロ', kana: 'ねぎとろ', zh: '蔥花鮪魚泥', price: 180, emoji: '🍣', cat: 'gunkan', color: '#e5989b' },
  { jp: 'コーン', kana: 'こーん', zh: '玉米（美乃滋）', price: 120, emoji: '🌽', cat: 'gunkan', color: '#f9e076' },
  { jp: '鉄火巻', kana: 'てっかまき', zh: '鮪魚細卷', price: 180, emoji: '🍙', cat: 'maki', color: '#c8333a' },
  { jp: 'かっぱ巻', kana: 'かっぱまき', zh: '小黃瓜細卷', price: 120, emoji: '🥒', cat: 'maki', color: '#6aa84f' },
  { jp: '納豆巻', kana: 'なっとうまき', zh: '納豆細卷', price: 120, emoji: '🫘', cat: 'maki', color: '#b08d57' },
  { jp: '茶碗蒸し', kana: 'ちゃわんむし', zh: '茶碗蒸', price: 240, emoji: '🍮', cat: 'side', color: '#f3e3b5' },
  { jp: '味噌汁', kana: 'みそしる', zh: '味噌湯', price: 200, emoji: '🥣', cat: 'side', color: '#c49a6c' },
  { jp: 'フライドポテト', kana: 'ふらいどぽてと', zh: '薯條', price: 180, emoji: '🍟', cat: 'side', color: '#f4c95d' },
  { jp: 'プリン', kana: 'ぷりん', zh: '布丁', price: 180, emoji: '🍮', cat: 'dessert', color: '#f2c14e' },
  { jp: 'わらび餅', kana: 'わらびもち', zh: '蕨餅（Q 彈和菓子）', price: 180, emoji: '🍡', cat: 'dessert', color: '#d6c58d' },
];

// 平板上的按鈕、店內用語
export const SUSHI_TERMS = [
  { jp: '注文', kana: 'ちゅうもん', zh: '點餐' },
  { jp: '注文履歴', kana: 'ちゅうもんりれき', zh: '點餐紀錄' },
  { jp: '数量', kana: 'すうりょう', zh: '數量' },
  { jp: '注文する', kana: 'ちゅうもんする', zh: '確認下單' },
  { jp: '取消', kana: 'とりけし', zh: '取消' },
  { jp: 'お会計', kana: 'おかいけい', zh: '結帳' },
  { jp: 'さび抜き', kana: 'さびぬき', zh: '不要芥末', tip: '日本壽司預設有芥末，小孩或怕辣可以選「さび抜き」' },
  { jp: '店員呼出', kana: 'てんいんよびだし', zh: '呼叫店員' },
  { jp: '粉茶', kana: 'こなちゃ', zh: '綠茶粉（自己泡）', tip: '桌上的綠色粉末加熱水，就是免費的茶' },
  { jp: 'ガリ', kana: 'がり', zh: '醋薑片（免費）' },
  { jp: '皿', kana: 'さら', zh: '盤子', tip: '有些店用盤子顏色算錢，吃完的盤子疊好就好' },
];
