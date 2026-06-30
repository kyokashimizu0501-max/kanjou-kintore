-- CreateTable
CREATE TABLE "EmotionLog" (
    "id" SERIAL NOT NULL,
    "emotionType" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "situationTag" TEXT,
    "eventText" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmotionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Action" (
    "id" SERIAL NOT NULL,
    "emotionLogId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionDetail" TEXT,
    "isCustomTag" BOOLEAN NOT NULL DEFAULT false,
    "effectivenessScore" INTEGER,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopingStrategy" (
    "id" SERIAL NOT NULL,
    "strategyName" TEXT NOT NULL,
    "emotionType" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "totalUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CopingStrategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopingCommit" (
    "id" SERIAL NOT NULL,
    "actionId" INTEGER NOT NULL,
    "copingStrategyId" INTEGER NOT NULL,
    "committedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedAt" TIMESTAMP(3),
    "effectScore" INTEGER,

    CONSTRAINT "CopingCommit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimilarSituation" (
    "id" SERIAL NOT NULL,
    "logAId" INTEGER NOT NULL,
    "logBId" INTEGER NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "wasHelpful" BOOLEAN,

    CONSTRAINT "SimilarSituation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTag" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "totalLogs" INTEGER NOT NULL DEFAULT 0,
    "firstUxDemoSeen" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mbtiType" TEXT,
    "emotionTendency" TEXT,
    "goal" TEXT,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT NOT NULL DEFAULT '21:00',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomTag_label_key" ON "CustomTag"("label");

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_emotionLogId_fkey" FOREIGN KEY ("emotionLogId") REFERENCES "EmotionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopingCommit" ADD CONSTRAINT "CopingCommit_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopingCommit" ADD CONSTRAINT "CopingCommit_copingStrategyId_fkey" FOREIGN KEY ("copingStrategyId") REFERENCES "CopingStrategy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarSituation" ADD CONSTRAINT "SimilarSituation_logAId_fkey" FOREIGN KEY ("logAId") REFERENCES "EmotionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimilarSituation" ADD CONSTRAINT "SimilarSituation_logBId_fkey" FOREIGN KEY ("logBId") REFERENCES "EmotionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
