// Script to create storage bucket manually
// Run this in browser console on Supabase dashboard or use Supabase CLI

// Method 1: Using Supabase SQL Editor
const createBucketSQL = `
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images', 
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update" ON storage.objects  
FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
`;

console.log('Copy and paste this SQL into Supabase SQL Editor:');
console.log(createBucketSQL);

// Method 2: Manual steps in Supabase Dashboard
console.log(`
Manual Steps:
1. Go to Supabase Dashboard -> Storage
2. Click "New bucket"
3. Name: "images"
4. Public bucket: Yes
5. File size limit: 50MB
6. Allowed MIME types: image/jpeg, image/png, image/gif, image/webp, image/svg+xml
7. Click "Save"
`);
