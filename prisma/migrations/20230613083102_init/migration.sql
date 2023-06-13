-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramId" BIGINT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "name" TEXT,
    "subscribe" BIGINT NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
