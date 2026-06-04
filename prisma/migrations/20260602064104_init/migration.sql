-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('common', 'rare', 'super_rare', 'legendary');

-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('album', 'special', 'landscape', 'season_greeting', 'fan_meeting', 'concert', 'md', 'collage', 'branding', 'etc');

-- CreateEnum
CREATE TYPE "UserPhotocardStatus" AS ENUM ('OWNED', 'ON_SALE', 'TRADE_PENDING');

-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('EVENT', 'BUY', 'SELL');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('SALE', 'SOLD_OUT', 'CANCELED');

-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PURCHASE_COMPLETED', 'SALE_COMPLETED', 'SOLD_OUT', 'TRADE_CANCELED_BY_SOLD_OUT', 'TRADE_PROPOSED', 'TRADE_CANCELED', 'TRADE_ACCEPTED', 'TRADE_REJECTED', 'SALE_STOPPED', 'SALE_UPDATED');

-- CreateEnum
CREATE TYPE "NotificationTargetType" AS ENUM ('MY_GALLERY', 'MY_SALE_PAGE', 'SALE_DETAIL');

-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "users" (
    "uuid" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "nickname" VARCHAR(30) NOT NULL,
    "provider" "Provider" NOT NULL,
    "provider_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "uuid" UUID NOT NULL,
    "user_uuid" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "photocards" (
    "id" SERIAL NOT NULL,
    "creator_uuid" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "image_url" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "grade" "Grade" NOT NULL,
    "genre" "Genre" NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "photocards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_photocards" (
    "id" SERIAL NOT NULL,
    "photocard_id" INTEGER NOT NULL,
    "owner_uuid" UUID NOT NULL,
    "serial_number" INTEGER NOT NULL,
    "status" "UserPhotocardStatus" NOT NULL,
    "acquired_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_photocards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_points" (
    "user_uuid" UUID NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_points_pkey" PRIMARY KEY ("user_uuid")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" SERIAL NOT NULL,
    "user_uuid" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_states" (
    "id" SERIAL NOT NULL,
    "user_uuid" UUID NOT NULL,
    "last_draw_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "reward_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" SERIAL NOT NULL,
    "user_uuid" UUID NOT NULL,
    "photocard_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "remaining_quantity" INTEGER NOT NULL,
    "status" "SaleStatus" NOT NULL,
    "desired_grade" "Grade" NOT NULL,
    "desired_genre" "Genre" NOT NULL,
    "desired_description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" SERIAL NOT NULL,
    "proposer_uuid" UUID NOT NULL,
    "receiver_uuid" UUID NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "offered_card_id" INTEGER NOT NULL,
    "status" "TradeStatus" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_uuid" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "target_type" "NotificationTargetType" NOT NULL,
    "target_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "histories" (
    "id" SERIAL NOT NULL,
    "table_name" VARCHAR(50) NOT NULL,
    "table_id" VARCHAR(255) NOT NULL,
    "operation_type" "OperationType" NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nickname_key" ON "users"("nickname");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_uuid_idx" ON "refresh_tokens"("user_uuid");

-- CreateIndex
CREATE INDEX "photocards_creator_uuid_idx" ON "photocards"("creator_uuid");

-- CreateIndex
CREATE INDEX "user_photocards_owner_uuid_idx" ON "user_photocards"("owner_uuid");

-- CreateIndex
CREATE INDEX "user_photocards_photocard_id_idx" ON "user_photocards"("photocard_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_photocards_photocard_id_serial_number_key" ON "user_photocards"("photocard_id", "serial_number");

-- CreateIndex
CREATE INDEX "point_transactions_user_uuid_idx" ON "point_transactions"("user_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "reward_states_user_uuid_key" ON "reward_states"("user_uuid");

-- CreateIndex
CREATE INDEX "sales_user_uuid_idx" ON "sales"("user_uuid");

-- CreateIndex
CREATE INDEX "sales_photocard_id_idx" ON "sales"("photocard_id");

-- CreateIndex
CREATE INDEX "trades_proposer_uuid_idx" ON "trades"("proposer_uuid");

-- CreateIndex
CREATE INDEX "trades_receiver_uuid_idx" ON "trades"("receiver_uuid");

-- CreateIndex
CREATE INDEX "trades_sale_id_idx" ON "trades"("sale_id");

-- CreateIndex
CREATE INDEX "trades_offered_card_id_idx" ON "trades"("offered_card_id");

-- CreateIndex
CREATE INDEX "notifications_user_uuid_idx" ON "notifications"("user_uuid");

-- CreateIndex
CREATE INDEX "notifications_target_type_target_id_idx" ON "notifications"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "histories_table_name_table_id_idx" ON "histories"("table_name", "table_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photocards" ADD CONSTRAINT "photocards_creator_uuid_fkey" FOREIGN KEY ("creator_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_photocards" ADD CONSTRAINT "user_photocards_photocard_id_fkey" FOREIGN KEY ("photocard_id") REFERENCES "photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_photocards" ADD CONSTRAINT "user_photocards_owner_uuid_fkey" FOREIGN KEY ("owner_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_states" ADD CONSTRAINT "reward_states_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_photocard_id_fkey" FOREIGN KEY ("photocard_id") REFERENCES "photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_proposer_uuid_fkey" FOREIGN KEY ("proposer_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_receiver_uuid_fkey" FOREIGN KEY ("receiver_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_offered_card_id_fkey" FOREIGN KEY ("offered_card_id") REFERENCES "user_photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE photocards
ADD CONSTRAINT photocards_total_quantity_check CHECK (total_quantity > 0);

ALTER TABLE photocards
ADD CONSTRAINT photocards_price_check CHECK (price >= 0);

ALTER TABLE user_points
ADD CONSTRAINT user_points_balance_check CHECK (balance >= 0);

ALTER TABLE point_transactions
ADD CONSTRAINT point_transactions_amount_check CHECK (amount != 0);

ALTER TABLE sales
ADD CONSTRAINT sales_price_check CHECK (price >= 0);

ALTER TABLE sales
ADD CONSTRAINT sales_quantity_check CHECK (quantity > 0);

ALTER TABLE sales
ADD CONSTRAINT sales_remaining_quantity_check
CHECK (remaining_quantity >= 0 AND remaining_quantity <= quantity);

ALTER TABLE notifications
ADD CONSTRAINT notifications_target_id_check
CHECK (
  (target_type IN ('MY_GALLERY', 'MY_SALE_PAGE') AND target_id IS NULL)
  OR
  (target_type = 'SALE_DETAIL' AND target_id IS NOT NULL)
);