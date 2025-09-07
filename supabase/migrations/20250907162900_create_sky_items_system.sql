-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create items table
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table for authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

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

-- Admin users policies (only admin can access)
CREATE POLICY "Only admin can access admin_users" 
ON public.admin_users 
FOR ALL 
USING (auth.jwt() ->> 'email' = 'diajaya0@gmail.com');

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default admin user (password will be hashed in application)
INSERT INTO public.admin_users (email, password_hash) 
VALUES ('diajaya0@gmail.com', '$2b$10$encrypted_hash_will_be_set_by_app');

-- Insert sample categories
INSERT INTO public.categories (name, description, image_url) VALUES
('Days of Sunlight', 'Koleksi item eksklusif tema Days of Sunlight dengan efek visual menawan', '/assets/days-of-sunlight.jpg'),
('Season Pass', 'Item premium dari berbagai season pass Sky Children of The Light', '/assets/season-pass.jpg'),
('Cosmetics', 'Berbagai item kosmetik untuk mempercantik karakter Anda', '/assets/cosmetics.jpg');

-- Insert sample items
INSERT INTO public.items (name, description, price, category_id, image_url) 
SELECT 
  'Sunlight Harp',
  'Alat musik khusus tema Days of Sunlight dengan efek visual menawan',
  200000.00,
  c.id,
  '/assets/sunlight-harp.jpg'
FROM public.categories c WHERE c.name = 'Days of Sunlight';
