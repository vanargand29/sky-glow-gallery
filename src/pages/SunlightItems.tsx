import { useState } from "react";
import { ArrowLeft, ShoppingCart, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import ImagePopup from "@/components/ImagePopup";
import sunlightBundle from "@/assets/sunlight-bundle-1.jpg";
import sunlightHarp from "@/assets/sunlight-harp.jpg";
import sunlightWings from "@/assets/sunlight-wings.jpg";
import sunlightBuddy from "@/assets/sunlight-buddy.jpg";

const SunlightItems = () => {
  const navigate = useNavigate();
  const [popupImage, setPopupImage] = useState<{ src: string; alt: string } | null>(null);

  const items = [
    {
      id: 1,
      name: "Sunlight Sweet Bundle",
      description: "Event Days of Sunlight Mulai 01 September Wajib buru Nengbokap 50 IB",
      price: "Rp 200,000",
      originalPrice: null,
      discount: null,
      image: sunlightBundle,
      inStock: true,
      badges: ["HOT"]
    },
    {
      id: 2,
      name: "Sunlight Harp",
      description: "Alat musik khusus tema Days of Sunlight dengan efek visual menawan",
      price: "Rp 150,000",
      originalPrice: null,
      discount: null,
      image: sunlightHarp,
      inStock: true,
      badges: ["TRENDING"]
    },
    {
      id: 3,
      name: "Sunlight Holiday Wings",
      description: "Sayap eksklusif bertema musim panas Nengbokap 30 IB",
      price: "Rp 350,000",
      originalPrice: "Rp 400,000",
      discount: "DISKON 13%",
      image: sunlightWings,
      inStock: true,
      badges: ["TRENDING"]
    },
    {
      id: 4,
      name: "Jelly Sunshine Buddy",
      description: "Teman bermain cute tema sunshine",
      price: "Rp 200,000",
      originalPrice: null,
      discount: null,
      image: sunlightBuddy,
      inStock: true,
      badges: ["HOT"]
    },
    {
      id: 5,
      name: "Sunlight Charity Candle",
      description: "Candle khusus dengan Light aura berkualitas",
      price: "Rp 100,000",
      originalPrice: "Rp 120,000",
      discount: "DISKON 17%",
      image: sunlightBundle,
      inStock: false,
      badges: ["LIMITED"]
    },
    {
      id: 6,
      name: "Sunlight Woven Wrap",
      description: "Aksesoris eksklusif tema Sunlight",
      price: "Rp 280,000",
      originalPrice: null,
      discount: null,
      image: sunlightWings,
      inStock: true,
      badges: ["NEW"]
    },
    {
      id: 7,
      name: "Sunlight Seashell",
      description: "Item koleksi khusus musim panas",
      price: "Rp 200,000",
      originalPrice: null,
      discount: null,
      image: sunlightBuddy,
      inStock: true,
      badges: ["HOT"]
    },
    {
      id: 8,
      name: "Complete Sunlight Set",
      description: "Bundel lengkap semua item Days of Sunlight",
      price: "Rp 999,000",
      originalPrice: "Rp 1,200,000",
      discount: "DISKON 17%",
      image: sunlightHarp,
      inStock: true,
      badges: ["BUNDLE"]
    },
    {
      id: 9,
      name: "Summer Emote",
      description: "Emote musim panas eksklusif",
      price: "Rp 270,000",
      originalPrice: null,
      discount: null,
      image: sunlightBundle,
      inStock: true,
      badges: ["LIMITED"]
    }
  ];

  const handleImageClick = (src: string, alt: string) => {
    setPopupImage({ src, alt });
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case "HOT":
        return "bg-red text-white";
      case "TRENDING":
        return "bg-orange text-white";
      case "LIMITED":
        return "bg-purple text-white";
      case "NEW":
        return "bg-green text-white";
      case "BUNDLE":
        return "bg-gold text-black";
      default:
        return "bg-accent text-accent-foreground";
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/sky')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">DAYS OF SUNLIGHT</h1>
            <p className="text-muted-foreground">Event eksklusif yang dimulai setiap tahun</p>
          </div>
        </div>

        {/* Event Info */}
        <div className="game-card mb-8 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Badge className="bg-orange text-white">Event</Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              01 September 2025
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Game Days of Sunlight</h3>
          <p className="text-muted-foreground">
            Event eksklusif yang merayakan musim panas dengan koleksi item spesial dan limited edition
          </p>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="game-card group">
              <div className="relative mb-4">
                <div 
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => handleImageClick(item.image, item.name)}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {item.badges.map((badge) => (
                    <Badge key={badge} className={`text-xs ${getBadgeStyle(badge)} border-0`}>
                      {badge}
                    </Badge>
                  ))}
                </div>

                {/* Discount Badge */}
                {item.discount && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-red text-white border-0 text-xs">
                      {item.discount}
                    </Badge>
                  </div>
                )}
              </div>

              <h3 className="font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary">{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {item.originalPrice}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="w-4 h-4 mr-1 text-gold" />
                  4.8
                </div>
              </div>

              <Button 
                className={`w-full ${item.inStock ? 'btn-primary' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                disabled={!item.inStock}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {item.inStock ? 'Beli Sekarang' : 'Stok Habis'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Image Popup */}
      <ImagePopup
        src={popupImage?.src || ""}
        alt={popupImage?.alt || ""}
        isOpen={!!popupImage}
        onClose={() => setPopupImage(null)}
      />
    </div>
  );
};

export default SunlightItems;