-- CreateEnum
CREATE TYPE "public"."CartaoStatus" AS ENUM ('DISPONIVEL', 'ATIVO', 'UTILIZADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "public"."ComissaoStatus" AS ENUM ('PENDENTE', 'PAGA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."ConfigTipo" AS ENUM ('TEXTO', 'NUMERO', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "public"."DisplayStatus" AS ENUM ('DISPONIVEL', 'INSTALADO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "public"."DisplayTipo" AS ENUM ('BALCAO', 'PAREDE', 'MESA');

-- CreateEnum
CREATE TYPE "public"."SolicitacaoStatus" AS ENUM ('PENDENTE', 'APROVADA', 'NEGADA', 'ENVIADA', 'ENTREGUE');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "public"."TransacaoStatus" AS ENUM ('PENDENTE', 'CONCLUIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "public"."TransacaoTipo" AS ENUM ('RECARGA', 'UTILIZACAO');

-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('FRANQUEADORA', 'FRANQUEADO', 'ESTABELECIMENTO', 'USUARIO');

-- CreateTable
CREATE TABLE "public"."cartoes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "public"."CartaoStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "dataAtivacao" TIMESTAMP(3),
    "dataUtilizacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franqueadoId" TEXT NOT NULL,
    "estabelecimentoId" TEXT,
    "usuarioId" TEXT,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comissoes" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "percentual" DOUBLE PRECISION NOT NULL,
    "status" "public"."ComissaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franqueadoId" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "transacaoId" TEXT NOT NULL,

    CONSTRAINT "comissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."configuracoes" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "public"."ConfigTipo" NOT NULL DEFAULT 'TEXTO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."displays" (
    "id" TEXT NOT NULL,
    "tipo" "public"."DisplayTipo" NOT NULL,
    "status" "public"."DisplayStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "dataInstalacao" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franqueadoId" TEXT NOT NULL,
    "estabelecimentoId" TEXT,

    CONSTRAINT "displays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estabelecimento_coords" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,

    CONSTRAINT "estabelecimento_coords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."estabelecimentos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ATIVO',
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franqueadoId" TEXT NOT NULL,

    CONSTRAINT "estabelecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."franqueadoras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "logo" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franqueadoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."franqueados" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "comissionRate" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "status" "public"."Status" NOT NULL DEFAULT 'ATIVO',
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franqueadoraId" TEXT NOT NULL,

    CONSTRAINT "franqueados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."logs" (
    "id" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "entidadeId" TEXT NOT NULL,
    "dadosAnteriores" JSONB,
    "dadosNovos" JSONB,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "franqueadoraId" TEXT,
    "franqueadoId" TEXT,
    "estabelecimentoId" TEXT,
    "cartaoId" TEXT,
    "transacaoId" TEXT,
    "comissaoId" TEXT,
    "solicitacaoId" TEXT,
    "displayId" TEXT,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solicitacoes_cartao" (
    "id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "status" "public"."SolicitacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "observacoes" TEXT,
    "dataAprovacao" TIMESTAMP(3),
    "dataEnvio" TIMESTAMP(3),
    "dataEntrega" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,
    "franqueadoId" TEXT NOT NULL,

    CONSTRAINT "solicitacoes_cartao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transacoes" (
    "id" TEXT NOT NULL,
    "tipo" "public"."TransacaoTipo" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "status" "public"."TransacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "usuarioNome" TEXT,
    "usuarioTelefone" TEXT,
    "comprovante" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cartaoId" TEXT NOT NULL,
    "estabelecimentoId" TEXT NOT NULL,

    CONSTRAINT "transacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" "public"."UserType" NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'ATIVO',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "franqueadoraId" TEXT,
    "franqueadoId" TEXT,
    "estabelecimentoId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cartoes_codigo_key" ON "public"."cartoes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "cartoes_qrCode_key" ON "public"."cartoes"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_chave_key" ON "public"."configuracoes"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "estabelecimento_coords_estabelecimentoId_key" ON "public"."estabelecimento_coords"("estabelecimentoId");

-- CreateIndex
CREATE UNIQUE INDEX "estabelecimentos_cnpj_key" ON "public"."estabelecimentos"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "estabelecimentos_email_key" ON "public"."estabelecimentos"("email");

-- CreateIndex
CREATE UNIQUE INDEX "franqueadoras_cnpj_key" ON "public"."franqueadoras"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "franqueadoras_email_key" ON "public"."franqueadoras"("email");

-- CreateIndex
CREATE UNIQUE INDEX "franqueados_cnpj_key" ON "public"."franqueados"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "franqueados_email_key" ON "public"."franqueados"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."cartoes" ADD CONSTRAINT "cartoes_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cartoes" ADD CONSTRAINT "cartoes_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comissoes" ADD CONSTRAINT "comissoes_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comissoes" ADD CONSTRAINT "comissoes_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comissoes" ADD CONSTRAINT "comissoes_transacaoId_fkey" FOREIGN KEY ("transacaoId") REFERENCES "public"."transacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."displays" ADD CONSTRAINT "displays_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."displays" ADD CONSTRAINT "displays_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estabelecimento_coords" ADD CONSTRAINT "estabelecimento_coords_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estabelecimentos" ADD CONSTRAINT "estabelecimentos_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."franqueados" ADD CONSTRAINT "franqueados_franqueadoraId_fkey" FOREIGN KEY ("franqueadoraId") REFERENCES "public"."franqueadoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "public"."cartoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_comissaoId_fkey" FOREIGN KEY ("comissaoId") REFERENCES "public"."comissoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_displayId_fkey" FOREIGN KEY ("displayId") REFERENCES "public"."displays"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_franqueadoraId_fkey" FOREIGN KEY ("franqueadoraId") REFERENCES "public"."franqueadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "public"."solicitacoes_cartao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_transacaoId_fkey" FOREIGN KEY ("transacaoId") REFERENCES "public"."transacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitacoes_cartao" ADD CONSTRAINT "solicitacoes_cartao_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solicitacoes_cartao" ADD CONSTRAINT "solicitacoes_cartao_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transacoes" ADD CONSTRAINT "transacoes_cartaoId_fkey" FOREIGN KEY ("cartaoId") REFERENCES "public"."cartoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transacoes" ADD CONSTRAINT "transacoes_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_estabelecimentoId_fkey" FOREIGN KEY ("estabelecimentoId") REFERENCES "public"."estabelecimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_franqueadoId_fkey" FOREIGN KEY ("franqueadoId") REFERENCES "public"."franqueados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_franqueadoraId_fkey" FOREIGN KEY ("franqueadoraId") REFERENCES "public"."franqueadoras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
