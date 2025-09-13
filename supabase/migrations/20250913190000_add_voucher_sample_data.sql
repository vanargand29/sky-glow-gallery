-- Add sample voucher data and link them to categories
-- This migration creates sample vouchers and links them to existing categories

-- First, let's create some sample vouchers if they don't exist
INSERT INTO vouchers (code, discount_amount, usage_limit, valid_from, valid_until, is_active)
VALUES 
  ('WELCOME10', 10000, 100, NOW(), NOW() + INTERVAL '30 days', true),
  ('SEASON20', 20000, 50, NOW(), NOW() + INTERVAL '14 days', true),
  ('COSMETIC15', 15000, 75, NOW(), NOW() + INTERVAL '7 days', true),
  ('UNIVERSAL25', 25000, 25, NOW(), NOW() + INTERVAL '3 days', true)
ON CONFLICT (code) DO NOTHING;

-- Link vouchers to categories
-- WELCOME10 - applicable to all categories
INSERT INTO voucher_applicable_categories (voucher_id, category_id)
SELECT v.id, c.id
FROM vouchers v, categories c
WHERE v.code = 'WELCOME10'
ON CONFLICT (voucher_id, category_id) DO NOTHING;

-- SEASON20 - only for Season Pass category
INSERT INTO voucher_applicable_categories (voucher_id, category_id)
SELECT v.id, c.id
FROM vouchers v, categories c
WHERE v.code = 'SEASON20' AND c.name = 'Season Pass'
ON CONFLICT (voucher_id, category_id) DO NOTHING;

-- COSMETIC15 - only for Cosmetics category
INSERT INTO voucher_applicable_categories (voucher_id, category_id)
SELECT v.id, c.id
FROM vouchers v, categories c
WHERE v.code = 'COSMETIC15' AND c.name = 'Cosmetics'
ON CONFLICT (voucher_id, category_id) DO NOTHING;

-- UNIVERSAL25 - no category restrictions (universal voucher)
-- Note: Universal vouchers don't need entries in voucher_applicable_categories
-- They work for all items when the table is empty for that voucher
