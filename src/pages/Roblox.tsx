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
          
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            GAMES COLLECTION 🎮
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Pilih game favorit Anda dan jelajahi koleksi item premium yang tersedia
          </p>
          <p className="text-muted-foreground">
            Klik "Explore Game" untuk melihat item dan harga terbaru!
          </p>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="text-center py-16">
            <Gamepad2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Belum Ada Games</h3>
            <p className="text-muted-foreground">
              Games akan ditampilkan di sini setelah admin menambahkannya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} className="game-card group cursor-pointer overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={game.image_url || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500'}
                    alt={game.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-accent/90 text-accent-foreground mb-2">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      Game
                    </Badge>
                    <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {game.description || 'Jelajahi berbagai item premium dan eksklusif untuk game ini.'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gold" />
                      <span className="font-medium">4.9</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Premium Items</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-primary"
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