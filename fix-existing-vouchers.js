// Fix existing vouchers without associations
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixExistingVouchers() {
  console.log('🔧 Fixing existing vouchers without associations...');

  try {
    // Get categories and games
    const { data: categories } = await supabase.from('categories').select('*');
    const { data: games } = await supabase.from('games').select('*');

    const moonlightCategory = categories?.find(c => c.name.toLowerCase().includes('moonlight'));
    const robloxGame = games?.find(g => g.name.toLowerCase().includes('roblox'));

    console.log('Available categories:', categories?.map(c => c.name));
    console.log('Available games:', games?.map(g => g.name));
    console.log('Moonlight category found:', moonlightCategory?.name);
    console.log('Roblox game found:', robloxGame?.name);

    // Get vouchers without associations
    const { data: vouchers } = await supabase
      .from('vouchers')
      .select(`
        *,
        voucher_applicable_categories(id),
        voucher_applicable_games(id)
      `)
      .order('created_at', { ascending: false });

    const vouchersWithoutAssoc = vouchers?.filter(v => 
      (!v.voucher_applicable_categories || v.voucher_applicable_categories.length === 0) &&
      (!v.voucher_applicable_games || v.voucher_applicable_games.length === 0)
    ) || [];

    console.log(`\nFound ${vouchersWithoutAssoc.length} vouchers without associations:`);
    vouchersWithoutAssoc.forEach(v => {
      console.log(`- ${v.code} (Created: ${new Date(v.created_at).toLocaleString('id-ID')})`);
    });

    // Fix the two specific vouchers mentioned by user
    const recentVouchers = vouchersWithoutAssoc.slice(0, 2); // Get the 2 most recent

    for (let i = 0; i < recentVouchers.length; i++) {
      const voucher = recentVouchers[i];
      console.log(`\n🔧 Fixing voucher: ${voucher.code}`);

      if (i === 0 && moonlightCategory) {
        // First voucher -> Days of Moonlight category
        console.log(`Associating ${voucher.code} with Days of Moonlight category`);
        
        const { data, error } = await supabase
          .from('voucher_applicable_categories')
          .insert({
            voucher_id: voucher.id,
            category_id: moonlightCategory.id
          })
          .select();

        if (error) {
          console.error('❌ Error:', error);
        } else {
          console.log('✅ Successfully associated with Days of Moonlight');
        }
      } else if (i === 1 && robloxGame) {
        // Second voucher -> Roblox game
        console.log(`Associating ${voucher.code} with Roblox game`);
        
        const { data, error } = await supabase
          .from('voucher_applicable_games')
          .insert({
            voucher_id: voucher.id,
            game_id: robloxGame.id
          })
          .select();

        if (error) {
          console.error('❌ Error:', error);
        } else {
          console.log('✅ Successfully associated with Roblox');
        }
      }
    }

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const { data: fixedVouchers } = await supabase
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
      .in('id', recentVouchers.map(v => v.id));

    fixedVouchers?.forEach(v => {
      const categories = v.voucher_applicable_categories?.map(c => c.categories?.name) || [];
      const games = v.voucher_applicable_games?.map(g => g.games?.name) || [];
      
      console.log(`✅ ${v.code}: Categories [${categories.join(', ') || 'None'}], Games [${games.join(', ') || 'None'}]`);
    });

    console.log('\n🎉 Voucher fixes completed!');

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

fixExistingVouchers();
