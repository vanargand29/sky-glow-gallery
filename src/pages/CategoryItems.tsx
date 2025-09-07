import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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

interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url?: string;
  created_at: string;
}

const CategoryItems = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
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
        default:
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
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {categoryName}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Item premium tersedia untuk kategori ini
            </p>
            
            {/* Search and Sort */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
              <div className="w-full md:w-96">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Cari item... (contoh: Cape atau Sunlight)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Urutkan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="name_asc">Nama (A-Z)</SelectItem>
                    <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
                    <SelectItem value="price_asc">Harga Terendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Hasil pencarian "{searchQuery}": {filteredAndSortedItems.length} item ditemukan
              </p>
            )}
          </div>
        </div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Belum ada item tersedia untuk kategori ini.</p>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Tidak ada item yang ditemukan</h3>
            <p className="text-muted-foreground">
              Coba kata kunci lain atau periksa ejaan "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedItems.map((item) => (
              <Card key={item.id} className="game-card group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onClick={() => setSelectedImage(item.image_url!)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                      <div className="text-6xl opacity-50">🎵</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-accent/90 text-accent-foreground">
                      {formatPrice(item.price)}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">{item.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-accent">
                      {formatPrice(item.price)}
                    </div>
                    <Button 
                      className="btn-primary"
                      onClick={() => window.open(`https://wa.me/6289504041209?text=Halo, saya tertarik dengan ${item.name} seharga ${formatPrice(item.price)}`, '_blank')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Beli Sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Image Popup Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <Button
                variant="outline"
                size="icon"
                className="absolute -top-12 right-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <img
                src={selectedImage}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryItems;
