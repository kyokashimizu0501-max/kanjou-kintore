import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

const defaultStrategies = [
  // イライラ・怒り
  { strategyName: "その場を5分離れる", emotionType: "anger" },
  { strategyName: "深呼吸を3回する", emotionType: "anger" },
  { strategyName: "感情をメモに書き出す", emotionType: "anger" },
  { strategyName: "冷たい水を飲む", emotionType: "anger" },
  { strategyName: "音楽を聴く", emotionType: "anger" },
  // 悲しい・辛い
  { strategyName: "5分だけ泣く（時間を決める）", emotionType: "sadness" },
  { strategyName: "外の空気を吸いに行く", emotionType: "sadness" },
  { strategyName: "誰かに一言だけ話す", emotionType: "sadness" },
  { strategyName: "好きな動画・音楽を見る", emotionType: "sadness" },
  { strategyName: "小さな作業を1つだけやる", emotionType: "sadness" },
  // 不安・焦り
  { strategyName: "心配事を紙に書き出す", emotionType: "anxiety" },
  { strategyName: "今日できることだけリストにする", emotionType: "anxiety" },
  { strategyName: "深呼吸を5回する", emotionType: "anxiety" },
  { strategyName: "5分間だけ別のことをする", emotionType: "anxiety" },
  { strategyName: "最悪のケースを書いて客観視する", emotionType: "anxiety" },
  // 嬉しい・ワクワク
  { strategyName: "やりたいことをメモする", emotionType: "joy" },
  { strategyName: "次の目標を1つ決める", emotionType: "joy" },
  { strategyName: "誰かに話してシェアする", emotionType: "joy" },
  { strategyName: "すぐできる小さな挑戦を始める", emotionType: "joy" },
  { strategyName: "今の気持ちを日記に残す", emotionType: "joy" },
];

async function main() {
  for (const s of defaultStrategies) {
    await prisma.copingStrategy.create({
      data: { ...s, isDefault: true },
    });
  }

  await prisma.appState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  console.log("Seed completed: 20 default strategies inserted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
