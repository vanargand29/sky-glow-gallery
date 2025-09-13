import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { recordVoucherUsage } from '@/utils/voucherValidation';
import { Minus, Plus, Trash2, ShoppingCart, Ticket, X } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice, 
    clearCart,
    appliedVoucher,
    voucherValidation,
    applyVoucher,
    removeVoucher,
    getDiscountedTotal
  } = useCart();
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleVoucherCheck = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Error",
        description: "Masukkan kode voucher terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const result = await applyVoucher(voucherCode.trim());
      
      if (result.isValid) {
        toast({
          title: "Voucher Valid!",
          description: `Diskon ${formatPrice(result.discountAmount || 0)} berhasil diterapkan`,
        });
        setVoucherCode('');
      } else {
        toast({
          title: "Voucher Tidak Valid",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memvalidasi voucher",
        variant: "destructive"
      });
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    const { originalTotal, discountAmount, finalTotal } = getDiscountedTotal();

    // Record voucher usage if voucher is applied
    if (appliedVoucher) {
      try {
        await recordVoucherUsage(
          appliedVoucher.id,
          originalTotal,
          discountAmount
        );
      } catch (error) {
        console.error('Error recording voucher usage:', error);
      }
    }

    // Format message for WhatsApp
    let message = "Halo! Saya ingin memesan item berikut:\n\n";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Harga: ${formatPrice(item.price)}\n`;
      message += `   Jumlah: ${item.quantity}\n`;
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `Total Harga: ${formatPrice(originalTotal)}\n`;
    
    if (appliedVoucher && discountAmount > 0) {
      message += `Voucher (${appliedVoucher.code}): -${formatPrice(discountAmount)}\n`;
      message += `Total Setelah Diskon: ${formatPrice(finalTotal)}\n`;
    }
    
    message += "\nTerima kasih!";

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Replace with your WhatsApp number (without + and spaces)
    const whatsappNumber = "6289504041209"; // Your actual WhatsApp number
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Clear cart and voucher after checkout
    clearCart();
    removeVoucher();
  };

  if (cartItems.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Keranjang Belanja
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Keranjang Anda kosong</p>
            <Button onClick={onClose} className="mt-4">
              Lanjut Belanja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-3xl h-[95vh] sm:h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 pb-3 pt-6 px-6 border-b bg-background">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            Keranjang Belanja ({cartItems.length} item)
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 bg-background">
          <div className="space-y-3 sm:space-y-4 pb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-3 sm:p-4 bg-card shadow-sm">
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-start gap-3 mb-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight mb-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">
                        {item.type === 'item' ? item.category : item.game}
                      </p>
                      <p className="text-sm font-medium text-accent">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">{item.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.type === 'item' ? item.category : item.game}
                    </p>
                    <p className="text-sm font-medium text-accent">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-right min-w-0">
                    <p className="font-medium text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-shrink-0 border-t bg-background px-6 py-4 max-h-[40vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Voucher Section - Compact */}
            <div className="border rounded-lg p-3 space-y-2 bg-card">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Ticket className="h-4 w-4" />
                Voucher
              </div>
              
              {appliedVoucher ? (
                <div className="flex items-center justify-between bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-800 p-2 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Ticket className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="font-medium text-green-700 dark:text-green-300 text-sm truncate">
                      {appliedVoucher.code}
                    </span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 flex-shrink-0">
                      (-{formatPrice(getDiscountedTotal().discountAmount)})
                    </span>
                  </div>
                  <Button
                    onClick={removeVoucher}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Kode voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleVoucherCheck()}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    onClick={handleVoucherCheck}
                    disabled={isValidatingVoucher || !voucherCode.trim()}
                    variant="outline"
                    size="sm"
                    className="px-3 h-8 text-xs"
                  >
                    {isValidatingVoucher ? 'Cek...' : 'Cek'}
                  </Button>
                </div>
              )}
              
              {voucherValidation && !voucherValidation.isValid && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded-lg">
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                    {voucherValidation.message}
                  </p>
                </div>
              )}
            </div>

            {/* Total Section - Compact */}
            <div className="space-y-2">
              {appliedVoucher ? (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span>Subtotal:</span>
                    <span>{formatPrice(getDiscountedTotal().originalTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Diskon:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">-{formatPrice(getDiscountedTotal().discountAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold border-t pt-1">
                    <span className="text-foreground">Total:</span>
                    <span className="text-base font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{formatPrice(getDiscountedTotal().finalTotal)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatPrice(getTotalPrice())}</span>
                </div>
              )}
            </div>
            
            {/* Action Buttons - Compact */}
            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                className="w-full h-9 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Checkout via WhatsApp
              </Button>
              
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                Kosongkan Keranjang
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
