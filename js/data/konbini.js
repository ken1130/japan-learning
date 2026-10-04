// 便利商店 3D 場景的商品。欄位：jp、kana、zh、price（円，含稅參考價）、emoji、shelf、color（包裝底色）
// shelf：back = 後方貨架（食物）、fridge = 右側冷藏櫃（飲料）、goods = 左側日用品、counter = 櫃台熱食

export const KONBINI_SHELVES = [
  { id: 'back', name: '便當・麵包・零食', icon: '🍙' },
  { id: 'fridge', name: '冷藏飲料・冰品', icon: '🧊' },
  { id: 'goods', name: '日用品', icon: '🪥' },
  { id: 'counter', name: '櫃台熱食', icon: '🍢' },
];

export const KONBINI = [
  { jp: 'おにぎり（鮭）', kana: 'おにぎり（しゃけ）', zh: '鮭魚飯糰', price: 168, emoji: '🍙', shelf: 'back', color: '#f4f1e8' },
  { jp: 'ツナマヨおにぎり', kana: 'つなまよおにぎり', zh: '鮪魚美乃滋飯糰', price: 158, emoji: '🍙', shelf: 'back', color: '#fff6d6' },
  { jp: '幕の内弁当', kana: 'まくのうちべんとう', zh: '綜合便當', price: 598, emoji: '🍱', shelf: 'back', color: '#e9dcc2', tip: '結帳時店員會問「温めますか？」（要加熱嗎？）' },
  { jp: 'からあげ弁当', kana: 'からあげべんとう', zh: '炸雞便當', price: 548, emoji: '🍱', shelf: 'back', color: '#f2d9b0' },
  { jp: 'サンドイッチ', kana: 'さんどいっち', zh: '三明治', price: 348, emoji: '🥪', shelf: 'back', color: '#fbe9c9' },
  { jp: 'カップ麺', kana: 'かっぷめん', zh: '杯麵', price: 228, emoji: '🍜', shelf: 'back', color: '#e8473b', tip: '店內有熱水，可以請店員或自己加' },
  { jp: 'メロンパン', kana: 'めろんぱん', zh: '菠蘿麵包', price: 168, emoji: '🍈', shelf: 'back', color: '#cfe8a8' },
  { jp: 'ポテトチップス', kana: 'ぽてとちっぷす', zh: '洋芋片', price: 178, emoji: '🥔', shelf: 'back', color: '#f5c84c' },
  { jp: 'チョコレート', kana: 'ちょこれーと', zh: '巧克力', price: 158, emoji: '🍫', shelf: 'back', color: '#7a4a2e' },
  { jp: 'お茶', kana: 'おちゃ', zh: '綠茶（無糖）', price: 158, emoji: '🍵', shelf: 'fridge', color: '#3f8f4f', tip: '日本瓶裝茶幾乎都是無糖的' },
  { jp: '水', kana: 'みず', zh: '礦泉水', price: 118, emoji: '💧', shelf: 'fridge', color: '#cfe6f7' },
  { jp: '牛乳', kana: 'ぎゅうにゅう', zh: '牛奶', price: 198, emoji: '🥛', shelf: 'fridge', color: '#f2f6fb' },
  { jp: '缶コーヒー', kana: 'かんこーひー', zh: '罐裝咖啡', price: 148, emoji: '☕', shelf: 'fridge', color: '#4a3226' },
  { jp: 'ビール', kana: 'びーる', zh: '啤酒', price: 248, emoji: '🍺', shelf: 'fridge', color: '#d9a400', tip: '買酒時可能要在螢幕上按「我已滿 20 歲」' },
  { jp: 'アイス', kana: 'あいす', zh: '冰淇淋', price: 198, emoji: '🍦', shelf: 'fridge', color: '#f9c6d3' },
  { jp: '歯ブラシ', kana: 'はぶらし', zh: '牙刷', price: 298, emoji: '🪥', shelf: 'goods', color: '#9fd3e6' },
  { jp: '傘', kana: 'かさ', zh: '雨傘（透明傘）', price: 770, emoji: '☂️', shelf: 'goods', color: '#d8e3ea' },
  { jp: 'マスク', kana: 'ますく', zh: '口罩', price: 398, emoji: '😷', shelf: 'goods', color: '#eef2f5' },
  { jp: '電池', kana: 'でんち', zh: '電池', price: 328, emoji: '🔋', shelf: 'goods', color: '#2f2f2f' },
  { jp: '充電器', kana: 'じゅうでんき', zh: '充電器', price: 2480, emoji: '🔌', shelf: 'goods', color: '#ffffff' },
  { jp: 'フライドチキン', kana: 'ふらいどちきん', zh: '炸雞（櫃台）', price: 228, emoji: '🍗', shelf: 'counter', color: '#e8a64a', tip: '櫃台熱食要跟店員點：「フライドチキンをください」' },
  { jp: '肉まん', kana: 'にくまん', zh: '肉包', price: 178, emoji: '🥟', shelf: 'counter', color: '#f6efe4' },
  { jp: 'おでん', kana: 'おでん', zh: '關東煮', price: 128, emoji: '🍢', shelf: 'counter', color: '#d9b77a', tip: '冬天才有，一個一個點：「大根（だいこん，蘿蔔）と卵をください」' },
];

// 店內看得到的標示
export const KONBINI_LABELS = [
  { jp: 'レジ', kana: 'れじ', zh: '收銀台' },
  { jp: '新商品', kana: 'しんしょうひん', zh: '新商品' },
  { jp: '温め', kana: 'あたため', zh: '加熱（微波）' },
  { jp: 'お手洗い', kana: 'おてあらい', zh: '洗手間（有些店可借用）' },
];
