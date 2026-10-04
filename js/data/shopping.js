// 商店購物單字（服飾店、平價服飾連鎖、生活雜貨店）。
// 欄位：jp、kana（讀音）、zh、emoji、cat、tip（選填）、syn（選填，同義詞群組）
// 羅馬拼音由 kanaToRomaji(kana) 自動產生

export const SHOP_CATS = [
  { id: 'floor', name: '賣場分區', icon: '🧭' },
  { id: 'item', name: '衣物種類', icon: '👕' },
  { id: 'size', name: '尺寸・版型', icon: '📏' },
  { id: 'color', name: '顏色', icon: '🎨' },
  { id: 'material', name: '材質・洗滌', icon: '🧺' },
  { id: 'price', name: '價格・優惠', icon: '🏷️' },
  { id: 'service', name: '結帳・服務', icon: '🧾' },
  { id: 'goods', name: '生活雜貨', icon: '🧴' },
];

export const SHOP = [
  // 賣場分區
  { jp: 'メンズ', kana: 'めんず', zh: '男裝', emoji: '👔', cat: 'floor', syn: 'men' },
  { jp: 'レディース', kana: 'れでぃーす', zh: '女裝', emoji: '👗', cat: 'floor', syn: 'women' },
  { jp: 'キッズ', kana: 'きっず', zh: '童裝', emoji: '🧒', cat: 'floor' },
  { jp: 'ベビー', kana: 'べびー', zh: '嬰幼兒', emoji: '👶', cat: 'floor' },
  { jp: '紳士服', kana: 'しんしふく', zh: '男裝（百貨公司用語）', emoji: '🕴️', cat: 'floor', syn: 'men' },
  { jp: '婦人服', kana: 'ふじんふく', zh: '女裝（百貨公司用語）', emoji: '👚', cat: 'floor', syn: 'women' },
  { jp: '靴', kana: 'くつ', zh: '鞋子', emoji: '👟', cat: 'floor' },
  { jp: '下着', kana: 'したぎ', zh: '內衣褲', emoji: '🩲', cat: 'floor' },
  { jp: '雑貨', kana: 'ざっか', zh: '雜貨', emoji: '🧸', cat: 'floor' },
  { jp: '新作', kana: 'しんさく', zh: '新品／新款', emoji: '✨', cat: 'floor' },
  { jp: '階', kana: 'かい', zh: '樓（樓層）', emoji: '🏢', cat: 'floor', tip: '「3階」= 3 樓；樓層導覽常寫 3F' },
  { jp: '地下', kana: 'ちか', zh: '地下樓層', emoji: '⬇️', cat: 'floor', tip: '「地下1階」或「B1」= 地下一樓，百貨公司的美食街常在這裡' },

  // 衣物種類
  { jp: 'トップス', kana: 'とっぷす', zh: '上衣類', emoji: '👕', cat: 'item' },
  { jp: 'ボトムス', kana: 'ぼとむす', zh: '下身類（褲、裙）', emoji: '👖', cat: 'item' },
  { jp: 'アウター', kana: 'あうたー', zh: '外套類', emoji: '🧥', cat: 'item' },
  { jp: 'Tシャツ', kana: 'てぃーしゃつ', zh: 'T 恤', emoji: '👕', cat: 'item' },
  { jp: 'シャツ', kana: 'しゃつ', zh: '襯衫', emoji: '👔', cat: 'item' },
  { jp: 'パーカー', kana: 'ぱーかー', zh: '連帽上衣', emoji: '🧥', cat: 'item' },
  { jp: 'セーター', kana: 'せーたー', zh: '毛衣', emoji: '🧶', cat: 'item' },
  { jp: 'ジャケット', kana: 'じゃけっと', zh: '夾克', emoji: '🧥', cat: 'item' },
  { jp: 'コート', kana: 'こーと', zh: '大衣', emoji: '🧥', cat: 'item' },
  { jp: 'ダウン', kana: 'だうん', zh: '羽絨外套', emoji: '🪶', cat: 'item' },
  { jp: 'パンツ', kana: 'ぱんつ', zh: '褲子', emoji: '👖', cat: 'item', tip: '服飾店的「パンツ」是褲子，不是內褲！', syn: 'pants' },
  { jp: 'ズボン', kana: 'ずぼん', zh: '褲子（較傳統的說法）', emoji: '👖', cat: 'item', syn: 'pants' },
  { jp: 'ジーンズ', kana: 'じーんず', zh: '牛仔褲', emoji: '👖', cat: 'item' },
  { jp: 'スカート', kana: 'すかーと', zh: '裙子', emoji: '👗', cat: 'item' },
  { jp: 'ワンピース', kana: 'わんぴーす', zh: '連身裙', emoji: '👗', cat: 'item' },
  { jp: '靴下', kana: 'くつした', zh: '襪子', emoji: '🧦', cat: 'item' },
  { jp: '帽子', kana: 'ぼうし', zh: '帽子', emoji: '🧢', cat: 'item' },
  { jp: '長袖', kana: 'ながそで', zh: '長袖', emoji: '🥼', cat: 'item' },
  { jp: '半袖', kana: 'はんそで', zh: '短袖', emoji: '👕', cat: 'item' },

  // 尺寸・版型
  { jp: 'サイズ', kana: 'さいず', zh: '尺寸', emoji: '📏', cat: 'size' },
  { jp: '大きい', kana: 'おおきい', zh: '大的', emoji: '🔼', cat: 'size' },
  { jp: '小さい', kana: 'ちいさい', zh: '小的', emoji: '🔽', cat: 'size' },
  { jp: '長い', kana: 'ながい', zh: '長的', emoji: '↕️', cat: 'size' },
  { jp: '短い', kana: 'みじかい', zh: '短的', emoji: '↔️', cat: 'size' },
  { jp: '丈', kana: 'たけ', zh: '衣長／褲長', emoji: '📐', cat: 'size', tip: '「着丈」衣長、「股下」褲子內側長度' },
  { jp: 'ゆったり', kana: 'ゆったり', zh: '寬鬆', emoji: '🎈', cat: 'size' },
  { jp: '細身', kana: 'ほそみ', zh: '修身', emoji: '📍', cat: 'size' },
  { jp: '試着室', kana: 'しちゃくしつ', zh: '試衣間', emoji: '🚪', cat: 'size', tip: '有些店試衣間有件數限制，店員會問「何点ですか？」（幾件？）' },
  { jp: '裾上げ', kana: 'すそあげ', zh: '修改褲長', emoji: '✂️', cat: 'size', tip: '平價服飾連鎖店通常可以幫你修褲長，有時當天就能拿' },

  // 顏色
  { jp: '色', kana: 'いろ', zh: '顏色', emoji: '🎨', cat: 'color' },
  { jp: '白', kana: 'しろ', zh: '白色', emoji: '⚪', cat: 'color' },
  { jp: '黒', kana: 'くろ', zh: '黑色', emoji: '⚫', cat: 'color' },
  { jp: '赤', kana: 'あか', zh: '紅色', emoji: '🔴', cat: 'color' },
  { jp: '青', kana: 'あお', zh: '藍色', emoji: '🔵', cat: 'color' },
  { jp: '紺', kana: 'こん', zh: '深藍色（海軍藍）', emoji: '🟦', cat: 'color' },
  { jp: 'グレー', kana: 'ぐれー', zh: '灰色', emoji: '🩶', cat: 'color' },
  { jp: 'ベージュ', kana: 'べーじゅ', zh: '米色／卡其', emoji: '🟫', cat: 'color' },
  { jp: '茶色', kana: 'ちゃいろ', zh: '咖啡色', emoji: '🟤', cat: 'color' },
  { jp: '緑', kana: 'みどり', zh: '綠色', emoji: '🟢', cat: 'color' },
  { jp: '黄色', kana: 'きいろ', zh: '黃色', emoji: '🟡', cat: 'color' },
  { jp: 'ピンク', kana: 'ぴんく', zh: '粉紅色', emoji: '🩷', cat: 'color' },
  { jp: '色違い', kana: 'いろちがい', zh: '同款不同色', emoji: '🌈', cat: 'color' },

  // 材質・洗滌
  { jp: '素材', kana: 'そざい', zh: '材質', emoji: '🧵', cat: 'material' },
  { jp: '綿', kana: 'めん', zh: '棉', emoji: '☁️', cat: 'material' },
  { jp: '麻', kana: 'あさ', zh: '麻', emoji: '🌾', cat: 'material' },
  { jp: 'ウール', kana: 'うーる', zh: '羊毛', emoji: '🐑', cat: 'material' },
  { jp: 'ポリエステル', kana: 'ぽりえすてる', zh: '聚酯纖維', emoji: '🧪', cat: 'material' },
  { jp: '洗濯機', kana: 'せんたくき', zh: '洗衣機', emoji: '🫧', cat: 'material' },
  { jp: '手洗い', kana: 'てあらい', zh: '手洗（衣物）', emoji: '🙌', cat: 'material', tip: '跟廁所的「お手洗い」不同：衣服標籤上的「手洗い」是要用手洗' },
  { jp: '暖かい', kana: 'あたたかい', zh: '保暖的（天氣、衣物）', emoji: '🔥', cat: 'material', tip: '食物的「熱的」寫成「温かい」，讀音一樣' },
  { jp: '涼しい', kana: 'すずしい', zh: '涼爽的', emoji: '🌬️', cat: 'material' },

  // 價格・優惠
  { jp: 'セール', kana: 'せーる', zh: '特價', emoji: '🏷️', cat: 'price' },
  { jp: '値下げ', kana: 'ねさげ', zh: '降價', emoji: '📉', cat: 'price' },
  { jp: 'オフ', kana: 'おふ', zh: '折扣（〜％ OFF）', emoji: '✂️', cat: 'price', tip: '「30%オフ」= 減 30% = 打七折' },
  { jp: '半額', kana: 'はんがく', zh: '半價', emoji: '½', cat: 'price' },
  { jp: '期間限定', kana: 'きかんげんてい', zh: '期間限定', emoji: '⏳', cat: 'price' },
  { jp: '限定価格', kana: 'げんていかかく', zh: '限時特價', emoji: '💥', cat: 'price', tip: '常見寫法「期間限定価格」：只在這段期間是這個價格' },
  { jp: '価格', kana: 'かかく', zh: '價格', emoji: '💴', cat: 'price' },
  { jp: '本体価格', kana: 'ほんたいかかく', zh: '未稅價', emoji: '💴', cat: 'price', tip: '結帳時會再加 10% 消費稅' },
  { jp: '税込価格', kana: 'ぜいこみかかく', zh: '含稅價', emoji: '💴', cat: 'price' },
  { jp: '一点限り', kana: 'いってんかぎり', zh: '只剩一件', emoji: '☝️', cat: 'price' },
  { jp: 'まとめ買い', kana: 'まとめがい', zh: '多件優惠', emoji: '🛍️', cat: 'price', tip: '例：「2点で1,990円」= 兩件 1,990 円' },
  { jp: '会員', kana: 'かいいん', zh: '會員', emoji: '🪪', cat: 'price' },
  { jp: 'ポイント', kana: 'ぽいんと', zh: '點數', emoji: '⭐', cat: 'price' },

  // 結帳・服務
  { jp: 'レジ', kana: 'れじ', zh: '收銀台', emoji: '🧾', cat: 'service' },
  { jp: 'セルフレジ', kana: 'せるふれじ', zh: '自助結帳機', emoji: '🤖', cat: 'service', tip: '很多平價服飾店是把籃子放進機器，自動讀取全部商品' },
  { jp: 'カゴ', kana: 'かご', zh: '購物籃', emoji: '🧺', cat: 'service' },
  { jp: 'お支払い', kana: 'おしはらい', zh: '付款', emoji: '💳', cat: 'service' },
  { jp: '現金', kana: 'げんきん', zh: '現金', emoji: '💵', cat: 'service' },
  { jp: 'クレジットカード', kana: 'くれじっとかーど', zh: '信用卡', emoji: '💳', cat: 'service' },
  { jp: '電子マネー', kana: 'でんしまねー', zh: '電子支付（如 Suica）', emoji: '📱', cat: 'service' },
  { jp: 'レシート', kana: 'れしーと', zh: '收據', emoji: '🧾', cat: 'service' },
  { jp: '免税', kana: 'めんぜい', zh: '免稅', emoji: '🛂', cat: 'service', tip: '通常同一天同一店消費滿 5,000 円（未稅）以上才能免稅，要出示護照' },
  { jp: 'パスポート', kana: 'ぱすぽーと', zh: '護照', emoji: '🛂', cat: 'service' },
  { jp: '返品', kana: 'へんぴん', zh: '退貨', emoji: '↩️', cat: 'service' },
  { jp: '交換', kana: 'こうかん', zh: '換貨', emoji: '🔄', cat: 'service' },
  { jp: '在庫', kana: 'ざいこ', zh: '庫存', emoji: '📦', cat: 'service' },
  { jp: '再入荷', kana: 'さいにゅうか', zh: '補貨／重新到貨', emoji: '🚚', cat: 'service' },
  { jp: '有料', kana: 'ゆうりょう', zh: '要付費', emoji: '💰', cat: 'service', tip: '「レジ袋は有料です」= 塑膠袋要付費' },
  { jp: 'レジ袋', kana: 'れじぶくろ', zh: '塑膠購物袋', emoji: '🛍️', cat: 'service' },

  // 生活雜貨（像無印良品這類店）
  { jp: '生活雑貨', kana: 'せいかつざっか', zh: '生活雜貨', emoji: '🏠', cat: 'goods' },
  { jp: '文房具', kana: 'ぶんぼうぐ', zh: '文具', emoji: '✏️', cat: 'goods' },
  { jp: '収納', kana: 'しゅうのう', zh: '收納', emoji: '🗃️', cat: 'goods' },
  { jp: '化粧水', kana: 'けしょうすい', zh: '化妝水', emoji: '🧴', cat: 'goods' },
  { jp: '乳液', kana: 'にゅうえき', zh: '乳液', emoji: '🧴', cat: 'goods' },
  { jp: '日焼け止め', kana: 'ひやけどめ', zh: '防曬乳', emoji: '☀️', cat: 'goods' },
  { jp: '敏感肌用', kana: 'びんかんはだよう', zh: '敏感肌用', emoji: '🌿', cat: 'goods' },
  { jp: '詰め替え', kana: 'つめかえ', zh: '補充包', emoji: '♻️', cat: 'goods' },
  { jp: '食品', kana: 'しょくひん', zh: '食品', emoji: '🍪', cat: 'goods' },
  { jp: 'お菓子', kana: 'おかし', zh: '零食', emoji: '🍬', cat: 'goods' },
  { jp: '無印良品', kana: 'むじるしりょうひん', zh: '無印良品（店名讀法）', emoji: '🏷️', cat: 'goods', tip: '日本人常簡稱「無印（むじるし）」' },
];

// 模擬店內看板。每一行是一串「片段」：
//   字串            → 一般文字（不可點）
//   { v: 'メンズ' }  → 連到上面 SHOP 的單字
//   { t, kana, zh } → 這塊看板專用的詞
export const BOARDS = [
  {
    id: 'tag',
    title: '服飾店價格標籤',
    style: 'tag',
    tip: '價格標籤上最重要的是：價格是「含稅」還是「未稅」、有沒有「期間限定」。',
    lines: [
      [{ v: 'メンズ' }, '　', { t: 'クルーネック', kana: 'くるーねっく', zh: '圓領' }, { v: 'Tシャツ' }],
      ['（', { v: '半袖' }, '）'],
      [{ v: 'サイズ' }, '：M　', { v: '色' }, '：09 ', { v: '黒' }],
      [{ v: '素材' }, '：', { v: '綿' }, '100%'],
      [{ v: '期間限定' }, { v: '価格' }],
      ['¥1,990 → ¥1,500 ', { t: '税込', kana: 'ぜいこみ', zh: '含稅' }],
    ],
  },
  {
    id: 'floor',
    title: '樓層導覽',
    style: 'floor',
    tip: '日本的 1 樓就是地面層（跟台灣一樣），地下一樓寫 B1 或「地下1階」。',
    lines: [
      ['3F　', { v: 'レディース' }, '・', { v: 'ベビー' }],
      ['2F　', { v: 'メンズ' }, '・', { v: 'キッズ' }],
      ['1F　', { v: '新作' }, '・', { v: '雑貨' }, '・', { v: 'レジ' }],
      ['B1　', { v: '靴' }, '・', { v: '下着' }, '・', { v: '免税' }, { t: 'カウンター', kana: 'かうんたー', zh: '櫃台' }],
    ],
  },
  {
    id: 'sale',
    title: '店內告示',
    style: 'sale',
    tip: '「〜％オフ」是減掉的比例：30%オフ = 打七折，50%オフ = 半價。',
    lines: [
      [{ v: 'セール' }, '　', { t: '開催中', kana: 'かいさいちゅう', zh: '舉辦中' }],
      [{ v: 'アウター' }, '　', '30%', { v: 'オフ' }],
      [{ v: 'まとめ買い' }, '：2', { t: '点で', kana: 'てんで', zh: '件合計' }, ' ¥2,990'],
      [{ t: 'こちらの商品は', kana: 'こちらのしょうひんは', zh: '這邊的商品' }, { v: '返品' }, '・', { v: '交換' }, { t: 'できません', kana: 'できません', zh: '不能（辦理）' }],
    ],
  },
  {
    id: 'register',
    title: '自助結帳機畫面',
    style: 'screen',
    tip: '自助結帳通常是：放下購物籃 → 確認商品 → 選擇付款方式 → 拿收據。',
    lines: [
      [{ v: 'カゴ' }, { t: 'を置いてください', kana: 'をおいてください', zh: '請放下（購物籃）' }],
      [{ v: 'お支払い' }, { t: '方法を選んでください', kana: 'ほうほうをえらんでください', zh: '請選擇（付款）方式' }],
      ['［', { v: '現金' }, '］［', { v: 'クレジットカード' }, '］［', { v: '電子マネー' }, '］'],
      [{ v: 'レジ袋' }, '（', { v: '有料' }, '）', { t: 'は必要ですか', kana: 'はひつようですか', zh: '需要嗎？' }],
      [{ v: 'レシート' }, { t: 'をお取りください', kana: 'をおとりください', zh: '請拿取（收據）' }],
    ],
  },
  {
    id: 'goods',
    title: '生活雜貨店商品標示',
    style: 'goods',
    tip: '保養品常見：化粧水（化妝水）、乳液、日焼け止め（防曬）。「詰め替え」是補充包，比較便宜。',
    lines: [
      [{ v: '敏感肌用' }, '　', { v: '化粧水' }],
      [{ t: 'しっとりタイプ', kana: 'しっとりたいぷ', zh: '滋潤型' }, '　200ml'],
      [{ v: '詰め替え' }, { t: '用', kana: 'よう', zh: '用' }, '　¥990'],
      [{ v: '日焼け止め' }, '　', { t: 'SPF50', kana: 'えすぴーえふごじゅう', zh: '防曬係數 50' }],
    ],
  },
];

// 日本服飾尺寸參考（一般平價服飾，實際以各品牌為準）
export const SIZE_TABLE = [
  { jp: 'XS', men: '身高 155～165', women: '身高 145～155' },
  { jp: 'S', men: '身高 160～170', women: '身高 150～160' },
  { jp: 'M', men: '身高 165～175', women: '身高 155～165' },
  { jp: 'L', men: '身高 170～180', women: '身高 160～170' },
  { jp: 'XL', men: '身高 175～185', women: '身高 165～175' },
];
