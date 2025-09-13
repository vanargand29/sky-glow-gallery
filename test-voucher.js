// Test script for voucher functionality
// Run this after the migration is applied to test voucher creation and validation

import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'your-supabase-url';
const supabaseKey = 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testVoucherSystem() {
  console.log('Testing voucher system...');

  try {
    // Test 1: Create a test voucher
    console.log('\n1. Creating test voucher...');
    const { data: voucher, error: createError } = await supabase
      .from('vouchers')
      .insert({
        code: 'TEST10',
        discount_amount: 10000,
        usage_limit: 5,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating voucher:', createError);
      return;
    }

    console.log('✅ Voucher created:', voucher);

    // Test 2: Fetch vouchers
    console.log('\n2. Fetching vouchers...');
    const { data: vouchers, error: fetchError } = await supabase
      .from('vouchers')
      .select('*');

    if (fetchError) {
      console.error('Error fetching vouchers:', fetchError);
      return;
    }

    console.log('✅ Vouchers fetched:', vouchers.length, 'vouchers found');

    // Test 3: Test voucher validation query
    console.log('\n3. Testing voucher validation query...');
    const { data: validationData, error: validationError } = await supabase
      .from('vouchers')
      .select(`
        *,
        voucher_applicable_items(category_item_id),
        voucher_applicable_game_items(game_item_id)
      `)
      .eq('code', 'TEST10')
      .eq('is_active', true)
      .single();

    if (validationError) {
      console.error('Error in validation query:', validationError);
      return;
    }

    console.log('✅ Validation query successful:', validationData);

    // Test 4: Test voucher usage recording
    console.log('\n4. Testing voucher usage recording...');
    const { data: usageData, error: usageError } = await supabase
      .from('voucher_usage')
      .insert({
        voucher_id: voucher.id,
        cart_total: 50000,
        discount_applied: 10000
      })
      .select()
      .single();

    if (usageError) {
      console.error('Error recording usage:', usageError);
      return;
    }

    console.log('✅ Usage recorded:', usageData);

    // Test 5: Update voucher usage count
    console.log('\n5. Updating voucher usage count...');
    const { error: updateError } = await supabase
      .from('vouchers')
      .update({ usage_count: 1 })
      .eq('id', voucher.id);

    if (updateError) {
      console.error('Error updating usage count:', updateError);
      return;
    }

    console.log('✅ Usage count updated');

    console.log('\n🎉 All voucher system tests passed!');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testVoucherSystem();
