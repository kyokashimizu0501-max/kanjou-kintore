export const EMOTION_TYPES = [
  {
    id: "anger",
    label: "イライラ・怒り",
    emoji: "😤",
    color: "bg-red-100 border-red-300 text-red-700",
  },
  {
    id: "sadness",
    label: "悲しい・辛い",
    emoji: "😢",
    color: "bg-blue-100 border-blue-300 text-blue-700",
  },
  {
    id: "anxiety",
    label: "不安・焦り",
    emoji: "😰",
    color: "bg-yellow-100 border-yellow-300 text-yellow-700",
  },
  {
    id: "joy",
    label: "嬉しい・ワクワク",
    emoji: "😊",
    color: "bg-green-100 border-green-300 text-green-700",
  },
] as const;

export type EmotionTypeId = (typeof EMOTION_TYPES)[number]["id"];

export const SITUATION_TAGS = [
  { id: "work", label: "職場・仕事" },
  { id: "family", label: "家族・家庭" },
  { id: "relationship", label: "友人・人間関係" },
  { id: "sns", label: "SNS・ネット" },
  { id: "money", label: "お金・生活" },
  { id: "self", label: "自分自身" },
  { id: "other", label: "その他" },
] as const;

export const POST_ACTIONS = [
  { id: "binge_eating", label: "爆食いした" },
  { id: "bad_mouthing", label: "悪口を言った" },
  { id: "withdrawal", label: "引きこもった" },
  { id: "endured", label: "我慢した" },
  { id: "walked", label: "散歩した" },
  { id: "talked", label: "誰かに話した" },
  { id: "cried", label: "泣いた" },
  { id: "focused_work", label: "仕事に集中した" },
  { id: "wrote_memo", label: "メモを書いた" },
  { id: "did_nothing", label: "何もしなかった" },
  { id: "custom", label: "その他（自由記入）" },
] as const;

export const INTENSITY_LABELS = [
  "",
  "少し",
  "やや",
  "普通",
  "かなり",
  "非常に強く",
] as const;

export const TIME_OF_DAY = (
  hour: number,
): "morning" | "afternoon" | "night" => {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "night";
};

// MBTI診断（4軸 × 2問）
export const MBTI_QUESTIONS = [
  {
    axis: "EI",
    question: "友人と長い時間を過ごした後、どちらを感じやすいですか？",
    options: [
      { label: "元気になる・充電できた気がする", value: "E" },
      { label: "少し疲れる・一人の時間が欲しくなる", value: "I" },
    ],
  },
  {
    axis: "EI",
    question: "初対面の場で、どちらに近いですか？",
    options: [
      { label: "自分から話しかけることが多い", value: "E" },
      { label: "話しかけられるのを待つことが多い", value: "I" },
    ],
  },
  {
    axis: "SN",
    question: "何かを決めるとき、どちらを重視しますか？",
    options: [
      { label: "実績・実例・具体的なデータ", value: "S" },
      { label: "直感・可能性・将来のビジョン", value: "N" },
    ],
  },
  {
    axis: "SN",
    question: "得意な作業はどちらですか？",
    options: [
      { label: "手順が決まった確実な作業", value: "S" },
      { label: "ゼロから考えるアイデア出し", value: "N" },
    ],
  },
  {
    axis: "TF",
    question: "友人から悩みを相談されたとき、まず何をしますか？",
    options: [
      { label: "原因を分析して解決策を提案する", value: "T" },
      { label: "「つらかったね」と気持ちに共感する", value: "F" },
    ],
  },
  {
    axis: "TF",
    question: "意思決定のとき、どちらが強く働きますか？",
    options: [
      { label: "論理・データ・客観的な正しさ", value: "T" },
      { label: "気持ち・関係性・周囲への影響", value: "F" },
    ],
  },
  {
    axis: "JP",
    question: "旅行のスタイルはどちらに近いですか？",
    options: [
      { label: "行程を細かく決めてから動く", value: "J" },
      { label: "目的地だけ決めて後は流れで", value: "P" },
    ],
  },
  {
    axis: "JP",
    question: "締め切りのある作業、どちらに近いですか？",
    options: [
      { label: "早めに終わらせてスッキリしたい", value: "J" },
      { label: "締め切り前日に本気スイッチが入る", value: "P" },
    ],
  },
] as const;

// 感情傾向診断（5問）
export const TENDENCY_QUESTIONS = [
  {
    question: "予定が急にキャンセルされたとき、最初に何を感じますか？",
    options: [
      { label: "イライラ・怒り", value: "anger" },
      { label: "不安・どうしよう", value: "anxiety" },
      { label: "悲しい・がっかり", value: "sadness" },
    ],
  },
  {
    question: "人に傷つくことを言われたとき、どう感じますか？",
    options: [
      { label: "怒りが湧く", value: "anger" },
      { label: "悲しくなる・落ち込む", value: "sadness" },
      { label: "不安・自分が悪いのかと思う", value: "anxiety" },
    ],
  },
  {
    question: "大切なことが決まらず、宙ぶらりんな状況が続くとき？",
    options: [
      { label: "イライラ・早く決まってほしい", value: "anger" },
      { label: "不安・ソワソワする", value: "anxiety" },
      { label: "特に気にならない", value: "joy" },
    ],
  },
  {
    question: "自分がミスをしてしまったとき？",
    options: [
      { label: "なぜこうなった・怒り気味", value: "anger" },
      { label: "落ち込む・自分を責める", value: "sadness" },
      { label: "どうしよう・焦り", value: "anxiety" },
    ],
  },
  {
    question: "感情が一番揺れるのはどんな場面？",
    options: [
      { label: "人との衝突・摩擦", value: "anger" },
      { label: "自分が情けなくなる瞬間", value: "sadness" },
      { label: "将来や先が見えないとき", value: "anxiety" },
    ],
  },
] as const;

// MBTI×感情傾向から目標を生成
export function suggestGoal(mbtiType: string, primaryTendency: string): string {
  const tf = mbtiType[2]; // T or F
  const jp = mbtiType[3]; // J or P

  if (primaryTendency === "anger" && tf === "T") {
    return "怒りを感じたとき、すぐ行動する前に1分待ち、論理的に状況を整理する習慣をつける";
  }
  if (primaryTendency === "anger" && tf === "F") {
    return "怒りの裏にある本当の気持ちを言葉にして、誰かに伝える練習をする";
  }
  if (primaryTendency === "sadness" && tf === "T") {
    return "落ち込んだとき、原因を客観的に分析して次にできる行動を1つ決める";
  }
  if (primaryTendency === "sadness" && tf === "F") {
    return "悲しみを感じたとき、自分を責めず「それでいい」と受け入れる言葉をかける";
  }
  if (primaryTendency === "anxiety" && jp === "J") {
    return "不安を感じたら、具体的にできることをリストアップして一つずつ対処する";
  }
  if (primaryTendency === "anxiety" && jp === "P") {
    return "不安なとき、信頼できる人に話して気持ちを整理してから動き出す";
  }
  return "感情が高ぶった瞬間に、行動の前に一息ついて自分に問いかける習慣をつける";
}
