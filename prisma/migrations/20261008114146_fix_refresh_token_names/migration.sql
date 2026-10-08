-- Rename table without losing data
ALTER TABLE "RefreshTokens"
RENAME TO "RefreshToken";

-- Fix column name
ALTER TABLE "RefreshToken"
RENAME COLUMN "expriesAt" TO "expiresAt";

-- Rename primary key constraint
ALTER TABLE "RefreshToken"
RENAME CONSTRAINT "RefreshTokens_pkey" TO "RefreshToken_pkey";

-- Rename foreign key constraint
ALTER TABLE "RefreshToken"
RENAME CONSTRAINT "RefreshTokens_userId_fkey"
TO "RefreshToken_userId_fkey";

-- Rename unique index
ALTER INDEX "RefreshTokens_tokenHash_key"
RENAME TO "RefreshToken_tokenHash_key";

-- Rename userId index
ALTER INDEX "RefreshTokens_userId_idx"
RENAME TO "RefreshToken_userId_idx";