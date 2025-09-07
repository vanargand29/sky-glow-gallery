import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ShoppingCart, Star, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Filtered items based on search query
  const filteredGameItems = gameItems.filter(item => {
    if (searchQuery === '') return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           searchQuery.toLowerCase().split(' ').every(word => 
             item.name.toLowerCase().includes(word)
           );
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
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            {gameName.toUpperCase()} ITEMS 🎮
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Koleksi item premium dan eksklusif untuk {gameName}
          </p>
          <p className="text-muted-foreground mb-6">
            Dapatkan item terbaik dengan harga terjangkau dan delivery tercepat!
          </p>
          
          {/* Search Input */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari item... (contoh: Robux 500 atau 500 Robux)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Hasil pencarian "{searchQuery}": {filteredGameItems.length} item ditemukan
              </p>
            )}
          </div>
        </div>

        {/* Game Items Grid */}
        {gameItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum Ada Items</h3>
            <p className="text-muted-foreground">
              Items untuk game ini akan ditampilkan di sini setelah admin menambahkannya.
            </p>
          </div>
        ) : filteredGameItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Tidak ada item yang ditemukan</h3>
            <p className="text-muted-foreground">
              Coba kata kunci lain atau periksa ejaan "{searchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGameItems.map((item) => (
              <Card key={item.id} className="game-card group overflow-hidden">
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
                    <img
                      src={'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500'}
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-accent/90 text-accent-foreground mb-2">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Item
                    </Badge>
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {item.description || 'Item premium untuk meningkatkan pengalaman gaming Anda.'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gold" />
                      <span className="font-medium">4.9</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-primary"
                    onClick={() => window.open(`https://wa.me/6289504041209?text=Halo, saya tertarik dengan ${item.name} seharga Rp ${item.price.toLocaleString('id-ID')}`, '_blank')}
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
