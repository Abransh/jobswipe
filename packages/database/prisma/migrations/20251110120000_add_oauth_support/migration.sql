-- AlterTable: Add OAuth tracking fields to users table
ALTER TABLE "users"
  ADD COLUMN "oauth_providers" TEXT[] DEFAULT '{}',
  ADD COLUMN "primary_auth_provider" TEXT;

-- CreateTable: OAuth state management for CSRF protection
CREATE TABLE "oauth_states" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "code_verifier" TEXT,
    "provider" TEXT NOT NULL,
    "redirect_uri" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_states_state_key" ON "oauth_states"("state");

-- CreateIndex
CREATE INDEX "oauth_states_state_idx" ON "oauth_states"("state");

-- CreateIndex
CREATE INDEX "oauth_states_expires_at_idx" ON "oauth_states"("expiresAt");

-- CreateIndex
CREATE INDEX "oauth_states_provider_idx" ON "oauth_states"("provider");

-- Add comment for documentation
COMMENT ON TABLE "oauth_states" IS 'Stores OAuth state tokens for CSRF protection during OAuth flows';
COMMENT ON COLUMN "oauth_states"."code_verifier" IS 'PKCE code verifier for enhanced OAuth security';
COMMENT ON COLUMN "users"."oauth_providers" IS 'Array of linked OAuth providers (google, github, linkedin)';
COMMENT ON COLUMN "users"."primary_auth_provider" IS 'Primary authentication method (email, google, github, linkedin)';
