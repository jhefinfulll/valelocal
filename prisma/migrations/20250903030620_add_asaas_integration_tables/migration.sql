/*
  Warnings:

  - The `status` column on the `estabelecimentos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[asaasCustomerId]` on the table `franqueados` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."CobrancaStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EstabelecimentoStatus" AS ENUM ('RASCUNHO', 'PENDENTE_PAGAMENTO', 'ATIVO', 'SUSPENSO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "public"."TipoCobranca" AS ENUM ('ATIVACAO_ESTABELECIMENTO', 'REPOSICAO_CARTOES');

-- AlterTable
ALTER TABLE "public"."estabelecimentos" ADD COLUMN     "ativadoEm" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."EstabelecimentoStatus" NOT NULL DEFAULT 'ATIVO';

-- AlterTable
ALTER TABLE "public"."franqueados" ADD COLUMN     "asaasCustomerId" TEXT;

-- CreateTable
CREATE TABLE "public"."configuracoes_sistema" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "configuracoes_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cobrancas" (
    "id" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "franqueadoId" TEXT NOT NULL,
    "asaasChargeId" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" "public"."CobrancaStatus" NOT NULL DEFAULT 'PENDING',
    "tipo" "public"."TipoCobranca" NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,
    "urlPagamento" TEXT,
    "pixQrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "cobrancas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_sistema_chave_key" ON "public"."configuracoes_sistema"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "cobrancas_asaasChargeId_key" ON "public"."cobrancas"("asaasChargeId");

-- CreateIndex
CREATE UNIQUE INDEX "franqueados_asaasCustomerId_key" ON "public"."franqueados"("asaasCustomerId");

-- AddForeignKey
ALTER TABLE "public"."cobrancas" ADD CONSTRAINT "cobrancas_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cobrancas" ADD CONSTRAINT "cobrancas_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
