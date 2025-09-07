-- Add status column to items table
ALTER TABLE items 
ADD COLUMN status TEXT 
DEFAULT 'Tersedia' 
CHECK (status IN ('Tersedia', 'Best Seller', 'Close', 'Diskon', 'New'));

-- Update existing rows to have a default status
UPDATE items SET status = 'Tersedia' WHERE status IS NULL;
