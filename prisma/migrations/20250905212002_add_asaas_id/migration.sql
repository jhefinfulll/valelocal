/*
  Warnings:

  - A unique constraint covering the columns `[asaasId]` on the table `estabelecimentos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."estabelecimentos" ADD COLUMN     "asaasId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "estabelecimentos_asaasId_key" ON "public"."estabelecimentos"("asaasId");
