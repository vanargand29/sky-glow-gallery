// Check the recently created vouchers and their associations
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentVouchers() {
  console.log('🔍 Checking recent vouchers and their associations...');

  try {
    // Get all vouchers ordered by creation date
    console.log('\n1. Fetching all vouchers...');
    const { data: vouchers, error: vouchersError } = await supabase
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
      .order('created_at', { ascending: false });

    if (vouchersError) {
      console.error('❌ Error fetching vouchers:', vouchersError);
      return;
    }

    console.log(`📊 Found ${vouchers.length} vouchers total`);

    // Show recent vouchers (last 10)
    const recentVouchers = vouchers.slice(0, 10);
    
    console.log('\n2. Recent vouchers analysis:');
    recentVouchers.forEach((voucher, index) => {
      console.log(`\n--- Voucher ${index + 1} ---`);
      console.log(`Code: ${voucher.code}`);
      console.log(`Created: ${new Date(voucher.created_at).toLocaleString('id-ID')}`);
      console.log(`Discount: Rp ${voucher.discount_amount.toLocaleString('id-ID')}`);
      
      const categories = voucher.voucher_applicable_categories?.map(c => c.categories?.name).filter(Boolean) || [];
      const games = voucher.voucher_applicable_games?.map(g => g.games?.name).filter(Boolean) || [];
      
      console.log(`Categories: [${categories.join(', ') || 'None'}]`);
      console.log(`Games: [${games.join(', ') || 'None'}]`);
      
      if (categories.length === 0 && games.length === 0) {
        console.log('⚠️  This voucher has NO category or game associations!');
      } else {
        console.log('✅ This voucher has proper associations');
      }
    });

    // Look for specific vouchers mentioned by user
    console.log('\n3. Looking for "Days of Moonlight" and "Roblox" related vouchers...');
    
    const moonlightVouchers = vouchers.filter(v => 
      v.code.toLowerCase().includes('moonlight') || 
      v.code.toLowerCase().includes('moon') ||
      v.voucher_applicable_categories?.some(c => 
        c.categories?.name?.toLowerCase().includes('moonlight')
      )
    );
    
    const robloxVouchers = vouchers.filter(v => 
      v.code.toLowerCase().includes('roblox') ||
      v.voucher_applicable_games?.some(g => 
        g.games?.name?.toLowerCase().includes('roblox')
      )
    );

    if (moonlightVouchers.length > 0) {
      console.log('\n🌙 Days of Moonlight related vouchers:');
      moonlightVouchers.forEach(v => {
        const categories = v.voucher_applicable_categories?.map(c => c.categories?.name) || [];
        console.log(`  - ${v.code}: Categories [${categories.join(', ') || 'None'}]`);
      });
    }

    if (robloxVouchers.length > 0) {
      console.log('\n🎮 Roblox related vouchers:');
      robloxVouchers.forEach(v => {
        const games = v.voucher_applicable_games?.map(g => g.games?.name) || [];
        console.log(`  - ${v.code}: Games [${games.join(', ') || 'None'}]`);
      });
    }

    // Check available categories and games for reference
    console.log('\n4. Available categories and games for reference:');
    
    const { data: categories } = await supabase.from('categories').select('*');
    const { data: games } = await supabase.from('games').select('*');
    
    console.log('\nCategories:');
    categories?.forEach(c => console.log(`  - ${c.name} (ID: ${c.id})`));
    
    console.log('\nGames:');
    games?.forEach(g => console.log(`  - ${g.name} (ID: ${g.id})`));

    // Check if there are vouchers without associations
    const vouchersWithoutAssoc = vouchers.filter(v => 
      (!v.voucher_applicable_categories || v.voucher_applicable_categories.length === 0) &&
      (!v.voucher_applicable_games || v.voucher_applicable_games.length === 0)
    );

    console.log(`\n⚠️  Found ${vouchersWithoutAssoc.length} vouchers without any associations:`);
    vouchersWithoutAssoc.slice(0, 5).forEach(v => {
      console.log(`  - ${v.code} (Created: ${new Date(v.created_at).toLocaleString('id-ID')})`);
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkRecentVouchers();
