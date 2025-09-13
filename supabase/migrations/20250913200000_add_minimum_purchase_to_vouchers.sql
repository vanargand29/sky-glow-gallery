-- Add minimum purchase amount to vouchers table
ALTER TABLE vouchers ADD COLUMN minimum_purchase_amount INTEGER DEFAULT 0 CHECK (minimum_purchase_amount >= 0);

-- Add comment for clarity
COMMENT ON COLUMN vouchers.minimum_purchase_amount IS 'Minimum purchase amount required to use this voucher (in rupiah)';
