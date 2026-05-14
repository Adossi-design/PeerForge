-- AlterTable
ALTER TABLE "User" ADD COLUMN "interests" TEXT;
ALTER TABLE "User" ADD COLUMN "linkedinUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Discussion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PROJECT',
    "pinnedMessages" TEXT,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Discussion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Discussion" ("createdAt", "description", "id", "memberCount", "messageCount", "name", "pinnedMessages", "postId", "updatedAt") SELECT "createdAt", "description", "id", "memberCount", "messageCount", "name", "pinnedMessages", "postId", "updatedAt" FROM "Discussion";
DROP TABLE "Discussion";
ALTER TABLE "new_Discussion" RENAME TO "Discussion";
CREATE UNIQUE INDEX "Discussion_postId_key" ON "Discussion"("postId");
CREATE INDEX "Discussion_postId_idx" ON "Discussion"("postId");
CREATE INDEX "Discussion_createdAt_idx" ON "Discussion"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
