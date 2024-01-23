-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramId" BIGINT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "name" TEXT,
    "subscribe" BIGINT NOT NULL DEFAULT 0,
    "tgUser" TEXT,
    "voice" TEXT,
    "character" TEXT
);
INSERT INTO "new_User" ("character", "id", "name", "role", "subscribe", "telegramId", "tgUser", "voice") SELECT "character", "id", "name", "role", "subscribe", "telegramId", "tgUser", "voice" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
