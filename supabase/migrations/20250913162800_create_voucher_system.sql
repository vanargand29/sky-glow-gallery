-- Create vouchers table
CREATE TABLE vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_amount INTEGER NOT NULL CHECK (discount_amount > 0),
    usage_limit INTEGER DEFAULT NULL CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create voucher_applicable_games table for individual games
CREATE TABLE voucher_applicable_games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(voucher_id, game_id)
);

-- Create voucher_applicable_categories table for individual categories
CREATE TABLE voucher_applicable_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(voucher_id, category_id)
);

-- Create voucher_usage table to track usage
CREATE TABLE voucher_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE CASCADE,
    used_at TIMESTAMPTZ DEFAULT NOW(),
    cart_total INTEGER NOT NULL,
    discount_applied INTEGER NOT NULL,
    user_info JSONB DEFAULT NULL -- Can store user details if needed
);

-- Create indexes for better performance
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_active ON vouchers(is_active);
CREATE INDEX idx_vouchers_valid_dates ON vouchers(valid_from, valid_until);
CREATE INDEX idx_voucher_applicable_games_voucher_id ON voucher_applicable_games(voucher_id);
CREATE INDEX idx_voucher_applicable_categories_voucher_id ON voucher_applicable_categories(voucher_id);
CREATE INDEX idx_voucher_usage_voucher_id ON voucher_usage(voucher_id);

-- Create updated_at trigger for vouchers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_applicable_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_applicable_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for voucher validation)
CREATE POLICY "Allow public read access to active vouchers" ON vouchers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to voucher applicable categories" ON voucher_applicable_categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to voucher applicable games" ON voucher_applicable_games
    FOR SELECT USING (true);

-- Admin policies (full access)
CREATE POLICY "Allow admin full access to vouchers" ON vouchers
    FOR ALL USING (true);

CREATE POLICY "Allow admin full access to voucher applicable games" ON voucher_applicable_games
    FOR ALL USING (true);

CREATE POLICY "Allow admin full access to voucher applicable categories" ON voucher_applicable_categories
    FOR ALL USING (true);

-- Public can insert voucher usage when checking out
CREATE POLICY "Allow public insert to voucher usage" ON voucher_usage
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read access to voucher usage" ON voucher_usage
    FOR SELECT USING (true);
