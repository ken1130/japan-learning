// 街頭／車站常見招牌。欄位：jp、kana、zh、cat、tip（選填）、syn（同義詞群組，測驗時不互當干擾選項）
// scene: 3D 街景中出現的招牌（color 是招牌底色、vertical 是直書）

export const SIGN_CATS = [
  { id: 'door', name: '門口・店家', icon: '🚪' },
  { id: 'station', name: '車站・交通', icon: '🚉' },
  { id: 'toilet', name: '廁所・設施', icon: '🚻' },
  { id: 'warn', name: '禁止・警告', icon: '⚠️' },
  { id: 'kanji', name: '基礎漢字', icon: '🈶' },
];

export const SIGNS = [
  // 門口・店家
  { jp: '入口', kana: 'いりぐち', zh: '入口', cat: 'door' },
  { jp: '出口', kana: 'でぐち', zh: '出口', cat: 'door' },
  { jp: '押', kana: 'おす', zh: '推（門）', cat: 'door', tip: '門上的「押」是推，不是拉！' },
  { jp: '引', kana: 'ひく', zh: '拉（門）', cat: 'door', tip: '「引」是拉，跟中文直覺相反要注意' },
  { jp: '営業中', kana: 'えいぎょうちゅう', zh: '營業中', cat: 'door' },
  { jp: '準備中', kana: 'じゅんびちゅう', zh: '準備中（還沒開／休息中）', cat: 'door' },
  { jp: '定休日', kana: 'ていきゅうび', zh: '公休日', cat: 'door' },
  { jp: '本日休業', kana: 'ほんじつきゅうぎょう', zh: '今日休息', cat: 'door' },
  { jp: '受付', kana: 'うけつけ', zh: '櫃台／接待處', cat: 'door' },
  { jp: '会計', kana: 'かいけい', zh: '結帳', cat: 'door' },
  { jp: '割引', kana: 'わりびき', zh: '折扣', cat: 'door', tip: '「3割引」= 打七折（減 30%）' },
  { jp: '両替', kana: 'りょうがえ', zh: '換錢', cat: 'door' },
  { jp: '空室', kana: 'くうしつ', zh: '有空房', cat: 'door' },
  { jp: '満室', kana: 'まんしつ', zh: '客滿', cat: 'door' },

  // 車站・交通
  { jp: '駅', kana: 'えき', zh: '車站', cat: 'station' },
  { jp: '改札', kana: 'かいさつ', zh: '剪票口', cat: 'station' },
  { jp: '切符売り場', kana: 'きっぷうりば', zh: '售票處', cat: 'station' },
  { jp: '乗り場', kana: 'のりば', zh: '乘車處', cat: 'station' },
  { jp: '乗り換え', kana: 'のりかえ', zh: '轉乘', cat: 'station' },
  { jp: '地下鉄', kana: 'ちかてつ', zh: '地鐵', cat: 'station' },
  { jp: '新幹線', kana: 'しんかんせん', zh: '新幹線（高鐵）', cat: 'station' },
  { jp: '各駅停車', kana: 'かくえきていしゃ', zh: '每站都停', cat: 'station' },
  { jp: '快速', kana: 'かいそく', zh: '快速（部分站不停）', cat: 'station' },
  { jp: '北口', kana: 'きたぐち', zh: '北出口', cat: 'station' },
  { jp: '南口', kana: 'みなみぐち', zh: '南出口', cat: 'station' },
  { jp: '東口', kana: 'ひがしぐち', zh: '東出口', cat: 'station' },
  { jp: '西口', kana: 'にしぐち', zh: '西出口', cat: 'station' },
  { jp: '番線', kana: 'ばんせん', zh: '第～月台', cat: 'station', tip: '「3番線」= 第 3 月台' },
  { jp: 'バス停', kana: 'ばすてい', zh: '公車站', cat: 'station' },
  { jp: 'コインロッカー', kana: 'こいんろっかー', zh: '投幣置物櫃', cat: 'station' },

  // 廁所・設施
  { jp: 'お手洗い', kana: 'おてあらい', zh: '洗手間', cat: 'toilet', syn: 'toilet' },
  { jp: 'トイレ', kana: 'といれ', zh: '廁所', cat: 'toilet', syn: 'toilet' },
  { jp: '男', kana: 'おとこ', zh: '男', cat: 'toilet' },
  { jp: '女', kana: 'おんな', zh: '女', cat: 'toilet' },
  { jp: '使用中', kana: 'しようちゅう', zh: '使用中', cat: 'toilet' },
  { jp: '空き', kana: 'あき', zh: '空的（可以用）', cat: 'toilet' },
  { jp: '開', kana: 'ひらく', zh: '開（電梯按鈕）', cat: 'toilet', tip: '電梯按鈕：開（ひらく）、閉（とじる）' },
  { jp: '閉', kana: 'とじる', zh: '關（電梯按鈕）', cat: 'toilet' },
  { jp: '喫煙所', kana: 'きつえんじょ', zh: '吸菸區', cat: 'toilet' },
  { jp: '案内所', kana: 'あんないじょ', zh: '服務台／詢問處', cat: 'toilet' },

  // 禁止・警告
  { jp: '禁煙', kana: 'きんえん', zh: '禁菸', cat: 'warn' },
  { jp: '撮影禁止', kana: 'さつえいきんし', zh: '禁止拍照', cat: 'warn' },
  { jp: '立入禁止', kana: 'たちいりきんし', zh: '禁止進入', cat: 'warn' },
  { jp: '関係者以外立入禁止', kana: 'かんけいしゃいがいたちいりきんし', zh: '非相關人員禁止進入', cat: 'warn' },
  { jp: '止まれ', kana: 'とまれ', zh: '停（路口）', cat: 'warn' },
  { jp: '危険', kana: 'きけん', zh: '危險', cat: 'warn' },
  { jp: '注意', kana: 'ちゅうい', zh: '注意', cat: 'warn' },
  { jp: '非常口', kana: 'ひじょうぐち', zh: '緊急出口', cat: 'warn' },
  { jp: '土足禁止', kana: 'どそくきんし', zh: '請脫鞋', cat: 'warn', tip: '看到這個要脫鞋再進去（寺廟、榻榻米餐廳）' },

  // 基礎漢字（菜單上的營業時間、價格會用到）
  { jp: '日', kana: 'にち', zh: '日／星期日', cat: 'kanji' },
  { jp: '月', kana: 'げつ', zh: '月／星期一', cat: 'kanji' },
  { jp: '火', kana: 'か', zh: '火／星期二', cat: 'kanji' },
  { jp: '水', kana: 'すい', zh: '水／星期三', cat: 'kanji' },
  { jp: '木', kana: 'もく', zh: '木／星期四', cat: 'kanji' },
  { jp: '金', kana: 'きん', zh: '金／星期五', cat: 'kanji' },
  { jp: '土', kana: 'ど', zh: '土／星期六', cat: 'kanji' },
  { jp: '時', kana: 'じ', zh: '～點（時間）', cat: 'kanji' },
  { jp: '分', kana: 'ふん', zh: '～分（時間）', cat: 'kanji' },
  { jp: '大人', kana: 'おとな', zh: '大人（票價）', cat: 'kanji' },
  { jp: '小人', kana: 'しょうにん', zh: '小孩（票價）', cat: 'kanji', tip: '票價表的「小人」是兒童票，不是壞人！' },
];

// 3D 街景用的招牌（引用上面 jp）
export const SCENE_SIGNS = [
  { jp: '入口', color: '#1f6f50' },
  { jp: '出口', color: '#1f6f50' },
  { jp: '営業中', color: '#c8402f', vertical: true },
  { jp: 'お手洗い', color: '#2b4c7e' },
  { jp: '禁煙', color: '#b3261e' },
  { jp: '駅', color: '#2b4c7e' },
  { jp: '改札', color: '#2b4c7e' },
  { jp: '準備中', color: '#6b5b3e', vertical: true },
  { jp: '割引', color: '#e0a100' },
  { jp: '両替', color: '#5b3e8a' },
  { jp: '非常口', color: '#1f8a3a' },
  { jp: '地下鉄', color: '#0068b7' },
  { jp: '定休日', color: '#6b5b3e', vertical: true },
  { jp: '押', color: '#444444' },
];
