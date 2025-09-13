import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ShoppingCart, Search, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

type ItemStatus = 'Tersedia' | 'Best Seller' | 'Close' | 'Diskon' | 'New';

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url?: string;
  status?: ItemStatus;
  created_at: string;
}

const CategoryItems = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  

  const openImageModal = (imageUrl: string, itemName: string) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  const handleAddToCart = (item: Item) => {
    addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      type: 'item',
      category: categoryName,
      category_id: item.category_id
    });
    
    toast({
      title: "Berhasil!",
      description: `${item.name} ditambahkan ke keranjang`,
    });
  };
  const [sortBy, setSortBy] = useState<string>('status');
  const categoryName = location.state?.categoryName || 'Kategori';

  // Sort and filter items
  const filteredAndSortedItems = items
    .filter(item => {
      if (searchQuery === '') return true;
      return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             searchQuery.toLowerCase().split(' ').every(word => 
               item.name.toLowerCase().includes(word)
             );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'price_desc':
          return b.price - a.price;
        case 'price_asc':
          return a.price - b.price;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'status':
        default:
          // Custom status priority: New, Best Seller, Diskon, Tersedia, Close
          const statusPriority = {
            'New': 1,
            'Best Seller': 2,
            'Diskon': 3,
            'Tersedia': 4,
            'Close': 5
          };
          const aStatus = a.status || 'Tersedia';
          const bStatus = b.status || 'Tersedia';
          const aPriority = statusPriority[aStatus] || 6;
          const bPriority = statusPriority[bStatus] || 6;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          // If same status, sort by newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  useEffect(() => {
    if (categoryId) {
      fetchItems();
    }
  }, [categoryId]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Gagal memuat items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: ItemStatus = 'Tersedia') => {
    switch (status) {
      case 'New':
        return { backgroundColor: '#3b82f6', color: '#ffffff' }; // blue-500
      case 'Tersedia':
        return { backgroundColor: '#22c55e', color: '#ffffff' }; // green-500
      case 'Close':
        return { backgroundColor: '#ef4444', color: '#ffffff' }; // red-500
      case 'Diskon':
        return { backgroundColor: '#f97316', color: '#ffffff' }; // orange-500
      case 'Best Seller':
        return { backgroundColor: '#eab308', color: '#000000' }; // yellow-500
      default:
        return { backgroundColor: '#6b7280', color: '#ffffff' }; // gray-500
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/sky')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Kategori
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {categoryName}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              Koleksi item premium terbaik untuk kategori {categoryName}
            </p>
            
            
            {/* Search and Sort */}
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="w-full sm:w-80 md:w-96">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input
                      placeholder="Cari item favorit Anda..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-12 text-base rounded-xl border-2 focus:border-primary/50 transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-48 md:w-56">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-12 text-base rounded-xl border-2 focus:border-primary/50 transition-all duration-300">
                      <SelectValue placeholder="Urutkan berdasarkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">🏆 Status (Default)</SelectItem>
                      <SelectItem value="newest">🆕 Terbaru</SelectItem>
                      <SelectItem value="name_asc">📝 Nama (A-Z)</SelectItem>
                      <SelectItem value="price_desc">💰 Harga Tertinggi</SelectItem>
                      <SelectItem value="price_asc">💸 Harga Terendah</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {searchQuery && (
              <div className="mt-6 text-center">
                <p className="text-sm sm:text-base text-muted-foreground bg-primary/10 rounded-full px-4 py-2 inline-block">
                  🔍 Hasil pencarian "{searchQuery}": <span className="font-semibold text-primary">{filteredAndSortedItems.length}</span> item ditemukan
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-6xl sm:text-8xl mb-6">📦</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Kategori Masih Kosong</h3>
            <p className="text-muted-foreground text-base sm:text-lg max-w-md mx-auto">
              Belum ada item tersedia untuk kategori ini. Silakan cek kembali nanti!
            </p>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-6xl sm:text-8xl mb-6">🔍</div>
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Tidak ada item yang ditemukan</h3>
            <p className="text-base sm:text-lg text-muted-foreground px-4 max-w-md mx-auto">
              Coba kata kunci lain atau periksa ejaan "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery('')}
              className="mt-6"
            >
              Hapus Pencarian
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredAndSortedItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                      onMouseDown={() => openImageModal(item.image_url!, item.name)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center">
                      <div className="text-5xl sm:text-7xl opacity-60">🎵</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                  <div className="absolute top-4 right-4">
                    <div 
                      className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg"
                      style={getStatusBadgeStyle(item.status)}
                    >
                      {item.status || 'Tersedia'}
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary/30 to-transparent pointer-events-none"></div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {formatPrice(item.price)}
                    </div>
                    <Button 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Tambah ke Keranjang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Enhanced Image Popup Modal */}
        {isModalOpen && selectedImage && createPortal(
          <div 
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-300"
            onMouseDown={closeModal}
          >
            <div className="relative max-w-7xl max-h-full">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white border-white/20"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  closeModal();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default CategoryItems;