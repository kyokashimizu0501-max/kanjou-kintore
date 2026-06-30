-- CreateTable
CREATE TABLE "EmotionLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emotionType" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "situationTag" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Action" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "emotionLogId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionDetail" TEXT,
    "isCustomTag" BOOLEAN NOT NULL DEFAULT false,
    "effectivenessScore" INTEGER,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Action_emotionLogId_fkey" FOREIGN KEY ("emotionLogId") REFERENCES "EmotionLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CopingStrategy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "strategyName" TEXT NOT NULL,
    "emotionType" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "totalUsed" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CopingCommit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actionId" INTEGER NOT NULL,
    "copingStrategyId" INTEGER NOT NULL,
    "committedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedAt" DATETIME,
    "effectScore" INTEGER,
    CONSTRAINT "CopingCommit_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CopingCommit_copingStrategyId_fkey" FOREIGN KEY ("copingStrategyId") REFERENCES "CopingStrategy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SimilarSituation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logAId" INTEGER NOT NULL,
    "logBId" INTEGER NOT NULL,
    "similarityScore" REAL NOT NULL,
    "wasHelpful" BOOLEAN,
    CONSTRAINT "SimilarSituation_logAId_fkey" FOREIGN KEY ("logAId") REFERENCES "EmotionLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SimilarSituation_logBId_fkey" FOREIGN KEY ("logBId") REFERENCES "EmotionLog" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "totalLogs" INTEGER NOT NULL DEFAULT 0,
    "firstUxDemoSeen" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomTag_label_key" ON "CustomTag"("label");
