-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramId" BIGINT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "name" TEXT,
    "subscribe" BIGINT NOT NULL DEFAULT 0,
    "tgUser" TEXT NOT NULL,
    "voice" TEXT NOT NULL DEFAULT 'alena',
    "character" TEXT
);

-- CreateTable
CREATE TABLE "Voice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "language" TEXT NOT NULL,
    "languageCode" TEXT NOT NULL,
    "voice" TEXT NOT NULL,
    "gender" TEXT
);

-- CreateTable
CREATE TABLE "Character" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CharacterToVoice" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CharacterToVoice_A_fkey" FOREIGN KEY ("A") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CharacterToVoice_B_fkey" FOREIGN KEY ("B") REFERENCES "Voice" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Voice_voice_key" ON "Voice"("voice");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Character_role_key" ON "Character"("role");

-- CreateIndex
CREATE UNIQUE INDEX "_CharacterToVoice_AB_unique" ON "_CharacterToVoice"("A", "B");

-- CreateIndex
CREATE INDEX "_CharacterToVoice_B_index" ON "_CharacterToVoice"("B");
