-- CreateTable
CREATE TABLE "sale_logs" (
    "id" SERIAL NOT NULL,
    "sale_id" INTEGER NOT NULL,
    "buyer_uuid" UUID NOT NULL,
    "seller_uuid" UUID NOT NULL,
    "photocard_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sale_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sale_logs_sale_id_idx" ON "sale_logs"("sale_id");

-- CreateIndex
CREATE INDEX "sale_logs_buyer_uuid_idx" ON "sale_logs"("buyer_uuid");

-- CreateIndex
CREATE INDEX "sale_logs_seller_uuid_idx" ON "sale_logs"("seller_uuid");

-- CreateIndex
CREATE INDEX "sale_logs_photocard_id_idx" ON "sale_logs"("photocard_id");

-- AddForeignKey
ALTER TABLE "sale_logs" ADD CONSTRAINT "sale_logs_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_logs" ADD CONSTRAINT "sale_logs_buyer_uuid_fkey" FOREIGN KEY ("buyer_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_logs" ADD CONSTRAINT "sale_logs_seller_uuid_fkey" FOREIGN KEY ("seller_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_logs" ADD CONSTRAINT "sale_logs_photocard_id_fkey" FOREIGN KEY ("photocard_id") REFERENCES "photocards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
