import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  description: string;
  image_url?: string;
  created_at: string;
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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(5);

  // Fetch reviews from Supabase
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedReviews = data.map(review => ({
        ...review,
        email: censorEmail(review.email)
      }));

      setReviews(formattedReviews);
      setFilteredReviews(formattedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Gagal memuat reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Insert new review to Supabase
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            rating,
            description: formData.description,
            image_url: imagePreview || null
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the new review to local state with censored email
      const newReview = {
        ...data,
        email: censorEmail(data.email)
      };
      const updatedReviews = [newReview, ...reviews];
      setReviews(updatedReviews);
      setFilteredReviews(selectedRatingFilter ? updatedReviews.filter(r => r.rating === selectedRatingFilter) : updatedReviews);
      
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
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan review",
        variant: "destructive"
      });
    }
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

  // Calculate rating statistics
  const getRatingStats = () => {
    if (reviews.length === 0) return { average: 0, counts: [0, 0, 0, 0, 0], total: 0 };
    
    const counts = [0, 0, 0, 0, 0];
    let totalRating = 0;
    
    reviews.forEach(review => {
      counts[review.rating - 1]++;
      totalRating += review.rating;
    });
    
    return {
      average: totalRating / reviews.length,
      counts,
      total: reviews.length
    };
  };

  // Filter reviews by rating
  const filterByRating = (rating: number | null) => {
    setSelectedRatingFilter(rating);
    setCurrentPage(1); // Reset to first page when filtering
    if (rating === null) {
      setFilteredReviews(reviews);
    } else {
      setFilteredReviews(reviews.filter(review => review.rating === rating));
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleReviewsPerPageChange = (value: string) => {
    setReviewsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const ratingStats = getRatingStats();

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent animate-pulse-gentle">
              Review & Rating
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 animate-fade-in-up animation-delay-200 px-4">
              Share your opinions and see what others think!
            </p>
          </div>

          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-300 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-center gap-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold text-gold mb-2 animate-pulse-gentle">
                    {ratingStats.average.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2 animate-fade-in-up animation-delay-400">
                    {renderStars(Math.round(ratingStats.average))}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground animate-fade-in-up animation-delay-500">
                    {ratingStats.total} total reviews
                  </p>
                </div>
              </div>
              
              {/* Rating Filter Buttons */}
              <div className="space-y-2">
                <div className="flex justify-center gap-2 mb-3 sm:mb-4">
                  <Button
                    variant={selectedRatingFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => filterByRating(null)}
                    className="text-xs sm:text-sm"
                  >
                    All ({ratingStats.total})
                  </Button>
                </div>
                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                  {[5, 4, 3, 2, 1].map((rating, index) => (
                    <Button
                      key={rating}
                      variant={selectedRatingFilter === rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => filterByRating(rating)}
                      className={`flex flex-col items-center p-2 sm:p-3 h-auto transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-${(index + 1) * 100}`}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="h-2 w-2 sm:h-3 sm:w-3 fill-gold text-gold" />
                        <span className="text-xs font-medium">{rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({ratingStats.counts[rating - 1]})
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary animate-fade-in-up animation-delay-600 hover:scale-105 transition-transform duration-300">
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
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              {selectedRatingFilter ? (
                <div>
                  <p className="text-muted-foreground text-lg mb-4">
                    No reviews with {selectedRatingFilter} star{selectedRatingFilter !== 1 ? 's' : ''} yet.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => filterByRating(null)}
                  >
                    Show All Reviews
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground text-lg">No reviews yet.</p>
              )}
            </div>
          ) : (
            <div>
              {/* Pagination Controls Top */}
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-muted-foreground">Show:</span>
                    <Select value={reviewsPerPage.toString()} onValueChange={handleReviewsPerPageChange}>
                      <SelectTrigger className="w-16 sm:w-20 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-xs sm:text-sm text-muted-foreground">per page</span>
                  </div>
                </div>
                
                <div className="text-center">
                  {selectedRatingFilter ? (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredReviews.length)} of {filteredReviews.length} reviews with {selectedRatingFilter} star{selectedRatingFilter !== 1 ? 's' : ''}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, filteredReviews.length)} of {filteredReviews.length} reviews
                    </p>
                  )}
                </div>
              </div>
              
              {currentReviews.map((review, index) => (
              <Card key={review.id} className={`game-card p-4 sm:p-6 animate-slide-in-left hover:scale-[1.02] transition-all duration-300 animation-delay-${Math.min(index * 100, 500)}`}>
                <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg truncate">{review.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{review.email}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">{review.description}</p>
                
                {review.image_url && (
                  <div className="mt-3 sm:mt-4">
                    <img
                      src={review.image_url}
                      alt="Review image"
                      className="w-full max-w-xs h-24 sm:h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </Card>
              ))
            }
            
            {/* Pagination Controls Bottom */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  Next
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;