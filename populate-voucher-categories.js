// Script to populate voucher_applicable_categories table
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateVoucherCategories() {
  console.log('🚀 Starting voucher categories population...');

  try {
    // Step 1: Create sample vouchers if they don't exist
    console.log('\n1. Creating sample vouchers...');
    
    const vouchersToCreate = [
      {
        code: 'WELCOME10',
        discount_amount: 10000,
        usage_limit: 100,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        code: 'SEASON20',
        discount_amount: 20000,
        usage_limit: 50,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        code: 'COSMETIC15',
        discount_amount: 15000,
        usage_limit: 75,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        code: 'UNIVERSAL25',
        discount_amount: 25000,
        usage_limit: 25,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      }
    ];

    for (const voucher of vouchersToCreate) {
      const { data: existingVoucher } = await supabase
        .from('vouchers')
        .select('id')
        .eq('code', voucher.code)
        .single();

      if (!existingVoucher) {
        const { data, error } = await supabase
          .from('vouchers')
          .insert(voucher)
          .select()
          .single();

        if (error) {
          console.error(`❌ Error creating voucher ${voucher.code}:`, error);
        } else {
          console.log(`✅ Created voucher: ${voucher.code}`);
        }
      } else {
        console.log(`ℹ️ Voucher ${voucher.code} already exists`);
      }
    }

    // Step 2: Get all vouchers and categories
    console.log('\n2. Fetching vouchers and categories...');
    
    const { data: vouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select('*');

    if (vouchersError) {
      console.error('❌ Error fetching vouchers:', vouchersError);
      return;
    }

    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      return;
    }

    console.log(`📊 Found ${vouchers.length} vouchers and ${categories.length} categories`);

    // Step 3: Link vouchers to categories
    console.log('\n3. Linking vouchers to categories...');

    // WELCOME10 - applicable to all categories
    const welcome10 = vouchers.find(v => v.code === 'WELCOME10');
    if (welcome10) {
      for (const category of categories) {
        const { error } = await supabase
          .from('voucher_applicable_categories')
          .upsert({
            voucher_id: welcome10.id,
            category_id: category.id
          }, {
            onConflict: 'voucher_id,category_id'
          });

        if (error) {
          console.error(`❌ Error linking WELCOME10 to ${category.name}:`, error);
        } else {
          console.log(`✅ Linked WELCOME10 to ${category.name}`);
        }
      }
    }

    // SEASON20 - only for Season Pass category
    const season20 = vouchers.find(v => v.code === 'SEASON20');
    const seasonPassCategory = categories.find(c => c.name === 'Season Pass');
    if (season20 && seasonPassCategory) {
      const { error } = await supabase
        .from('voucher_applicable_categories')
        .upsert({
          voucher_id: season20.id,
          category_id: seasonPassCategory.id
        }, {
          onConflict: 'voucher_id,category_id'
        });

      if (error) {
        console.error('❌ Error linking SEASON20 to Season Pass:', error);
      } else {
        console.log('✅ Linked SEASON20 to Season Pass');
      }
    }

    // COSMETIC15 - only for Cosmetics category
    const cosmetic15 = vouchers.find(v => v.code === 'COSMETIC15');
    const cosmeticsCategory = categories.find(c => c.name === 'Cosmetics');
    if (cosmetic15 && cosmeticsCategory) {
      const { error } = await supabase
        .from('voucher_applicable_categories')
        .upsert({
          voucher_id: cosmetic15.id,
          category_id: cosmeticsCategory.id
        }, {
          onConflict: 'voucher_id,category_id'
        });

      if (error) {
        console.error('❌ Error linking COSMETIC15 to Cosmetics:', error);
      } else {
        console.log('✅ Linked COSMETIC15 to Cosmetics');
      }
    }

    // UNIVERSAL25 - no category restrictions (universal voucher)
    console.log('ℹ️ UNIVERSAL25 is a universal voucher (no category restrictions)');

    // Step 4: Verify the data
    console.log('\n4. Verifying voucher-category links...');
    
    const { data: voucherCategories, error: vcError } = await supabase
      .from('voucher_applicable_categories')
      .select(`
        *,
        vouchers(code),
        categories(name)
      `);

    if (vcError) {
      console.error('❌ Error fetching voucher categories:', vcError);
      return;
    }

    console.log(`📊 Total voucher-category links: ${voucherCategories.length}`);
    voucherCategories.forEach(vc => {
      console.log(`   ${vc.vouchers.code} → ${vc.categories.name}`);
    });

    console.log('\n🎉 Voucher categories population completed successfully!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the script
populateVoucherCategories();
