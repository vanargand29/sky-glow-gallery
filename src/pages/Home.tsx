import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Star, TrendingUp, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import skyHero from "@/assets/sky-hero.png";
import rbLx from "@/assets/rblx.png";

const Home = () => {
  const navigate = useNavigate();
  const [robloxGameId, setRobloxGameId] = useState<string | null>(null);

  useEffect(() => {
    fetchRobloxGameId();
  }, []);

  const fetchRobloxGameId = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id')
        .ilike('name', '%roblox%')
        .single();
      
      if (data) {
        setRobloxGameId(data.id);
      }
    } catch (error) {
      console.error('Error fetching Roblox game ID:', error);
    }
  };

  const features = [
    {
      icon: <Gamepad2 className="h-8 w-8" />,
      title: "Game Premium",
      description: "Berbagai pilihan game premium dengan harga terbaik"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Aktif",
      description: "Bergabung dengan komunitas gamer terbesar"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Update Terbaru",
      description: "Selalu update dengan konten game terkini"
    }
  ];

  const bestSellerGames = [
    {
      name: "Sky: Children of The Light",
      category: "Adventure",
      rating: 4.2,
      players: "1M+",
      image: skyHero,
      path: "/sky"
    },
    {
      name: "Roblox",
      category: "Sandbox",
      rating: 4.5,
      players: "500K+",
      image: rbLx,
      path: robloxGameId ? `/games/${robloxGameId}` : "/roblox"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center items-center gap-2 mb-6">
              <Star className="h-8 w-8 text-accent" />
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                <Zap className="w-3 h-3 mr-1" />
                Premium Gaming Store
              </Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-accent via-primary to-purple bg-clip-text text-transparent">
              Selamat Datang di J Store ✨
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Destinasi terpercaya untuk semua kebutuhan gaming Anda. Dapatkan item premium dengan harga terbaik dan layanan berkualitas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Button 
                onClick={() => window.open('https://wa.me/6289504041209?text=Halo, saya tertarik dengan produk di J Store', '_blank')}
                className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
              >
                🎮 Buy Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/review')}
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                📝 Read Reviews
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 sm:mb-4">Mengapa Memilih Kami?</h2>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-8 sm:mb-12 px-4">
            Bergabunglah dengan ribuan gamer yang telah merasakan pengalaman terbaik
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="game-card text-center p-6 sm:p-8">
                <div className="flex justify-center mb-3 sm:mb-4 text-accent">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Seller Games */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Best Seller Games</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {bestSellerGames.map((game, index) => (
              <Card key={index} className="game-card group cursor-pointer overflow-hidden" onClick={() => navigate(game.path)}>
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                    <Badge className="bg-accent/90 text-accent-foreground mb-2 text-xs sm:text-sm">
                      {game.category}
                    </Badge>
                    <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-2">{game.name}</h3>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-gold" />
                      <span className="text-sm sm:text-base font-medium">{game.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      <span className="text-xs sm:text-sm text-muted-foreground">{game.players}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full btn-primary text-sm sm:text-base"
                    onClick={() => navigate(game.path)}
                  >
                    Explore Game
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;