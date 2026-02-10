-- CreateTable
CREATE TABLE "board_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lists" JSONB NOT NULL,
    "workspaceId" TEXT,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "board_templates_workspaceId_idx" ON "board_templates"("workspaceId");

-- CreateIndex
CREATE INDEX "board_templates_creatorId_idx" ON "board_templates"("creatorId");

-- AddForeignKey
ALTER TABLE "board_templates" ADD CONSTRAINT "board_templates_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "board_templates" ADD CONSTRAINT "board_templates_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
