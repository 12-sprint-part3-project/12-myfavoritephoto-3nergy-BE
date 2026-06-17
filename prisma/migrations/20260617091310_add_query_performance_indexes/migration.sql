-- CreateIndex
CREATE INDEX "sales_user_uuid_status_idx" ON "sales"("user_uuid", "status");

-- CreateIndex
CREATE INDEX "sales_status_created_at_idx" ON "sales"("status", "created_at");

-- CreateIndex
CREATE INDEX "trades_sale_id_status_idx" ON "trades"("sale_id", "status");

-- CreateIndex
CREATE INDEX "trades_proposer_uuid_status_idx" ON "trades"("proposer_uuid", "status");

-- CreateIndex
CREATE INDEX "trades_receiver_uuid_status_idx" ON "trades"("receiver_uuid", "status");

-- CreateIndex
CREATE INDEX "user_photocards_owner_uuid_status_idx" ON "user_photocards"("owner_uuid", "status");

-- CreateIndex
CREATE INDEX "user_photocards_owner_uuid_photocard_id_status_idx" ON "user_photocards"("owner_uuid", "photocard_id", "status");
