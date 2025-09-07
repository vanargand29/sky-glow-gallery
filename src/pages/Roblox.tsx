import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

const Roblox = () => {
  const robuxPackages = [
    {
      id: 1,
      amount: "400 Robux + Premium",
      description: "Paket Robux basic + Premium membership selama 1 bulan",
      price: "Rp 80,000",
      color: "bg-green",
      features: ["Premium benefits", "Monthly Robux", "Trading enabled"]
    },
    {
      id: 2,
      amount: "1600 Robux + Premium",
      description: "Paket Robux medium + Premium membership selama 1 bulan", 
      price: "Rp 150,000",
      color: "bg-accent",
      features: ["Premium benefits", "Monthly Robux", "Trading enabled", "Avatar shop priority"]
    },
    {
      id: 3,
      amount: "500 Robux",
      description: "Paket Robux standar untuk kebutuhan harian gaming Anda",
      price: "Rp 75,000", 
      color: "bg-purple",
      features: ["Instant delivery", "Account secure", "24/7 support"]
    },
    {
      id: 4,
      amount: "1000 Robux",
      description: "Paket Robux populer dengan bonus extra untuk member setia",
      price: "Rp 125,000",
      color: "bg-red",
      features: ["Instant delivery", "Bonus points", "VIP support"]
    },
    {
      id: 5,
      amount: "2000 Robux",
      description: "Paket Robux besar untuk gaming experience maksimal",
      price: "Rp 220,000",
      color: "bg-orange",
      features: ["Instant delivery", "Best value", "Premium support", "Bonus items"]
    },
    {
      id: 6,
      amount: "2800 Robux",
      description: "Paket Robux premium dengan benefit terlengkap",
      price: "Rp 280,000", 
      color: "bg-accent",
      features: ["Instant delivery", "Maximum value", "VIP treatment", "Exclusive rewards"]
    },
    {
      id: 7,
      amount: "4500 Robux",
      description: "Paket Robux ultimate untuk serious gamers",
      price: "Rp 350,000",
      color: "bg-gold text-black",
      features: ["Instant delivery", "Ultimate package", "Dedicated support", "Limited edition items"]
    },
    {
      id: 8,
      amount: "8000 Robux",
      description: "Paket Robux terbesar dengan value terbaik",
      price: "Rp 435,000",
      color: "bg-purple",
      features: ["Instant delivery", "Best deal", "Priority support", "Exclusive access", "Special bonuses"]
    },
    {
      id: 9,
      amount: "1000 Robux",
      description: "Paket Robux budget friendly untuk starter",
      price: "Rp 120,000",
      color: "bg-green",
      features: ["Quick delivery", "Starter package", "Basic support"]
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            ROBLOX
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Manfaatkan pendataan Robux dan fitur menarik ataupun tools terbaik.
          </p>
          <p className="text-muted-foreground">
            Dapatkan Robux dengan harga terjangkau dan delivery tercepat!
          </p>
        </div>

        {/* Robux Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {robuxPackages.map((pkg) => (
            <Card key={pkg.id} className="game-card group">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`${pkg.color} border-0 text-sm font-medium`}>
                    Robux
                  </Badge>
                  <div className="flex items-center text-sm">
                    <Star className="w-4 h-4 text-gold mr-1" />
                    <span className="text-muted-foreground">4.9</span>
                  </div>
                </div>

                {/* Amount */}
                <h3 className="text-xl font-bold mb-2">{pkg.amount}</h3>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <ul className="space-y-1">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center">
                        <span className="w-1 h-1 bg-accent rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and Button */}
                <div className="space-y-3">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-primary">{pkg.price}</span>
                  </div>
                  
                  <Button className="w-full btn-primary">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Beli Sekarang
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="game-card p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Mengapa Pilih J Store untuk Robux?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-accent mb-2">⚡ Delivery Tercepat</h4>
                <p className="text-sm text-muted-foreground">
                  Robux dikirim langsung ke akun Anda dalam hitungan menit
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-2">🔒 100% Aman</h4>
                <p className="text-sm text-muted-foreground">
                  Transaksi dijamin aman dengan sistem keamanan berlapis
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-2">💰 Harga Terbaik</h4>
                <p className="text-sm text-muted-foreground">
                  Dapatkan Robux dengan harga paling kompetitif di Indonesia
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roblox;