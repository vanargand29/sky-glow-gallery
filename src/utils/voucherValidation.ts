import { supabase } from '@/integrations/supabase/client';

export interface VoucherValidationResult {
  isValid: boolean;
  message: string;
  discountAmount?: number;
  voucher?: any;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'item' | 'game_item';
  quantity: number;
}

export const validateVoucher = async (
  voucherCode: string,
  cartItems: CartItem[]
): Promise<VoucherValidationResult> => {
  try {
    // Get voucher with applicable games and categories
    const { data: voucher, error } = await supabase
      .from('vouchers' as any)
      .select(`
        *,
        voucher_applicable_games (
          game_id,
          games (name)
        ),
        voucher_applicable_categories (
          category_id,
          categories (name)
        )
      `)
      .eq('code', voucherCode)
      .eq('is_active', true)
      .single();

    if (error || !voucher) {
      return {
        isValid: false,
        message: 'Kode voucher tidak valid atau tidak ditemukan'
      };
    }

    // Check if voucher is expired
    const now = new Date();
    const validFrom = (voucher as any).valid_from ? new Date((voucher as any).valid_from) : null;
    const validUntil = (voucher as any).valid_until ? new Date((voucher as any).valid_until) : null;

    if (validFrom && now < validFrom) {
      return {
        isValid: false,
        message: 'Voucher belum berlaku'
      };
    }

    if (validUntil && now > validUntil) {
      return {
        isValid: false,
        message: 'Voucher sudah kedaluwarsa'
      };
    }

    // Check usage limit
    if ((voucher as any).usage_limit && (voucher as any).usage_count >= (voucher as any).usage_limit) {
      return {
        isValid: false,
        message: 'Voucher sudah mencapai batas maksimal penggunaan'
      };
    }

    // Check if voucher applies to any items in cart
    const applicableGameIds = (voucher as any).voucher_applicable_games?.map((game: any) => game.game_id) || [];
    const applicableCategoryIds = (voucher as any).voucher_applicable_categories?.map((category: any) => category.category_id) || [];
    
    // If voucher has specific restrictions, enforce them strictly
    const hasGameRestrictions = applicableGameIds.length > 0;
    const hasCategoryRestrictions = applicableCategoryIds.length > 0;
    
    if (hasGameRestrictions || hasCategoryRestrictions) {
      const hasApplicableItems = cartItems.some(cartItem => {
        if (cartItem.type === 'item' && hasCategoryRestrictions) {
          // For category items, must match one of the applicable categories
          return applicableCategoryIds.includes((cartItem as any).category_id);
        } else if (cartItem.type === 'game_item' && hasGameRestrictions) {
          // For game items, must match one of the applicable games
          return applicableGameIds.includes((cartItem as any).game_id);
        }
        // If item type doesn't match voucher restrictions, it's not applicable
        return false;
      });

      if (!hasApplicableItems) {
        const restrictionMessage = [];
        if (hasCategoryRestrictions) {
          restrictionMessage.push('kategori tertentu');
        }
        if (hasGameRestrictions) {
          restrictionMessage.push('game tertentu');
        }
        
        return {
          isValid: false,
          message: `Voucher hanya berlaku untuk ${restrictionMessage.join(' dan ')}. Item di keranjang tidak sesuai dengan ketentuan voucher.`
        };
      }
    }

    return {
      isValid: true,
      message: 'Voucher valid',
      discountAmount: (voucher as any).discount_amount,
      voucher
    };

  } catch (error) {
    console.error('Error validating voucher:', error);
    return {
      isValid: false,
      message: 'Terjadi kesalahan saat memvalidasi voucher'
    };
  }
};

export const calculateDiscountedTotal = (
  cartItems: CartItem[],
  voucher: any
): { originalTotal: number; discountAmount: number; finalTotal: number } => {
  const originalTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  if (!voucher) {
    return {
      originalTotal,
      discountAmount: 0,
      finalTotal: originalTotal
    };
  }

  const applicableGameIds = voucher.voucher_applicable_games?.map((game: any) => game.game_id) || [];
  const applicableCategoryIds = voucher.voucher_applicable_categories?.map((category: any) => category.category_id) || [];
  
  // Check if voucher has restrictions
  const hasGameRestrictions = applicableGameIds.length > 0;
  const hasCategoryRestrictions = applicableCategoryIds.length > 0;
  const isUniversalVoucher = !hasGameRestrictions && !hasCategoryRestrictions;

  let applicableTotal = 0;

  if (isUniversalVoucher) {
    applicableTotal = originalTotal;
  } else {
    applicableTotal = cartItems.reduce((total, item) => {
      let isApplicable = false;
      
      if (item.type === 'item' && hasCategoryRestrictions) {
        // For category items, ONLY apply if category matches
        isApplicable = applicableCategoryIds.includes((item as any).category_id);
      } else if (item.type === 'game_item' && hasGameRestrictions) {
        // For game items, ONLY apply if game matches
        isApplicable = applicableGameIds.includes((item as any).game_id);
      }
      // If item type doesn't match voucher restrictions, discount doesn't apply
      
      return isApplicable ? total + (item.price * item.quantity) : total;
    }, 0);
  }

  const discountAmount = Math.min(voucher.discount_amount, applicableTotal);
  const finalTotal = Math.max(0, originalTotal - discountAmount);

  return {
    originalTotal,
    discountAmount,
    finalTotal
  };
};

export const recordVoucherUsage = async (
  voucherId: string,
  cartTotal: number,
  discountApplied: number,
  userInfo?: any
) => {
  try {
    // Record usage
    await supabase
      .from('voucher_usage' as any)
      .insert([{
        voucher_id: voucherId,
        cart_total: cartTotal,
        discount_applied: discountApplied,
        user_info: userInfo
      }]);

    // Update usage count
    const { data: currentVoucher } = await supabase
      .from('vouchers' as any)
      .select('usage_count')
      .eq('id', voucherId)
      .single();

    if (currentVoucher) {
      await supabase
        .from('vouchers' as any)
        .update({ usage_count: currentVoucher.usage_count + 1 })
        .eq('id', voucherId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording voucher usage:', error);
    return { success: false, error };
  }
};
