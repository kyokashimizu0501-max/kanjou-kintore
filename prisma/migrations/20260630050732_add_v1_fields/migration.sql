-- AlterTable
ALTER TABLE "EmotionLog" ADD COLUMN "eventText" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "totalLogs" INTEGER NOT NULL DEFAULT 0,
    "firstUxDemoSeen" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mbtiType" TEXT,
    "emotionTendency" TEXT,
    "goal" TEXT,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT NOT NULL DEFAULT '21:00',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_AppState" ("firstUxDemoSeen", "id", "totalLogs", "updatedAt") SELECT "firstUxDemoSeen", "id", "totalLogs", "updatedAt" FROM "AppState";
DROP TABLE "AppState";
ALTER TABLE "new_AppState" RENAME TO "AppState";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
