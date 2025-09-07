import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Package, Tag, LogOut, Gamepad2, Star, X } from 'lucide-react';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  
  // State for all entities
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [games, setGames] = useState<any[]>([]);
  const [gameItems, setGameItems] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // File upload states
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>('');
  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string>('');
  const [gameImageFile, setGameImageFile] = useState<File | null>(null);
  const [gameImagePreview, setGameImagePreview] = useState<string>('');
  const [gameItemImageFile, setGameItemImageFile] = useState<File | null>(null);
  const [gameItemImagePreview, setGameItemImagePreview] = useState<string>('');
  
  // Dialog states
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [gameDialog, setGameDialog] = useState(false);
  const [gameItemDialog, setGameItemDialog] = useState(false);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    image_url: ''
  });
  
  const [itemForm, setItemForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: ''
  });
  
  const [gameForm, setGameForm] = useState({
    id: '',
    name: '',
    description: '',
    image_url: ''
  });
  
  const [gameItemForm, setGameItemForm] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    game_id: '',
    image_url: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchItems();
    fetchGames();
    fetchGameItems();
    fetchReviews();
  }, []);

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

  const clearCategoryImage = () => {
    setCategoryImageFile(null);
    setCategoryImagePreview('');
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

  const clearGameImage = () => {
    setGameImageFile(null);
    setGameImagePreview('');
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

  const clearGameItemImage = () => {
    setGameItemImageFile(null);
    setGameItemImagePreview('');
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

  const clearItemImage = () => {
    setItemImageFile(null);
    setItemImagePreview('');
  };

  // Upload image to Supabase storage
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

  // Fetch functions
  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (!error) setCategories(data || []);
  };

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*, categories(name)')
      .order('created_at', { ascending: false });
    if (!error) setItems(data || []);
  };

  const fetchGames = async () => {
    const { data, error } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    if (!error) setGames(data || []);
  };

  const fetchGameItems = async () => {
    const { data, error } = await supabase
      .from('game_items')
      .select('*, games(name)')
      .order('created_at', { ascending: false });
    if (!error) setGameItems(data || []);
  };

  const fetchReviews = async () => {
    const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (!error) setReviews(data || []);
  };

  // Category CRUD
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
        const { error } = await supabase
          .from('categories')
          .update({
            name: categoryForm.name,
            description: categoryForm.description,
            image_url: imageUrl || null
          })
          .eq('id', categoryForm.id);
        if (error) throw error;
        toast({ title: "Success", description: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            name: categoryForm.name,
            description: categoryForm.description,
            image_url: imageUrl || null
          }]);
        if (error) throw error;
        toast({ title: "Success", description: "Category created successfully" });
      }
      setCategoryForm({ id: '', name: '', description: '', image_url: '' });
      clearCategoryImage();
      setCategoryDialog(false);
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const editCategory = (category: any) => {
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
    setCategoryDialog(true);
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchCategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Item CRUD
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
        const { error } = await supabase
          .from('items')
          .update({
            name: itemForm.name,
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            category_id: parseInt(itemForm.category_id),
            image_url: imageUrl || null
          })
          .eq('id', parseInt(itemForm.id));
        if (error) throw error;
        toast({ title: "Success", description: "Item updated successfully" });
      } else {
        const { error } = await supabase
          .from('items')
          .insert([{
            name: itemForm.name,
            description: itemForm.description,
            price: parseFloat(itemForm.price),
            category_id: parseInt(itemForm.category_id),
            image_url: imageUrl || null
          }]);
        if (error) throw error;
        toast({ title: "Success", description: "Item created successfully" });
      }
      setItemForm({ id: '', name: '', description: '', price: '', category_id: '', image_url: '' });
      clearItemImage();
      setItemDialog(false);
      fetchItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const editItem = (item: any) => {
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
    setItemDialog(true);
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from('items').delete().eq('id', parseInt(id));
      if (error) throw error;
      toast({ title: "Success", description: "Item deleted successfully" });
      fetchItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Game CRUD
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
        const { error } = await supabase
          .from('games')
          .update({
            name: gameForm.name,
            description: gameForm.description || null,
            image_url: imageUrl || null
          })
          .eq('id', gameForm.id);
        if (error) throw error;
        toast({ title: "Success", description: "Game updated successfully" });
      } else {
        const { error } = await supabase
          .from('games')
          .insert([{
            name: gameForm.name,
            description: gameForm.description || null,
            image_url: imageUrl || null
          }]);
        if (error) throw error;
        toast({ title: "Success", description: "Game created successfully" });
      }
      setGameForm({ id: '', name: '', description: '', image_url: '' });
      clearGameImage();
      setGameDialog(false);
      fetchGames();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const editGame = (game: any) => {
    setGameForm({
      id: game.id,
      name: game.name,
      description: game.description || '',
      image_url: game.image_url || ''
    });
    clearGameImage();
    if (game.image_url) {
      setGameImagePreview(game.image_url);
    }
    setGameDialog(true);
  };

  const deleteGame = async (id: string) => {
    try {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Game deleted successfully" });
      fetchGames();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Game Item CRUD
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
        const { error } = await supabase
          .from('game_items')
          .update({
            name: gameItemForm.name,
            description: gameItemForm.description || null,
            price: parseInt(gameItemForm.price),
            game_id: gameItemForm.game_id,
            image_url: imageUrl || null
          })
          .eq('id', gameItemForm.id);
        if (error) throw error;
        toast({ title: "Success", description: "Game item updated successfully" });
      } else {
        const { error } = await supabase
          .from('game_items')
          .insert([{
            name: gameItemForm.name,
            description: gameItemForm.description || null,
            price: parseInt(gameItemForm.price),
            game_id: gameItemForm.game_id,
            image_url: imageUrl || null
          }]);
        if (error) throw error;
        toast({ title: "Success", description: "Game item created successfully" });
      }
      setGameItemForm({ id: '', name: '', description: '', price: '', game_id: '', image_url: '' });
      clearGameItemImage();
      setGameItemDialog(false);
      fetchGameItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const editGameItem = (item: any) => {
    setGameItemForm({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      game_id: item.game_id,
      image_url: item.image_url || ''
    });
    clearGameItemImage();
    if (item.image_url) {
      setGameItemImagePreview(item.image_url);
    }
    setGameItemDialog(true);
  };

  const deleteGameItem = async (id: string) => {
    try {
      const { error } = await supabase.from('game_items').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Game item deleted successfully" });
      fetchGameItems();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Review delete
  const deleteReview = async (id: string) => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Success", description: "Review deleted successfully" });
      fetchReviews();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button onClick={logout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="categories">
              <Tag className="h-4 w-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="items">
              <Package className="h-4 w-4 mr-2" />
              Items
            </TabsTrigger>
            <TabsTrigger value="games">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Games
            </TabsTrigger>
            <TabsTrigger value="game_items">
              <Package className="h-4 w-4 mr-2" />
              Game Items
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sky Categories</CardTitle>
                <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setCategoryForm({ id: '', name: '', description: '', image_url: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{categoryForm.id ? 'Edit' : 'Add'} Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={categoryForm.description}
                          onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="image_url">Upload Image</Label>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              id="image_url"
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
                      <Button type="submit" className="w-full">
                        {categoryForm.id ? 'Update' : 'Create'} Category
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sky Items</CardTitle>
                <Dialog open={itemDialog} onOpenChange={setItemDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setItemForm({ id: '', name: '', description: '', price: '', category_id: '', image_url: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{itemForm.id ? 'Edit' : 'Add'} Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleItemSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="item_name">Name</Label>
                        <Input
                          id="item_name"
                          value={itemForm.name}
                          onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="item_description">Description</Label>
                        <Textarea
                          id="item_description"
                          value={itemForm.description}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="item_price">Price (IDR)</Label>
                        <Input
                          id="item_price"
                          type="number"
                          value={itemForm.price}
                          onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="item_category">Category</Label>
                        <Select value={itemForm.category_id} onValueChange={(value) => setItemForm({ ...itemForm, category_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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
                        <Label htmlFor="item_image">Upload Image</Label>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              id="item_image"
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
                      <Button type="submit" className="w-full">
                        {itemForm.id ? 'Update' : 'Create'} Item
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-sm font-medium text-green-600">{formatPrice(item.price)}</p>
                        <p className="text-xs text-muted-foreground">Category: {item.categories?.name}</p>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Games</CardTitle>
                <Dialog open={gameDialog} onOpenChange={setGameDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setGameForm({ id: '', name: '', description: '', image_url: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Game
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{gameForm.id ? 'Edit' : 'Add'} Game</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleGameSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="game_name">Name</Label>
                        <Input
                          id="game_name"
                          value={gameForm.name}
                          onChange={(e) => setGameForm({ ...gameForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="game_description">Description</Label>
                        <Textarea
                          id="game_description"
                          value={gameForm.description}
                          onChange={(e) => setGameForm({ ...gameForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="game_image_url">Upload Image</Label>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              id="game_image_url"
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
                      <Button type="submit" className="w-full">
                        {gameForm.id ? 'Update' : 'Create'} Game
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {games.map((game) => (
                    <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{game.name}</h3>
                        <p className="text-sm text-muted-foreground">{game.description}</p>
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Game Items Tab */}
          <TabsContent value="game_items">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Game Items</CardTitle>
                <Dialog open={gameItemDialog} onOpenChange={setGameItemDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setGameItemForm({ id: '', name: '', description: '', price: '', game_id: '', image_url: '' })}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Game Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{gameItemForm.id ? 'Edit' : 'Add'} Game Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleGameItemSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="item_name">Name</Label>
                        <Input
                          id="item_name"
                          value={gameItemForm.name}
                          onChange={(e) => setGameItemForm({ ...gameItemForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="item_description">Description</Label>
                        <Textarea
                          id="item_description"
                          value={gameItemForm.description}
                          onChange={(e) => setGameItemForm({ ...gameItemForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="item_price">Price (IDR)</Label>
                        <Input
                          id="item_price"
                          type="number"
                          value={gameItemForm.price}
                          onChange={(e) => setGameItemForm({ ...gameItemForm, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="item_game">Game</Label>
                        <Select value={gameItemForm.game_id} onValueChange={(value) => setGameItemForm({ ...gameItemForm, game_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a game" />
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
                        <Label htmlFor="item_image_url">Upload Image</Label>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <Input
                              id="item_image_url"
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
                      <Button type="submit" className="w-full">
                        {gameItemForm.id ? 'Update' : 'Create'} Game Item
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {gameItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-sm font-medium text-green-600">{formatPrice(item.price)}</p>
                        <p className="text-xs text-muted-foreground">Game: {item.games?.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => editGameItem(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteGameItem(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{review.name}</h3>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{review.email}</p>
                        <p className="text-sm">{review.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteReview(review.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
