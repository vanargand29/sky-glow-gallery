import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Package, Tag, LogOut, Gamepad2, MessageSquare, Upload, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  created_at: string;
  categories?: { name: string };
}

interface Game {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

interface GameItem {
  id: string;
  name: string;
  description: string;
  price: number;
  game_id: string;
  image_url?: string;
  created_at: string;
  games?: { name: string };
}

interface Review {
  id: string;
  name: string;
  email: string;
  rating: number;
  description: string;
  image_url?: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  const [gameItemSearch, setGameItemSearch] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [itemSearch, setItemSearch] = useState<string>('');
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    image_url: ''
  });
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>('');
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  
  const [itemForm, setItemForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: ''
  });
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string>('');
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  const [gameForm, setGameForm] = useState({
    id: '',
    name: '',
    description: '',
    image_url: ''
  });
  const [gameImageFile, setGameImageFile] = useState<File | null>(null);
  const [gameImagePreview, setGameImagePreview] = useState<string>('');
  const [gameDialogOpen, setGameDialogOpen] = useState(false);

  const [gameItemForm, setGameItemForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    game_id: '',
    image_url: ''
  });
  const [gameItemImageFile, setGameItemImageFile] = useState<File | null>(null);
  const [gameItemImagePreview, setGameItemImagePreview] = useState<string>('');
  const [gameItemDialogOpen, setGameItemDialogOpen] = useState(false);

  // Filtered game items based on selected game and search
  const filteredGameItems = gameItems.filter(item => {
    const matchesGame = selectedGameFilter === 'all' || item.game_id === selectedGameFilter;
    const matchesSearch = gameItemSearch === '' || 
      item.name.toLowerCase().includes(gameItemSearch.toLowerCase()) ||
      gameItemSearch.toLowerCase().split(' ').every(word => 
        item.name.toLowerCase().includes(word)
      );
    return matchesGame && matchesSearch;
  });

  // Filtered items based on selected category and search
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategoryFilter === 'all' || item.category_id === selectedCategoryFilter;
    const matchesSearch = itemSearch === '' || 
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      itemSearch.toLowerCase().split(' ').every(word => 
        item.name.toLowerCase().includes(word)
      );
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchGames();
    fetchGameItems();
    fetchReviews();
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
    }
  };

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          categories (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: "Error",
        description: "Gagal memuat items",
        variant: "destructive"
      });
    }
  };

  const fetchGames = async () => {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Gagal memuat games",
        variant: "destructive"
      });
    }
  };

  const fetchGameItems = async () => {
    try {
      const { data, error } = await supabase
        .from('game_items')
        .select(`
          *,
          games (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGameItems(data || []);
    } catch (error) {
      console.error('Error fetching game items:', error);
      toast({
        title: "Error",
        description: "Gagal memuat game items",
        variant: "destructive"
      });
    }
  };

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Gagal memuat reviews",
        variant: "destructive"
      });
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = categoryForm.image_url;
      
      // Upload image if file is selected
      if (categoryImageFile) {
        const fileName = `category-${Date.now()}-${categoryImageFile.name}`;
        imageUrl = await uploadImage(categoryImageFile, 'images', fileName);
      }
      
      if (categoryForm.id) {
        // Update category
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryForm.name,
            description: categoryForm.description,
            image_url: imageUrl || null
          })
          .eq('id', categoryForm.id);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Kategori berhasil diupdate"
        });
      } else {
        // Create category
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: categoryForm.name,
            description: categoryForm.description,
            image_url: imageUrl || null
          }]);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Kategori berhasil ditambahkan"
        });
      }

      setCategoryForm({ id: '', name: '', description: '', image_url: '' });
      clearCategoryImage();
      setCategoryDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan kategori",
        variant: "destructive"
      });
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = itemForm.image_url;
      
      // Upload image if file is selected
      if (itemImageFile) {
        const fileName = `item-${Date.now()}-${itemImageFile.name}`;
        imageUrl = await uploadImage(itemImageFile, 'images', fileName);
      }
      
      if (itemForm.id) {
        // Update item
        const { error } = await supabase
          .from('items')
          .update({
            name: itemForm.name,
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            category_id: itemForm.category_id,
            image_url: imageUrl || null
          })
          .eq('id', itemForm.id);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Item berhasil diupdate"
        });
      } else {
        // Create item
        const { error } = await supabase
          .from('items')
          .insert([{
            name: itemForm.name,
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            category_id: itemForm.category_id,
            image_url: imageUrl || null
          }]);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Item berhasil ditambahkan"
        });
      }

      setItemForm({ id: '', name: '', description: '', price: '', category_id: '', image_url: '' });
      clearItemImage();
      setItemDialogOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan item",
        variant: "destructive"
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Semua item dalam kategori ini juga akan terhapus.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus"
      });
      
      fetchCategories();
      fetchItems();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive"
      });
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Yakin ingin menghapus item ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Item berhasil dihapus"
      });
      
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus item",
        variant: "destructive"
      });
    }
  };

  const editCategory = (category: Category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description,
      image_url: category.image_url || ''
    });
    clearCategoryImage();
    if (category.image_url) {
      setCategoryImagePreview(category.image_url);
    }
    setCategoryDialogOpen(true);
  };

  const editItem = (item: Item) => {
    setItemForm({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category_id: item.category_id,
      image_url: item.image_url || ''
    });
    clearItemImage();
    if (item.image_url) {
      setItemImagePreview(item.image_url);
    }
    setItemDialogOpen(true);
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = gameForm.image_url;
      
      // Upload image if file is selected
      if (gameImageFile) {
        const fileName = `game-${Date.now()}-${gameImageFile.name}`;
        imageUrl = await uploadImage(gameImageFile, 'images', fileName);
      }
      
      if (gameForm.id) {
        // Update game
        const { error } = await supabase
          .from('games')
          .update({
            name: gameForm.name,
            description: gameForm.description,
            image_url: imageUrl || null
          })
          .eq('id', gameForm.id);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Game berhasil diupdate"
        });
      } else {
        // Create game
        const { error } = await supabase
          .from('games')
          .insert([{
            name: gameForm.name,
            description: gameForm.description,
            image_url: imageUrl || null
          }]);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Game berhasil ditambahkan"
        });
      }

      setGameForm({ id: '', name: '', description: '', image_url: '' });
      clearGameImage();
      setGameDialogOpen(false);
      fetchGames();
    } catch (error) {
      console.error('Error saving game:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan game",
        variant: "destructive"
      });
    }
  };

  const handleGameItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = gameItemForm.image_url;
      
      // Upload image if file is selected
      if (gameItemImageFile) {
        const fileName = `game-item-${Date.now()}-${gameItemImageFile.name}`;
        imageUrl = await uploadImage(gameItemImageFile, 'images', fileName);
      }
      
      if (gameItemForm.id) {
        // Update game item
        const { error } = await supabase
          .from('game_items')
          .update({
            name: gameItemForm.name,
            description: gameItemForm.description,
            price: parseFloat(gameItemForm.price),
            game_id: gameItemForm.game_id,
            image_url: imageUrl || null
          })
          .eq('id', gameItemForm.id);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Game item berhasil diupdate"
        });
      } else {
        // Create game item
        const { error } = await supabase
          .from('game_items')
          .insert([{
            name: gameItemForm.name,
            description: gameItemForm.description,
            price: parseFloat(gameItemForm.price),
            game_id: gameItemForm.game_id,
            image_url: imageUrl || null
          }]);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Game item berhasil ditambahkan"
        });
      }

      setGameItemForm({ id: '', name: '', description: '', price: '', game_id: '', image_url: '' });
      clearGameItemImage();
      setGameItemDialogOpen(false);
      fetchGameItems();
    } catch (error) {
      console.error('Error saving game item:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan game item",
        variant: "destructive"
      });
    }
  };

  const deleteGame = async (id: string) => {
    if (!confirm('Yakin ingin menghapus game ini? Semua item dalam game ini juga akan terhapus.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Game berhasil dihapus"
      });
      
      fetchGames();
      fetchGameItems();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus game",
        variant: "destructive"
      });
    }
  };

  const deleteGameItem = async (id: string) => {
    if (!confirm('Yakin ingin menghapus game item ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('game_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Game item berhasil dihapus"
      });
      
      fetchGameItems();
    } catch (error) {
      console.error('Error deleting game item:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus game item",
        variant: "destructive"
      });
    }
  };

  const editGame = (game: Game) => {
    setGameForm({
      id: game.id,
      name: game.name,
      description: game.description,
      image_url: game.image_url || ''
    });
    clearGameImage();
    if (game.image_url) {
      setGameImagePreview(game.image_url);
    }
    setGameDialogOpen(true);
  };

  const editGameItem = (gameItem: GameItem) => {
    setGameItemForm({
      id: gameItem.id,
      name: gameItem.name,
      description: gameItem.description,
      price: gameItem.price.toString(),
      game_id: gameItem.game_id,
      image_url: gameItem.image_url || ''
    });
    clearGameItemImage();
    if (gameItem.image_url) {
      setGameItemImagePreview(gameItem.image_url);
    }
    setGameItemDialogOpen(true);
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Yakin ingin menghapus review ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Review berhasil dihapus"
      });
      
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus review",
        variant: "destructive"
      });
    }
  };

  const censorEmail = (email: string) => {
    if (email.length <= 2) return email;
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    const censoredLocal = localPart.substring(0, 2) + '*'.repeat(Math.max(0, localPart.length - 2));
    return `${censoredLocal}@${domain}`;
  };

  // File upload handlers
  const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCategoryImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setCategoryImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setItemImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGameImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGameImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setGameImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGameItemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGameItemImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setGameItemImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload file to Supabase storage
  const uploadImage = async (file: File, bucket: string, path: string) => {
    try {
      // Upload the file directly
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        // If bucket doesn't exist, provide helpful error message
        if (error.message.includes('Bucket not found')) {
          throw new Error('Storage bucket belum dibuat. Silakan buat bucket "images" di Supabase Dashboard terlebih dahulu.');
        }
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // Clear image handlers
  const clearCategoryImage = () => {
    setCategoryImageFile(null);
    setCategoryImagePreview('');
    setCategoryForm(prev => ({ ...prev, image_url: '' }));
  };

  const clearItemImage = () => {
    setItemImageFile(null);
    setItemImagePreview('');
    setItemForm(prev => ({ ...prev, image_url: '' }));
  };

  const clearGameImage = () => {
    setGameImageFile(null);
    setGameImagePreview('');
    setGameForm(prev => ({ ...prev, image_url: '' }));
  };

  const clearGameItemImage = () => {
    setGameItemImageFile(null);
    setGameItemImagePreview('');
    setGameItemForm(prev => ({ ...prev, image_url: '' }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Kelola kategori dan item Sky Children of The Light</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
          >
            <Tag className="h-4 w-4 mr-2" />
            Kategori
          </Button>
          <Button
            variant={activeTab === 'items' ? 'default' : 'outline'}
            onClick={() => setActiveTab('items')}
          >
            <Package className="h-4 w-4 mr-2" />
            Items
          </Button>
          <Button
            variant={activeTab === 'games' ? 'default' : 'outline'}
            onClick={() => setActiveTab('games')}
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Games
          </Button>
          <Button
            variant={activeTab === 'gameItems' ? 'default' : 'outline'}
            onClick={() => setActiveTab('gameItems')}
          >
            <Package className="h-4 w-4 mr-2" />
            Game Items
          </Button>
          <Button
            variant={activeTab === 'reviews' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reviews')}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Reviews
          </Button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manajemen Kategori</h2>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setCategoryForm({ id: '', name: '', description: '', image_url: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kategori
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {categoryForm.id ? 'Edit Kategori' : 'Tambah Kategori'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="category-name">Nama Kategori</Label>
                      <Input
                        id="category-name"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Days of Sunlight"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-description">Deskripsi</Label>
                      <Textarea
                        id="category-description"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Deskripsi kategori..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category-image">Upload Gambar</Label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Input
                            id="category-image"
                            type="file"
                            accept="image/*"
                            onChange={handleCategoryImageUpload}
                            className="flex-1"
                          />
                          {categoryImagePreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearCategoryImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {categoryImagePreview && (
                          <div className="relative">
                            <img
                              src={categoryImagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {categoryForm.id ? 'Update' : 'Tambah'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                        <p className="text-muted-foreground mb-2">{category.description}</p>
                        {category.image_url && (
                          <p className="text-sm text-muted-foreground">Image: {category.image_url}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editCategory(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteCategory(category.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manajemen Games</h2>
              <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setGameForm({ id: '', name: '', description: '', image_url: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Game
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {gameForm.id ? 'Edit Game' : 'Tambah Game'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleGameSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="game-name">Nama Game</Label>
                      <Input
                        id="game-name"
                        value={gameForm.name}
                        onChange={(e) => setGameForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Roblox"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="game-description">Deskripsi</Label>
                      <Textarea
                        id="game-description"
                        value={gameForm.description}
                        onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Platform game online dengan berbagai pengalaman gaming..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="game-image">Upload Gambar</Label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Input
                            id="game-image"
                            type="file"
                            accept="image/*"
                            onChange={handleGameImageUpload}
                            className="flex-1"
                          />
                          {gameImagePreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearGameImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {gameImagePreview && (
                          <div className="relative">
                            <img
                              src={gameImagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {gameForm.id ? 'Update' : 'Tambah'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setGameDialogOpen(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {games.map((game) => (
                <Card key={game.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{game.name}</h3>
                        <p className="text-muted-foreground mb-2">{game.description}</p>
                        {game.image_url && (
                          <p className="text-sm text-muted-foreground">Image: {game.image_url}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editGame(game)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteGame(game.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manajemen Items</h2>
              <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setItemForm({ id: '', name: '', description: '', price: '', category_id: '', image_url: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {itemForm.id ? 'Edit Item' : 'Tambah Item'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleItemSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="item-name">Nama Item</Label>
                      <Input
                        id="item-name"
                        value={itemForm.name}
                        onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Sunlight Harp"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-description">Deskripsi</Label>
                      <Textarea
                        id="item-description"
                        value={itemForm.description}
                        onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Alat musik khusus tema Days of Sunlight..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-price">Harga</Label>
                      <Input
                        id="item-price"
                        type="number"
                        value={itemForm.price}
                        onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="200000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="item-category">Kategori</Label>
                      <Select value={itemForm.category_id} onValueChange={(value) => setItemForm(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="item-image">Upload Gambar</Label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Input
                            id="item-image"
                            type="file"
                            accept="image/*"
                            onChange={handleItemImageUpload}
                            className="flex-1"
                          />
                          {itemImagePreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearItemImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {itemImagePreview && (
                          <div className="relative">
                            <img
                              src={itemImagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {itemForm.id ? 'Update' : 'Tambah'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Category Filter Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={selectedCategoryFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategoryFilter('all')}
                >
                  Semua Kategori ({items.length})
                </Button>
                {categories.map((category) => {
                  const categoryItemCount = items.filter(item => item.category_id === category.id).length;
                  return (
                    <Button
                      key={category.id}
                      variant={selectedCategoryFilter === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategoryFilter(category.id)}
                    >
                      {category.name} ({categoryItemCount})
                    </Button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="max-w-md">
                <Input
                  placeholder="Cari item... (contoh: Sunlight Cape atau Cape Sunlight)"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-4 text-sm text-muted-foreground">
              {itemSearch && (
                <p>Hasil pencarian "{itemSearch}": {filteredItems.length} item ditemukan</p>
              )}
              {selectedCategoryFilter !== 'all' && !itemSearch && (
                <p>Menampilkan item untuk: {categories.find(c => c.id === selectedCategoryFilter)?.name}</p>
              )}
            </div>

            <div className="grid gap-4">
              {filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {itemSearch ? 'Tidak ada item yang ditemukan' : 'Belum ada item untuk kategori ini'}
                    </h3>
                    <p className="text-muted-foreground">
                      {itemSearch 
                        ? `Coba kata kunci lain atau periksa ejaan "${itemSearch}"`
                        : 'Item akan muncul di sini setelah ditambahkan'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                        <p className="text-muted-foreground mb-2">{item.description}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Harga: Rp {item.price.toLocaleString('id-ID')}</span>
                          <span>Kategori: {item.categories?.name}</span>
                        </div>
                        {item.image_url && (
                          <p className="text-sm text-muted-foreground mt-1">Image: {item.image_url}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Game Items Tab */}
        {activeTab === 'gameItems' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manajemen Game Items</h2>
              <Dialog open={gameItemDialogOpen} onOpenChange={setGameItemDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setGameItemForm({ id: '', name: '', description: '', price: '', game_id: '', image_url: '' })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Game Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {gameItemForm.id ? 'Edit Game Item' : 'Tambah Game Item'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleGameItemSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="gameitem-name">Nama Item</Label>
                      <Input
                        id="gameitem-name"
                        value={gameItemForm.name}
                        onChange={(e) => setGameItemForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Robux 800"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gameitem-description">Deskripsi</Label>
                      <Textarea
                        id="gameitem-description"
                        value={gameItemForm.description}
                        onChange={(e) => setGameItemForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Mata uang premium untuk membeli item dan gamepass..."
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gameitem-price">Harga</Label>
                      <Input
                        id="gameitem-price"
                        type="number"
                        value={gameItemForm.price}
                        onChange={(e) => setGameItemForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="50000"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="gameitem-game">Game</Label>
                      <Select value={gameItemForm.game_id} onValueChange={(value) => setGameItemForm(prev => ({ ...prev, game_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih game" />
                        </SelectTrigger>
                        <SelectContent>
                          {games.map((game) => (
                            <SelectItem key={game.id} value={game.id}>
                              {game.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="gameitem-image">Upload Gambar</Label>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Input
                            id="gameitem-image"
                            type="file"
                            accept="image/*"
                            onChange={handleGameItemImageUpload}
                            className="flex-1"
                          />
                          {gameItemImagePreview && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearGameItemImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {gameItemImagePreview && (
                          <div className="relative">
                            <img
                              src={gameItemImagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {gameItemForm.id ? 'Update' : 'Tambah'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setGameItemDialogOpen(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Game Filter Buttons */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={selectedGameFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedGameFilter('all')}
                >
                  Semua Game ({gameItems.length})
                </Button>
                {games.map((game) => {
                  const gameItemCount = gameItems.filter(item => item.game_id === game.id).length;
                  return (
                    <Button
                      key={game.id}
                      variant={selectedGameFilter === game.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedGameFilter(game.id)}
                    >
                      {game.name} ({gameItemCount})
                    </Button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="max-w-md">
                <Input
                  placeholder="Cari item... (contoh: Robux 500 atau 500 Robux)"
                  value={gameItemSearch}
                  onChange={(e) => setGameItemSearch(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-4 text-sm text-muted-foreground">
              {gameItemSearch && (
                <p>Hasil pencarian "{gameItemSearch}": {filteredGameItems.length} item ditemukan</p>
              )}
              {selectedGameFilter !== 'all' && !gameItemSearch && (
                <p>Menampilkan item untuk: {games.find(g => g.id === selectedGameFilter)?.name}</p>
              )}
            </div>

            <div className="grid gap-4">
              {filteredGameItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {gameItemSearch ? 'Tidak ada item yang ditemukan' : 'Belum ada item untuk game ini'}
                    </h3>
                    <p className="text-muted-foreground">
                      {gameItemSearch 
                        ? `Coba kata kunci lain atau periksa ejaan "${gameItemSearch}"`
                        : 'Item akan muncul di sini setelah ditambahkan'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredGameItems.map((gameItem) => (
                <Card key={gameItem.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{gameItem.name}</h3>
                        <p className="text-muted-foreground mb-2">{gameItem.description}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Harga: Rp {gameItem.price.toLocaleString('id-ID')}</span>
                          <span>Game: {gameItem.games?.name}</span>
                        </div>
                        {gameItem.image_url && (
                          <p className="text-sm text-muted-foreground mt-1">Image: {gameItem.image_url}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editGameItem(gameItem)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteGameItem(gameItem.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manajemen Reviews</h2>
              <div className="text-sm text-muted-foreground">
                Total Reviews: {reviews.length}
              </div>
            </div>

            <div className="grid gap-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Belum Ada Reviews</h3>
                    <p className="text-muted-foreground">
                      Reviews dari pengguna akan muncul di sini
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-semibold">{review.name}</h3>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="ml-1 text-sm text-muted-foreground">
                                ({review.rating}/5)
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{review.description}</p>
                          
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>Email: {censorEmail(review.email)}</span>
                            <span>Tanggal: {new Date(review.created_at).toLocaleDateString('id-ID')}</span>
                          </div>
                          
                          {review.image_url && (
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground mb-2">Gambar:</p>
                              <img 
                                src={review.image_url} 
                                alt="Review image" 
                                className="w-32 h-32 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteReview(review.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
