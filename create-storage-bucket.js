import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function createImagesBucket() {
  try {
    // Create the images bucket
    const { data, error } = await supabase.storage.createBucket('images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      fileSizeLimit: 52428800 // 50MB
    })

    if (error) {
      console.error('Error creating bucket:', error)
    } else {
      console.log('Bucket created successfully:', data)
    }
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

createImagesBucket()
