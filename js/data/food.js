// 菜單單字。欄位：jp（菜單上的寫法）、kana（讀音）、zh、emoji、cat、syn（選填，同義詞群組）
// 羅馬拼音由 kanaToRomaji(kana) 自動產生

export const FOOD_CATS = [
  { id: 'dish', name: '料理', icon: '🍱' },
  { id: 'drink', name: '飲料', icon: '🍺' },
  { id: 'ingr', name: '食材', icon: '🥩' },
  { id: 'cook', name: '作法・口味', icon: '🔥' },
  { id: 'term', name: '菜單用語', icon: '📋' },
];

export const FOOD = [
  // 料理
  { jp: 'ラーメン', kana: 'らーめん', zh: '拉麵', emoji: '🍜', cat: 'dish' },
  { jp: 'うどん', kana: 'うどん', zh: '烏龍麵', emoji: '🍜', cat: 'dish' },
  { jp: 'そば', kana: 'そば', zh: '蕎麥麵', emoji: '🍜', cat: 'dish' },
  { jp: '寿司', kana: 'すし', zh: '壽司', emoji: '🍣', cat: 'dish' },
  { jp: '刺身', kana: 'さしみ', zh: '生魚片', emoji: '🐟', cat: 'dish' },
  { jp: '天ぷら', kana: 'てんぷら', zh: '天婦羅（炸物）', emoji: '🍤', cat: 'dish' },
  { jp: '焼き鳥', kana: 'やきとり', zh: '烤雞肉串', emoji: '🍢', cat: 'dish' },
  { jp: '唐揚げ', kana: 'からあげ', zh: '日式炸雞', emoji: '🍗', cat: 'dish' },
  { jp: '牛丼', kana: 'ぎゅうどん', zh: '牛肉蓋飯', emoji: '🍚', cat: 'dish' },
  { jp: '親子丼', kana: 'おやこどん', zh: '親子丼（雞肉＋蛋）', emoji: '🍚', cat: 'dish' },
  { jp: 'カツ丼', kana: 'かつどん', zh: '豬排蓋飯', emoji: '🍚', cat: 'dish' },
  { jp: 'とんかつ', kana: 'とんかつ', zh: '炸豬排', emoji: '🐷', cat: 'dish' },
  { jp: 'カレーライス', kana: 'かれーらいす', zh: '咖哩飯', emoji: '🍛', cat: 'dish' },
  { jp: 'お好み焼き', kana: 'おこのみやき', zh: '大阪燒', emoji: '🥞', cat: 'dish' },
  { jp: 'たこ焼き', kana: 'たこやき', zh: '章魚燒', emoji: '🐙', cat: 'dish' },
  { jp: '餃子', kana: 'ぎょうざ', zh: '煎餃', emoji: '🥟', cat: 'dish' },
  { jp: '焼肉', kana: 'やきにく', zh: '燒肉', emoji: '🥩', cat: 'dish' },
  { jp: 'すき焼き', kana: 'すきやき', zh: '壽喜燒', emoji: '🍲', cat: 'dish' },
  { jp: 'しゃぶしゃぶ', kana: 'しゃぶしゃぶ', zh: '涮涮鍋', emoji: '🍲', cat: 'dish' },
  { jp: 'おにぎり', kana: 'おにぎり', zh: '飯糰', emoji: '🍙', cat: 'dish' },
  { jp: '定食', kana: 'ていしょく', zh: '套餐（附飯、味噌湯）', emoji: '🍱', cat: 'dish', syn: 'set' },
  { jp: '味噌汁', kana: 'みそしる', zh: '味噌湯', emoji: '🥣', cat: 'dish' },
  { jp: 'ご飯', kana: 'ごはん', zh: '白飯', emoji: '🍚', cat: 'dish' },
  { jp: '枝豆', kana: 'えだまめ', zh: '毛豆', emoji: '🫛', cat: 'dish' },
  { jp: 'チャーハン', kana: 'ちゃーはん', zh: '炒飯', emoji: '🍳', cat: 'dish' },

  // 飲料
  { jp: '生ビール', kana: 'なまびーる', zh: '生啤酒', emoji: '🍺', cat: 'drink' },
  { jp: '日本酒', kana: 'にほんしゅ', zh: '日本清酒', emoji: '🍶', cat: 'drink' },
  { jp: 'ハイボール', kana: 'はいぼーる', zh: '威士忌蘇打', emoji: '🥃', cat: 'drink' },
  { jp: 'サワー', kana: 'さわー', zh: '沙瓦（調酒）', emoji: '🍹', cat: 'drink' },
  { jp: 'お茶', kana: 'おちゃ', zh: '茶', emoji: '🍵', cat: 'drink' },
  { jp: '烏龍茶', kana: 'うーろんちゃ', zh: '烏龍茶', emoji: '🍵', cat: 'drink' },
  { jp: 'お冷', kana: 'おひや', zh: '冰開水（免費）', emoji: '🥛', cat: 'drink' },
  { jp: 'コーヒー', kana: 'こーひー', zh: '咖啡', emoji: '☕', cat: 'drink' },
  { jp: 'ジュース', kana: 'じゅーす', zh: '果汁', emoji: '🧃', cat: 'drink' },
  { jp: 'ソフトドリンク', kana: 'そふとどりんく', zh: '無酒精飲料', emoji: '🥤', cat: 'drink' },

  // 食材
  { jp: '牛', kana: 'ぎゅう', zh: '牛肉', emoji: '🐮', cat: 'ingr' },
  { jp: '豚', kana: 'ぶた', zh: '豬肉', emoji: '🐷', cat: 'ingr' },
  { jp: '鶏', kana: 'とり', zh: '雞肉', emoji: '🐔', cat: 'ingr' },
  { jp: '魚', kana: 'さかな', zh: '魚', emoji: '🐟', cat: 'ingr' },
  { jp: 'えび', kana: 'えび', zh: '蝦', emoji: '🦐', cat: 'ingr' },
  { jp: 'いか', kana: 'いか', zh: '花枝／魷魚', emoji: '🦑', cat: 'ingr' },
  { jp: 'たこ', kana: 'たこ', zh: '章魚', emoji: '🐙', cat: 'ingr' },
  { jp: 'まぐろ', kana: 'まぐろ', zh: '鮪魚', emoji: '🐟', cat: 'ingr' },
  { jp: 'サーモン', kana: 'さーもん', zh: '鮭魚', emoji: '🐟', cat: 'ingr' },
  { jp: 'うなぎ', kana: 'うなぎ', zh: '鰻魚', emoji: '🐍', cat: 'ingr' },
  { jp: '卵', kana: 'たまご', zh: '蛋', emoji: '🥚', cat: 'ingr' },
  { jp: '野菜', kana: 'やさい', zh: '蔬菜', emoji: '🥬', cat: 'ingr' },
  { jp: '豆腐', kana: 'とうふ', zh: '豆腐', emoji: '⬜', cat: 'ingr' },
  { jp: 'ねぎ', kana: 'ねぎ', zh: '蔥', emoji: '🌿', cat: 'ingr' },
  { jp: 'チーズ', kana: 'ちーず', zh: '起司', emoji: '🧀', cat: 'ingr' },

  // 作法・口味
  { jp: '焼き', kana: 'やき', zh: '烤／煎', emoji: '🔥', cat: 'cook' },
  { jp: '揚げ', kana: 'あげ', zh: '炸', emoji: '🍳', cat: 'cook' },
  { jp: '煮', kana: 'に', zh: '燉煮', emoji: '🍲', cat: 'cook' },
  { jp: '生', kana: 'なま', zh: '生的', emoji: '❄️', cat: 'cook' },
  { jp: '塩', kana: 'しお', zh: '鹽味', emoji: '🧂', cat: 'cook' },
  { jp: '醤油', kana: 'しょうゆ', zh: '醬油', emoji: '🫗', cat: 'cook' },
  { jp: '味噌', kana: 'みそ', zh: '味噌', emoji: '🥣', cat: 'cook' },
  { jp: 'とんこつ', kana: 'とんこつ', zh: '豚骨（豬骨湯頭）', emoji: '🍖', cat: 'cook' },
  { jp: '辛口', kana: 'からくち', zh: '辣味／辛口', emoji: '🌶️', cat: 'cook' },
  { jp: '甘口', kana: 'あまくち', zh: '甜味／不辣', emoji: '🍯', cat: 'cook' },
  { jp: '冷たい', kana: 'つめたい', zh: '冰的／冷的', emoji: '🧊', cat: 'cook' },
  { jp: '温かい', kana: 'あたたかい', zh: '熱的／溫的', emoji: '♨️', cat: 'cook' },

  // 菜單用語
  { jp: '大盛り', kana: 'おおもり', zh: '大份', emoji: '⬆️', cat: 'term' },
  { jp: '並', kana: 'なみ', zh: '普通份', emoji: '⏺️', cat: 'term' },
  { jp: '小盛り', kana: 'こもり', zh: '小份', emoji: '⬇️', cat: 'term' },
  { jp: '替え玉', kana: 'かえだま', zh: '加麵（拉麵店）', emoji: '➕', cat: 'term' },
  { jp: 'トッピング', kana: 'とっぴんぐ', zh: '加料', emoji: '✨', cat: 'term' },
  { jp: '無料', kana: 'むりょう', zh: '免費', emoji: '🆓', cat: 'term' },
  { jp: '税込', kana: 'ぜいこみ', zh: '含稅', emoji: '💴', cat: 'term' },
  { jp: '税抜', kana: 'ぜいぬき', zh: '未稅', emoji: '💴', cat: 'term' },
  { jp: '食べ放題', kana: 'たべほうだい', zh: '吃到飽', emoji: '🍽️', cat: 'term' },
  { jp: '飲み放題', kana: 'のみほうだい', zh: '喝到飽', emoji: '🍻', cat: 'term' },
  { jp: 'お通し', kana: 'おとおし', zh: '小菜（居酒屋會自動收費）', emoji: '🥢', cat: 'term' },
  { jp: '単品', kana: 'たんぴん', zh: '單點', emoji: '1️⃣', cat: 'term' },
  { jp: 'セット', kana: 'せっと', zh: '套餐', emoji: '🍱', cat: 'term', syn: 'set' },
  { jp: '限定', kana: 'げんてい', zh: '限定', emoji: '⏳', cat: 'term' },
  { jp: '人気', kana: 'にんき', zh: '人氣（受歡迎）', emoji: '⭐', cat: 'term' },
  { jp: 'おすすめ', kana: 'おすすめ', zh: '推薦', emoji: '👍', cat: 'term' },
  { jp: '品切れ', kana: 'しなぎれ', zh: '售完', emoji: '🚫', cat: 'term' },
  { jp: '券売機', kana: 'けんばいき', zh: '點餐售票機', emoji: '🎫', cat: 'term' },
  { jp: '円', kana: 'えん', zh: '日圓', emoji: '💴', cat: 'term' },
];

// 模擬菜單。parts 是組成這道菜的單字（會連到上面的 FOOD）
export const MENUS = [
  {
    id: 'ramen',
    name: '麺屋 さくら',
    kana: 'めんや さくら',
    style: 'ramen',
    tip: '很多拉麵店要先在門口的「券売機」買票，再把票交給店員。',
    sections: [
      {
        title: 'ラーメン',
        items: [
          { jp: '醤油ラーメン', kana: 'しょうゆらーめん', zh: '醬油拉麵', price: 850, parts: ['醤油', 'ラーメン'] },
          { jp: '味噌ラーメン', kana: 'みそらーめん', zh: '味噌拉麵', price: 900, parts: ['味噌', 'ラーメン'] },
          { jp: 'とんこつラーメン', kana: 'とんこつらーめん', zh: '豚骨拉麵', price: 950, parts: ['とんこつ', 'ラーメン'], badge: '人気' },
          { jp: '塩ラーメン', kana: 'しおらーめん', zh: '鹽味拉麵', price: 850, parts: ['塩', 'ラーメン'] },
        ],
      },
      {
        title: 'トッピング',
        items: [
          { jp: '味玉', kana: 'あじたま', zh: '溏心蛋（滷蛋）', price: 150, parts: ['卵'] },
          { jp: 'ねぎ増し', kana: 'ねぎまし', zh: '加蔥', price: 100, parts: ['ねぎ'] },
          { jp: '替え玉', kana: 'かえだま', zh: '加麵', price: 150, parts: ['替え玉'] },
          { jp: '大盛り', kana: 'おおもり', zh: '大碗', price: 150, parts: ['大盛り'] },
        ],
      },
      {
        title: 'サイド',
        items: [
          { jp: '餃子（6個）', kana: 'ぎょうざ（ろっこ）', zh: '煎餃（6 顆）', price: 400, parts: ['餃子'] },
          { jp: 'チャーハン', kana: 'ちゃーはん', zh: '炒飯', price: 500, parts: ['チャーハン'] },
          { jp: 'ご飯', kana: 'ごはん', zh: '白飯', price: 150, parts: ['ご飯'], badge: 'おかわり無料' },
          { jp: '生ビール', kana: 'なまびーる', zh: '生啤酒', price: 550, parts: ['生ビール'] },
        ],
      },
    ],
  },
  {
    id: 'izakaya',
    name: '居酒屋 たぬき',
    kana: 'いざかや たぬき',
    style: 'izakaya',
    tip: '居酒屋坐下後會自動送上「お通し」小菜並收費（約 300～500 円），這是正常的。',
    sections: [
      {
        title: '焼き物・揚げ物',
        items: [
          { jp: '焼き鳥（塩・たれ）', kana: 'やきとり（しお・たれ）', zh: '烤雞肉串（鹽味／醬汁）', price: 180, parts: ['焼き鳥', '塩'], badge: 'おすすめ' },
          { jp: '鶏の唐揚げ', kana: 'とりのからあげ', zh: '日式炸雞', price: 580, parts: ['鶏', '唐揚げ'] },
          { jp: 'えび天ぷら', kana: 'えびてんぷら', zh: '炸蝦天婦羅', price: 680, parts: ['えび', '天ぷら'] },
          { jp: '揚げ出し豆腐', kana: 'あげだしどうふ', zh: '炸豆腐（淋醬汁）', price: 480, parts: ['揚げ', '豆腐'] },
        ],
      },
      {
        title: '刺身・一品',
        items: [
          { jp: 'まぐろ刺身', kana: 'まぐろさしみ', zh: '鮪魚生魚片', price: 780, parts: ['まぐろ', '刺身'] },
          { jp: 'サーモン刺身', kana: 'さーもんさしみ', zh: '鮭魚生魚片', price: 720, parts: ['サーモン', '刺身'] },
          { jp: '枝豆', kana: 'えだまめ', zh: '毛豆', price: 380, parts: ['枝豆'] },
          { jp: 'だし巻き卵', kana: 'だしまきたまご', zh: '日式高湯煎蛋捲', price: 480, parts: ['卵'] },
        ],
      },
      {
        title: 'ドリンク',
        items: [
          { jp: '生ビール（中）', kana: 'なまびーる（ちゅう）', zh: '生啤酒（中杯）', price: 580, parts: ['生ビール'] },
          { jp: 'ハイボール', kana: 'はいぼーる', zh: '威士忌蘇打', price: 480, parts: ['ハイボール'] },
          { jp: '日本酒（一合）', kana: 'にほんしゅ（いちごう）', zh: '清酒（一合≈180ml）', price: 650, parts: ['日本酒'] },
          { jp: '烏龍茶', kana: 'うーろんちゃ', zh: '烏龍茶', price: 300, parts: ['烏龍茶'] },
          { jp: '飲み放題（2時間）', kana: 'のみほうだい（にじかん）', zh: '喝到飽（2 小時）', price: 1500, parts: ['飲み放題'], badge: '限定' },
        ],
      },
    ],
  },
];
