import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Star, TrendingUp, Users, Zap } from "lucide-react";
import skyHero from "@/assets/sky-hero.jpg";

const Home = () => {
  const navigate = useNavigate();

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
      rating: 4.9,
      players: "1M+",
      image: skyHero,
      path: "/sky"
    },
    {
      name: "Roblox",
      category: "Sandbox",
      rating: 4.8,
      players: "500K+",
      image: skyHero,
      path: "/roblox"
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
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-accent via-primary to-purple bg-clip-text text-transparent">
              Selamat Datang di J Store ✨
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Destinasi terpercaya untuk semua kebutuhan gaming Anda. Dapatkan item premium dengan harga terbaik dan layanan berkualitas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/sky')}
                className="btn-primary text-lg px-8 py-4"
              >
                🎮 Explore Games
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/review')}
                className="text-lg px-8 py-4 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                📝 Read Reviews
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Mengapa Memilih Kami?</h2>
          <p className="text-center text-muted-foreground mb-12">
            Bergabunglah dengan ribuan gamer yang telah merasakan pengalaman terbaik
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="game-card text-center p-8">
                <div className="flex justify-center mb-4 text-accent">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Best Seller Games */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Best Seller Games</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {bestSellerGames.map((game, index) => (
              <Card key={index} className="game-card group cursor-pointer overflow-hidden" onClick={() => navigate(game.path)}>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-accent/90 text-accent-foreground mb-2">
                      {game.category}
                    </Badge>
                    <h3 className="text-xl font-bold text-white">{game.name}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gold" />
                      <span className="font-medium">{game.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{game.players}</span>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4 btn-primary">
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