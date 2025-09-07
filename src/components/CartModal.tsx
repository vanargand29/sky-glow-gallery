import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    // Format message for WhatsApp
    let message = "Halo! Saya ingin memesan item berikut:\n\n";
    
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Harga: ${formatPrice(item.price)}\n`;
      message += `   Jumlah: ${item.quantity}\n`;
      message += `   Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `Total Keseluruhan: ${formatPrice(getTotalPrice())}\n\n`;
    message += "Terima kasih!";

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Replace with your WhatsApp number (without + and spaces)
    const whatsappNumber = "6289504041209"; // Your actual WhatsApp number
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
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
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
            Keranjang Belanja ({cartItems.length} item)
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="border rounded-lg p-2 sm:p-4">
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
        
        <div className="border-t pt-4 sm:pt-6 mt-3 sm:mt-4 space-y-4 sm:space-y-6 bg-muted/20 -mx-6 px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
            <span className="text-sm sm:text-base">Total Pembayaran:</span>
            <span className="text-lg sm:text-2xl text-green-600">{formatPrice(getTotalPrice())}</span>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleCheckout}
              className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              Checkout via WhatsApp
            </Button>
            
            <Button
              variant="outline"
              onClick={clearCart}
              className="w-full h-8 sm:h-10 text-xs sm:text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Kosongkan Keranjang
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CartModal;
