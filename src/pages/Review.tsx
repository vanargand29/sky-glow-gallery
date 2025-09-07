import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: number;
  name: string;
  email: string;
  rating: number;
  description: string;
  image?: string;
  date: string;
}

const Review = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: ""
  });

  // Mock reviews data
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      name: "Ahmad Rizki",
      email: "ah***@gmail.com",
      rating: 5,
      description: "Pelayanan sangat memuaskan! Item yang dibeli sesuai dengan deskripsi dan pengiriman cepat.",
      date: "2025-01-15"
    },
    {
      id: 2,
      name: "Sari Dewi",
      email: "sa**@yahoo.com",
      rating: 4,
      description: "Kualitas item bagus, harga sesuai. Akan berbelanja lagi di sini.",
      date: "2025-01-10"
    }
  ]);

  const censorEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) {
      return `${username[0]}**@${domain}`;
    }
    const visibleChars = Math.min(2, username.length - 1);
    const censored = username.slice(0, visibleChars) + '*'.repeat(username.length - visibleChars);
    return `${censored}@${domain}`;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.description || rating === 0) {
      toast({
        title: "Error",
        description: "Harap isi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    // Create new review
    const newReview: Review = {
      id: Date.now(),
      name: formData.name,
      email: censorEmail(formData.email),
      rating,
      description: formData.description,
      image: imagePreview || undefined,
      date: new Date().toISOString().split('T')[0]
    };

    setReviews([newReview, ...reviews]);
    
    // Reset form
    setFormData({ name: "", email: "", description: "" });
    setRating(0);
    setSelectedImage(null);
    setImagePreview(null);
    setIsDialogOpen(false);

    toast({
      title: "Berhasil!",
      description: "Review Anda telah berhasil ditambahkan",
    });
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 cursor-pointer transition-colors ${
          index < (interactive ? (hoveredRating || rating) : currentRating)
            ? "fill-gold text-gold"
            : "text-muted-foreground"
        }`}
        onClick={interactive ? () => setRating(index + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredRating(index + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
      />
    ));
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Review & Rating
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Share your opinions and see what others think!
          </p>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add Your Review</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-red">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-red">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Rating <span className="text-red">*</span>
                  </Label>
                  <div className="flex gap-1 mt-2">
                    {renderStars(rating, true)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description <span className="text-red">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1"
                    rows={4}
                    placeholder="Share your experience..."
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Photo (Optional)
                  </Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload image
                          </p>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 bg-green text-white hover:bg-green/90">
                    Submit
                  </Button>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No reviews yet.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} className="game-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{review.name}</h3>
                    <p className="text-sm text-muted-foreground">{review.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{review.description}</p>
                
                {review.image && (
                  <div className="mt-4">
                    <img
                      src={review.image}
                      alt="Review image"
                      className="max-w-xs h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;