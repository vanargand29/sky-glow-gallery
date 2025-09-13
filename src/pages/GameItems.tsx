import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ShoppingCart, Star, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

interface GameItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  game_id: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const GameItems = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const gameName = location.state?.gameName || "Game";
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const { toast } = useToast();
  const { addToCart } = useCart();

  // Sort and filter items
  const filteredAndSortedGameItems = gameItems
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
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  useEffect(() => {
    if (gameId) {
      fetchGameItems();
    }
  }, [gameId]);

  const fetchGameItems = async () => {
    try {
      const { data, error } = await supabase
        .from('game_items')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching game items:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data items",
          variant: "destructive",
        });
        return;
      }

      setGameItems((data as any) || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: GameItem) => {
    addToCart({
      id: item.id.toString(),
      name: item.name,
      price: item.price,
      image_url: item.image_url || undefined,
      type: 'game_item',
      game: gameName,
      game_id: gameId
    });
    
    toast({
      title: "Berhasil!",
      description: `${item.name} ditambahkan ke keranjang`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/games">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Games
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              <Star className="w-3 h-3 mr-1" />
              Premium Items
            </Badge>
            <Badge variant="secondary" className="bg-purple/20 text-purple border-purple/30">
              {gameName}
            </Badge>
            <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Game Store
            </Badge>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            {gameName.toUpperCase()} ITEMS 🎮
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-2">
            Koleksi item premium dan eksklusif untuk {gameName}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Dapatkan item terbaik dengan harga terjangkau dan delivery tercepat!
          </p>
          
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 sm:mb-6">
            <div className="w-full sm:w-80 md:w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari item..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full text-sm sm:text-base"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-40 md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full text-sm sm:text-base">
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
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
              Hasil pencarian "{searchQuery}": {filteredAndSortedGameItems.length} item ditemukan
            </p>
          )}
        </div>

        {/* Game Items Grid */}
        {gameItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Belum Ada Items</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Items untuk game ini akan ditampilkan di sini setelah admin menambahkannya.
            </p>
          </div>
        ) : filteredAndSortedGameItems.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Tidak ada item yang ditemukan</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Coba kata kunci lain atau periksa ejaan "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredAndSortedGameItems.map((item) => (
              <Card key={item.id} className="game-card group overflow-hidden">
                <div className="relative h-40 sm:h-48 overflow-hidden">
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
                    <img
                      src={'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500'}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                    <Badge className="bg-accent/90 text-accent-foreground mb-2 text-xs">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Item
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{item.name}</h3>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {item.description || 'Item premium untuk meningkatkan pengalaman gaming Anda.'}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gold" />
                      <span className="text-sm sm:text-base font-medium">4.9</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-lg sm:text-2xl font-bold text-primary">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-primary text-sm sm:text-base"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Beli Sekarang
                  </Button>
                </div>
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

export default GameItems;
