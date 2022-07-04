-- CreateTable
CREATE TABLE "RedirectUrl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "redirectUrl" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "visitorsAllowed" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RedirectUrl_urlId_key" ON "RedirectUrl"("urlId");
