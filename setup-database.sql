-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view items" ON public.items;
DROP POLICY IF EXISTS "Admin can manage items" ON public.items;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage categories" 
ON public.categories 
FOR ALL 
USING (auth.jwt() ->> 'email' = 'diajaya0@gmail.com');

-- Items policies (public read, admin write)
CREATE POLICY "Anyone can view items" 
ON public.items 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage items" 
ON public.items 
FOR ALL 
USING (auth.jwt() ->> 'email' = 'diajaya0@gmail.com');

-- Create function for updating timestamps (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Days of Sunlight', 'Koleksi item eksklusif dari event Days of Sunlight', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500'),
('Season Pass', 'Item premium dari berbagai season pass', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500'),
('Cosmetics', 'Berbagai item kosmetik dan aksesoris', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500');

-- Insert sample data for items
INSERT INTO public.items (name, description, price, category_id, image_url) VALUES
('Sunlight Cape', 'Cape eksklusif dengan efek cahaya matahari', 150000.00, 1, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300'),
('Golden Mask', 'Topeng emas dengan detail yang menawan', 200000.00, 1, 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300'),
('Season of Dreams Pass', 'Akses penuh ke semua item Season of Dreams', 300000.00, 2, 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300'),
('Starlight Hair', 'Gaya rambut dengan efek bintang berkilau', 100000.00, 3, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300');

-- Create games table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_items table
CREATE TABLE IF NOT EXISTS public.game_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on games table
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Enable RLS on game_items table
ALTER TABLE public.game_items ENABLE ROW LEVEL SECURITY;

-- Create policies for games table
CREATE POLICY "Anyone can view games" 
ON public.games 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage games" 
ON public.games 
FOR ALL 
USING (auth.jwt() ->> 'email' = 'diajaya0@gmail.com');

-- Create policies for game_items table
CREATE POLICY "Anyone can view game_items" 
ON public.game_items 
FOR SELECT 
USING (true);

CREATE POLICY "Admin can manage game_items" 
ON public.game_items 
FOR ALL 
USING (auth.jwt() ->> 'email' = 'diajaya0@gmail.com');

-- Create triggers for updated_at on games
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_items_updated_at BEFORE UPDATE ON public.game_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample games data
INSERT INTO public.games (name, description, image_url) VALUES
('Roblox', 'Platform game online dengan berbagai pengalaman gaming', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500'),
('Mobile Legends', 'Game MOBA terpopuler di mobile', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500'),
('Genshin Impact', 'Action RPG open-world dengan grafis memukau', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=500');

-- Insert sample game items data
INSERT INTO public.game_items (name, description, price, game_id, image_url) VALUES
('Robux 800', 'Mata uang premium Roblox untuk membeli item dan gamepass', 50000, (SELECT id FROM public.games WHERE name = 'Roblox'), 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300'),
('Robux 1700', 'Paket Robux dengan bonus lebih banyak', 100000, (SELECT id FROM public.games WHERE name = 'Roblox'), 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300'),
('Weekly Diamond Pass', 'Dapatkan diamond harian selama seminggu', 25000, (SELECT id FROM public.games WHERE name = 'Mobile Legends'), 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300'),
('Genesis Crystal 300', 'Mata uang premium untuk Genshin Impact', 75000, (SELECT id FROM public.games WHERE name = 'Genshin Impact'), 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=300');

-- Add review delete and update policies for admin users
DROP POLICY IF EXISTS "Admins can delete reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can update reviews" ON public.reviews;

CREATE POLICY "Admins can delete reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.jwt() ->> 'email' = 'diajaya0@gmail.com');

CREATE POLICY "Admins can update reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.jwt() ->> 'email' = 'diajaya0@gmail.com');
