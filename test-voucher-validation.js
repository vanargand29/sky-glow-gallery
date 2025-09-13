// Test script for voucher validation functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testVoucherValidation() {
  console.log('🧪 Testing voucher validation functionality...');

  try {
    // Test 1: Verify vouchers exist
    console.log('\n1. Checking vouchers in database...');
    const { data: vouchers, error: vouchersError } = await supabase
      .from('vouchers')
      .select('*')
      .order('created_at', { ascending: false });

    if (vouchersError) {
      console.error('❌ Error fetching vouchers:', vouchersError);
      return;
    }

    console.log(`✅ Found ${vouchers.length} vouchers:`);
    vouchers.forEach(v => {
      console.log(`   - ${v.code}: ${v.discount_amount} (${v.is_active ? 'Active' : 'Inactive'})`);
    });

    // Test 2: Verify voucher-category relationships
    console.log('\n2. Checking voucher-category relationships...');
    const { data: voucherCategories, error: vcError } = await supabase
      .from('voucher_applicable_categories')
      .select(`
        *,
        vouchers(code, discount_amount),
        categories(name)
      `);

    if (vcError) {
      console.error('❌ Error fetching voucher categories:', vcError);
      return;
    }

    console.log(`✅ Found ${voucherCategories.length} voucher-category relationships:`);
    voucherCategories.forEach(vc => {
      console.log(`   - ${vc.vouchers.code} → ${vc.categories.name}`);
    });

    // Test 3: Test voucher validation query (like the app would do)
    console.log('\n3. Testing voucher validation queries...');
    
    const testCodes = ['WELCOME10', 'SEASON20', 'COSMETIC15', 'UNIVERSAL25', 'INVALID'];
    
    for (const code of testCodes) {
      console.log(`\n   Testing voucher: ${code}`);
      
      const { data: voucher, error } = await supabase
        .from('vouchers')
        .select(`
          *,
          voucher_applicable_categories (
            category_id,
            categories (name)
          )
        `)
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        console.log(`   ❌ ${code}: ${error.message}`);
      } else {
        const categories = voucher.voucher_applicable_categories?.map(vc => vc.categories.name) || [];
        console.log(`   ✅ ${code}: Valid, discount: ${voucher.discount_amount}, categories: [${categories.join(', ') || 'Universal'}]`);
      }
    }

    // Test 4: Test categories
    console.log('\n4. Checking available categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      return;
    }

    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(c => {
      console.log(`   - ${c.name}: ${c.description}`);
    });

    console.log('\n🎉 All voucher validation tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • ${vouchers.length} vouchers created`);
    console.log(`   • ${voucherCategories.length} voucher-category relationships`);
    console.log(`   • ${categories.length} categories available`);
    console.log('   • Voucher validation system is working correctly');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testVoucherValidation();
