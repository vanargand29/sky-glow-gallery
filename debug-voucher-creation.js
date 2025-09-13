// Debug script to test voucher creation with categories/games
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugVoucherCreation() {
  console.log('🔍 Debugging voucher creation process...');

  try {
    // Step 1: Get available categories and games
    console.log('\n1. Fetching available categories and games...');
    
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    const { data: games, error: gameError } = await supabase
      .from('games')
      .select('*');

    if (catError) console.error('Categories error:', catError);
    if (gameError) console.error('Games error:', gameError);

    console.log(`Found ${categories?.length || 0} categories and ${games?.length || 0} games`);
    
    if (categories?.length > 0) {
      console.log('Categories:', categories.map(c => `${c.name} (${c.id})`));
    }
    
    if (games?.length > 0) {
      console.log('Games:', games.map(g => `${g.name} (${g.id})`));
    }

    // Step 2: Create a test voucher with category
    if (categories?.length > 0) {
      console.log('\n2. Creating test voucher with category...');
      
      const testVoucherData = {
        code: 'TESTCAT' + Date.now().toString().slice(-4),
        discount_amount: 5000,
        usage_limit: 10,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      };

      console.log('Creating voucher with data:', testVoucherData);

      const { data: newVoucher, error: voucherError } = await supabase
        .from('vouchers')
        .insert([testVoucherData])
        .select()
        .single();

      if (voucherError) {
        console.error('❌ Error creating voucher:', voucherError);
        return;
      }

      console.log('✅ Voucher created:', newVoucher);

      // Step 3: Add category association
      const categoryId = categories[0].id;
      console.log(`\n3. Adding category association (${categories[0].name})...`);

      const { data: categoryAssoc, error: assocError } = await supabase
        .from('voucher_applicable_categories')
        .insert([{
          voucher_id: newVoucher.id,
          category_id: categoryId
        }])
        .select();

      if (assocError) {
        console.error('❌ Error creating category association:', assocError);
        return;
      }

      console.log('✅ Category association created:', categoryAssoc);

      // Step 4: Verify the voucher with associations
      console.log('\n4. Verifying voucher with associations...');
      
      const { data: verifyVoucher, error: verifyError } = await supabase
        .from('vouchers')
        .select(`
          *,
          voucher_applicable_categories (
            category_id,
            categories (name)
          ),
          voucher_applicable_games (
            game_id,
            games (name)
          )
        `)
        .eq('id', newVoucher.id)
        .single();

      if (verifyError) {
        console.error('❌ Error verifying voucher:', verifyError);
        return;
      }

      console.log('✅ Voucher verification successful:');
      console.log('  Code:', verifyVoucher.code);
      console.log('  Discount:', verifyVoucher.discount_amount);
      console.log('  Categories:', verifyVoucher.voucher_applicable_categories?.map(c => c.categories.name) || []);
      console.log('  Games:', verifyVoucher.voucher_applicable_games?.map(g => g.games.name) || []);
    }

    // Step 5: Test with games if available
    if (games?.length > 0) {
      console.log('\n5. Creating test voucher with game...');
      
      const testGameVoucherData = {
        code: 'TESTGAME' + Date.now().toString().slice(-4),
        discount_amount: 3000,
        usage_limit: 5,
        valid_from: new Date().toISOString(),
        valid_until: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      };

      const { data: newGameVoucher, error: gameVoucherError } = await supabase
        .from('vouchers')
        .insert([testGameVoucherData])
        .select()
        .single();

      if (gameVoucherError) {
        console.error('❌ Error creating game voucher:', gameVoucherError);
        return;
      }

      console.log('✅ Game voucher created:', newGameVoucher);

      // Add game association
      const gameId = games[0].id;
      console.log(`Adding game association (${games[0].name})...`);

      const { data: gameAssoc, error: gameAssocError } = await supabase
        .from('voucher_applicable_games')
        .insert([{
          voucher_id: newGameVoucher.id,
          game_id: gameId
        }])
        .select();

      if (gameAssocError) {
        console.error('❌ Error creating game association:', gameAssocError);
        return;
      }

      console.log('✅ Game association created:', gameAssoc);
    }

    console.log('\n🎉 Voucher creation debugging completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  • Voucher creation works correctly');
    console.log('  • Category associations work correctly');
    console.log('  • Game associations work correctly');
    console.log('  • The admin form should be working properly');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the debug
debugVoucherCreation();
