import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ImagePopup from "@/components/ImagePopup";
import skyHero from "@/assets/sky-hero.jpg";

interface Category {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

const Sky = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [popupImage, setPopupImage] = useState<{ src: string; alt: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Gagal memuat kategori",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (src: string, alt: string) => {
    setPopupImage({ src, alt });
  };

  const handleViewItems = (categoryId: string, categoryName: string) => {
    navigate(`/sky/category/${categoryId}`, { 
      state: { categoryName } 
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-secondary/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                <Star className="w-3 h-3 mr-1" />
                Premium Items
              </Badge>
              <Badge variant="secondary" className="bg-purple/20 text-purple border-purple/30">
                Categories
              </Badge>
              <Badge variant="secondary" className="bg-gold/20 text-gold border-gold/30">
                <Eye className="w-3 h-3 mr-1" />
                IAP Store
              </Badge>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              SKY: CHILDREN OF THE LIGHT ⚡
            </h1>
            
            <p className="text-xl text-muted-foreground mb-4">
              Pilih kategori untuk melihat item premium yang tersedia
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Klik "Lihat IAP" untuk melihat item dan harganya.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Kategori Item Premium</h2>
          <p className="text-center text-muted-foreground mb-12">
            Pilih kategori untuk melihat koleksi item eksklusif
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Belum ada kategori tersedia.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Card key={category.id} className="game-card group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(category.image_url!, category.name);
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                        <div className="text-6xl opacity-50">🎮</div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {category.description}
                    </p>
                    
                    <Button 
                      className="w-full btn-primary"
                      onClick={() => handleViewItems(category.id, category.name)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat IAP
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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