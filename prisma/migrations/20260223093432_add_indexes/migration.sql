-- CreateIndex
CREATE INDEX "Blog_isPublished_createdAt_idx" ON "Blog"("isPublished", "createdAt");

-- CreateIndex
CREATE INDEX "Blog_slug_idx" ON "Blog"("slug");
