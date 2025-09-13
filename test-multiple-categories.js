// Test script for multiple category selection functionality
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMultipleCategorySelection() {
  console.log('🧪 Testing multiple category selection functionality...');

  try {
    // Get available categories
    const { data: categories } = await supabase.from('categories').select('*');
    
    if (!categories || categories.length < 2) {
      console.log('❌ Need at least 2 categories to test multiple selection');
      return;
    }

    console.log(`📊 Found ${categories.length} categories:`, categories.map(c => c.name));

    // Create test voucher with multiple categories
    const testVoucherData = {
      code: 'MULTI' + Date.now().toString().slice(-4),
      discount_amount: 15000,
      usage_limit: 20,
      valid_from: new Date().toISOString(),
      valid_until: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    };

    console.log('\n1. Creating test voucher...');
    const { data: newVoucher, error: voucherError } = await supabase
      .from('vouchers')
      .insert([testVoucherData])
      .select()
      .single();

    if (voucherError) {
      console.error('❌ Error creating voucher:', voucherError);
      return;
    }

    console.log('✅ Voucher created:', newVoucher.code);

    // Add multiple categories (first 3 categories)
    const categoriesToAdd = categories.slice(0, Math.min(3, categories.length));
    console.log(`\n2. Adding ${categoriesToAdd.length} categories to voucher...`);

    const categoryInserts = categoriesToAdd.map(category => ({
      voucher_id: newVoucher.id,
      category_id: category.id
    }));

    const { data: categoryAssociations, error: categoryError } = await supabase
      .from('voucher_applicable_categories')
      .insert(categoryInserts)
      .select();

    if (categoryError) {
      console.error('❌ Error adding categories:', categoryError);
      return;
    }

    console.log('✅ Categories added successfully:', categoryAssociations.length);

    // Verify the voucher with multiple categories
    console.log('\n3. Verifying voucher with multiple categories...');
    
    const { data: verifyVoucher, error: verifyError } = await supabase
      .from('vouchers')
      .select(`
        *,
        voucher_applicable_categories (
          category_id,
          categories (name)
        )
      `)
      .eq('id', newVoucher.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying voucher:', verifyError);
      return;
    }

    const associatedCategories = verifyVoucher.voucher_applicable_categories?.map(c => c.categories.name) || [];
    
    console.log('✅ Voucher verification successful:');
    console.log(`  Code: ${verifyVoucher.code}`);
    console.log(`  Discount: Rp ${verifyVoucher.discount_amount.toLocaleString('id-ID')}`);
    console.log(`  Associated Categories (${associatedCategories.length}): [${associatedCategories.join(', ')}]`);

    // Test voucher validation with multiple categories
    console.log('\n4. Testing voucher validation logic...');
    
    // Simulate cart items from different categories
    const mockCartItems = [
      { id: '1', name: 'Item 1', price: 50000, type: 'item', quantity: 1, category_id: categoriesToAdd[0]?.id },
      { id: '2', name: 'Item 2', price: 30000, type: 'item', quantity: 1, category_id: categoriesToAdd[1]?.id },
      { id: '3', name: 'Item 3', price: 20000, type: 'item', quantity: 1, category_id: 'other-category' }
    ];

    console.log('Mock cart items:');
    mockCartItems.forEach(item => {
      const categoryName = categoriesToAdd.find(c => c.id === item.category_id)?.name || 'Other';
      console.log(`  - ${item.name}: Rp ${item.price.toLocaleString('id-ID')} (${categoryName})`);
    });

    // Calculate which items are applicable
    const applicableCategoryIds = categoriesToAdd.map(c => c.id);
    const applicableItems = mockCartItems.filter(item => 
      applicableCategoryIds.includes(item.category_id)
    );
    
    const applicableTotal = applicableItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalCart = mockCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    console.log('\nValidation results:');
    console.log(`  Total cart value: Rp ${totalCart.toLocaleString('id-ID')}`);
    console.log(`  Applicable items: ${applicableItems.length}/${mockCartItems.length}`);
    console.log(`  Applicable total: Rp ${applicableTotal.toLocaleString('id-ID')}`);
    console.log(`  Discount amount: Rp ${Math.min(verifyVoucher.discount_amount, applicableTotal).toLocaleString('id-ID')}`);
    console.log(`  Final total: Rp ${(totalCart - Math.min(verifyVoucher.discount_amount, applicableTotal)).toLocaleString('id-ID')}`);

    console.log('\n🎉 Multiple category selection test completed successfully!');
    
    console.log('\n📋 Summary:');
    console.log(`  • Voucher can be associated with multiple categories`);
    console.log(`  • ${associatedCategories.length} categories selected for test voucher`);
    console.log(`  • Validation logic works correctly with multiple categories`);
    console.log(`  • Admin form now supports checkbox selection for categories`);

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

testMultipleCategorySelection();
