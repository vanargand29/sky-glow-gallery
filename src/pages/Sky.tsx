import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Clock } from "lucide-react";
import ImagePopup from "@/components/ImagePopup";
import skyHero from "@/assets/sky-hero.jpg";
import sunlightIcon from "@/assets/sunlight-icon.jpg";
import moonlightIcon from "@/assets/moonlight-icon.jpg";
import seasonPassIcon from "@/assets/season-pass-icon.jpg";

const Sky = () => {
  const navigate = useNavigate();
  const [popupImage, setPopupImage] = useState<{ src: string; alt: string } | null>(null);

  const events = [
    {
      id: "sunlight",
      title: "Days of Sunlight",
      type: "Event",
      description: "Days of Sunlight merupakan acara tahunan yang merayakan kebahagiaan musim panas dengan mengajak para pemain untuk bersantai di bawah sinar matahari.",
      image: sunlightIcon,
      date: "01 September 2025",
      color: "bg-orange"
    },
    {
      id: "moonlight", 
      title: "Days of Moonlight",
      type: "Event",
      description: "Days of Moonlight memulai debutnya, mengundang pemain untuk menikmati keindahan bulan purnama dan cahaya lembut yang bersinar.",
      image: moonlightIcon,
      date: "29 September 2025",
      color: "bg-purple"
    },
    {
      id: "season-pass",
      title: "Season Pass",
      type: "Limited",
      description: "Pemegang Season Pass akan mendapatkan konten musiman khusus dan membuka kesempatan untuk mengumpulkan item kosmetik unik.",
      image: seasonPassIcon,
      date: "21 Juli 2025",
      color: "bg-red"
    }
  ];

  const handleImageClick = (src: string, alt: string) => {
    setPopupImage({ src, alt });
  };

  const handleViewIAP = (eventId: string) => {
    navigate(`/sky/${eventId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                  <Star className="w-3 h-3 mr-1" />
                  Event
                </Badge>
                <Badge variant="secondary" className="bg-purple/20 text-purple border-purple/30">
                  Limited
                </Badge>
                <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
                  <Clock className="w-3 h-3 mr-1" />
                  Season
                </Badge>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                SKY: CHILDREN OF THE LIGHT ⚡
              </h1>
              
              <p className="text-xl text-muted-foreground mb-4">
                Kumpulan macam-macam event yang terdapat di game sky.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                klik lihat iap untuk melihat IAP beserta harganya.
              </p>
            </div>
            
            <div className="flex-1">
              <div 
                className="relative rounded-2xl overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300"
                onClick={() => handleImageClick(skyHero, "Sky: Children of the Light")}
              >
                <img
                  src={skyHero}
                  alt="Sky: Children of the Light"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Mengapa Memilih Kami?</h2>
          <p className="text-center text-muted-foreground mb-12">
            Bergabunglah yang terdepan dari berbagai
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event) => (
              <div key={event.id} className="game-card group">
                <div 
                  className="relative mb-4 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => handleImageClick(event.image, event.title)}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${event.color} text-white border-0`}>
                      {event.type}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                  {event.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {event.date}
                  </div>
                </div>

                <Button 
                  onClick={() => handleViewIAP(event.id)}
                  className="w-full btn-primary"
                >
                  👁️ Lihat IAP
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

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

export default Sky;