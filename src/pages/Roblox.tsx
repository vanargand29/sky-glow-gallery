import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Star, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Game {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

const Games = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching games:', error);
        toast({
          title: "Error",
          description: "Gagal memuat data games",
          variant: "destructive",
        });
        return;
      }

      setGames(data || []);
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

  const handleExploreGame = (gameId: string, gameName: string) => {
    navigate(`/games/${gameId}`, { 
      state: { gameName } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data games...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              <Star className="w-3 h-3 mr-1" />
              Premium Games
            </Badge>
            <Badge variant="secondary" className="bg-purple/20 text-purple border-purple/30">
              Multiple Platforms
            </Badge>
            <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
              <Eye className="w-3 h-3 mr-1" />
              Game Store
            </Badge>
          </div>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            GAMES COLLECTION 🎮
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mb-2 px-4">
            Pilih game favorit Anda dan jelajahi koleksi item premium yang tersedia
          </p>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Klik "Explore Game" untuk melihat item dan harga terbaru!
          </p>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Gamepad2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Belum Ada Games</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              Games akan ditampilkan di sini setelah admin menambahkannya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {games.map((game) => (
              <Card key={game.id} className="game-card group cursor-pointer overflow-hidden">
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={game.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500'}
                    alt={game.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                    <Badge className="bg-accent/90 text-accent-foreground mb-2 text-xs sm:text-sm">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      Game
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{game.name}</h3>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-3">
                    {game.description || 'Jelajahi berbagai item premium dan eksklusif untuk game ini.'}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gold" />
                      <span className="text-sm sm:text-base font-medium">4.9</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm text-muted-foreground">Premium Items</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-primary text-sm sm:text-base"
                    onClick={() => handleExploreGame(game.id, game.name)}
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Explore Game
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Info Section */}
        
      </div>
    </div>
  );
};

export default Games;