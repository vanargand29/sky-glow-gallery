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
import { Plus, Edit, Trash2, Package, Tag, LogOut, Gamepad2, MessageSquare, Upload, X, Ticket, Calendar, Users, RefreshCw } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  created_at: string;
}

type ItemStatus = 'Tersedia' | 'Best Seller' | 'Close' | 'Diskon' | 'New';

interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url?: string;
  status?: ItemStatus;
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

interface Voucher {
  id: string;
  code: string;
  discount_amount: number;
  usage_limit?: number;
  usage_count: number;
  valid_from?: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  applicable_games?: string[];
  applicable_categories?: string[];
}

interface VoucherUsage {
  id: string;
  voucher_id: string;
  used_at: string;
  cart_total: number;
  discount_applied: number;
  user_info?: any;
}

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  
  const getStatusBadgeStyle = (status: ItemStatus = 'Tersedia') => {
    switch (status) {
      case 'New':
        return { backgroundColor: '#3b82f6', color: '#ffffff' }; // blue-500
      case 'Tersedia':
        return { backgroundColor: '#22c55e', color: '#ffffff' }; // green-500
      case 'Close':
        return { backgroundColor: '#ef4444', color: '#ffffff' }; // red-500
      case 'Diskon':
        return { backgroundColor: '#f97316', color: '#ffffff' }; // orange-500
      case 'Best Seller':
        return { backgroundColor: '#eab308', color: '#000000' }; // yellow-500
      default:
        return { backgroundColor: '#6b7280', color: '#ffffff' }; // gray-500
    }
  };
  
  // State management
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherUsages, setVoucherUsages] = useState<VoucherUsage[]>([]);
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
    image_url: '',
    status: 'Tersedia' as ItemStatus
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

  // Voucher form state
  const [voucherForm, setVoucherForm] = useState({
    id: '',
    code: '',
    discount_amount: '',
    usage_limit: '',
    usage_count: 0,
    valid_from: '',
    valid_until: '',
    is_active: true,
    applicable_games: [] as string[],
    applicable_categories: [] as string[]
  });
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
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
    fetchVouchers();
    fetchVoucherUsages();
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

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers' as any)
        .select(`
          *,
          voucher_applicable_categories (
            category_id,
            categories (name)
          ),
          voucher_applicable_games (
            game_id,
            games (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVouchers(data as any || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast({
        title: "Error",
        description: "Gagal memuat vouchers",
        variant: "destructive"
      });
    }
  };

  const fetchVoucherUsages = async () => {
    try {
      const { data, error } = await supabase
        .from('voucher_usage' as any)
        .select(`
          *,
          vouchers (code)
        `)
        .order('used_at', { ascending: false });

      if (error) throw error;
      setVoucherUsages(data as any || []);
    } catch (error) {
      console.error('Error fetching voucher usages:', error);
      toast({
        title: "Error",
        description: "Gagal memuat voucher usage",
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
        // Update category - only update image_url if a new image was uploaded
        const updateData: any = {
          name: categoryForm.name,
          description: categoryForm.description
        };
        
        // Only update image_url if a new image was uploaded
        if (categoryImageFile) {
          updateData.image_url = imageUrl;
        }
        
        const { error } = await supabase
          .from('categories')
          .update(updateData)
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
        // Update item - only update image_url if a new image was uploaded
        const updateData: any = {
          name: itemForm.name,
          description: itemForm.description,
          price: parseFloat(itemForm.price),
          category_id: itemForm.category_id,
          status: itemForm.status
        };
        
        // Only update image_url if a new image was uploaded
        if (itemImageFile) {
          updateData.image_url = imageUrl;
        }
        
        const { error } = await supabase
          .from('items')
          .update(updateData)
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
            image_url: imageUrl || null,
            status: itemForm.status
          } as any]);

        if (error) throw error;
        
        toast({
          title: "Berhasil",
          description: "Item berhasil ditambahkan"
        });
      }

      setItemForm({ id: '', name: '', description: '', price: '', category_id: '', image_url: '', status: 'Tersedia' as ItemStatus });
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
      image_url: item.image_url || '',
      status: item.status || 'Tersedia' as ItemStatus
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
        // Update game - only update image_url if a new image was uploaded
        const updateData: any = {
          name: gameForm.name,
          description: gameForm.description
        };
        
        // Only update image_url if a new image was uploaded
        if (gameImageFile) {
          updateData.image_url = imageUrl;
        }
        
        const { error } = await supabase
          .from('games')
          .update(updateData)
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
        // Update game item - only update image_url if a new image was uploaded
        const updateData: any = {
          name: gameItemForm.name,
          description: gameItemForm.description,
          price: parseFloat(gameItemForm.price),
          game_id: gameItemForm.game_id
        };
        
        // Only update image_url if a new image was uploaded
        if (gameItemImageFile) {
          updateData.image_url = imageUrl;
        }
        
        const { error } = await supabase
          .from('game_items')
          .update(updateData)
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

  const updateVoucherApplicableItems = async (voucherId: string, formData?: any) => {
    const currentForm = formData || voucherForm;
    console.log('=== UPDATING VOUCHER APPLICABLE ITEMS ===');
    console.log('Voucher ID:', voucherId);
    console.log('Current form data:', currentForm);
    console.log('Categories to save:', currentForm.applicable_categories);
    console.log('Games to save:', currentForm.applicable_games);

    try {
      // Delete existing applicable categories and games
      console.log('Deleting existing applicable items...');
      const { error: deleteCategories } = await supabase.from('voucher_applicable_categories' as any).delete().eq('voucher_id', voucherId);
      const { error: deleteGames } = await supabase.from('voucher_applicable_games' as any).delete().eq('voucher_id', voucherId);
      
      if (deleteCategories) console.error('Error deleting categories:', deleteCategories);
      if (deleteGames) console.error('Error deleting games:', deleteGames);

      // Insert new applicable categories
      if (currentForm.applicable_categories && currentForm.applicable_categories.length > 0) {
        const categoryInserts = currentForm.applicable_categories
          .filter((id: any) => id !== null && id !== undefined && id !== '')
          .map((categoryId: string) => ({
            voucher_id: voucherId,
            category_id: categoryId
          }));
        
        console.log('Inserting categories:', categoryInserts);
        
        if (categoryInserts.length > 0) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('voucher_applicable_categories' as any)
            .insert(categoryInserts)
            .select();
          
          if (categoryError) {
            console.error('Category insert error:', categoryError);
            throw categoryError;
          }
          console.log('Categories inserted successfully:', categoryData);
        }
      }

      // Insert new applicable games
      if (currentForm.applicable_games && currentForm.applicable_games.length > 0) {
        const gameInserts = currentForm.applicable_games
          .filter((id: any) => id !== null && id !== undefined && id !== '')
          .map((gameId: string) => ({
            voucher_id: voucherId,
            game_id: gameId
          }));
        
        console.log('Inserting games:', gameInserts);
        
        if (gameInserts.length > 0) {
          const { data: gameData, error: gameError } = await supabase
            .from('voucher_applicable_games' as any)
            .insert(gameInserts)
            .select();
          
          if (gameError) {
            console.error('Game insert error:', gameError);
            throw gameError;
          }
          console.log('Games inserted successfully:', gameData);
        }
      }

      console.log('=== VOUCHER APPLICABLE ITEMS UPDATE COMPLETED ===');
    } catch (error) {
      console.error('Error in updateVoucherApplicableItems:', error);
      throw error;
    }
  };

  const handleVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveVoucher();
  };

  const saveVoucher = async () => {
    if (!voucherForm.code || !voucherForm.discount_amount) {
      toast({
        title: "Error",
        description: "Kode voucher dan jumlah diskon harus diisi",
        variant: "destructive"
      });
      return;
    }

    console.log('Saving voucher with form data:', voucherForm);

    try {
      const voucherData = {
        code: voucherForm.code,
        discount_amount: parseInt(voucherForm.discount_amount),
        usage_limit: voucherForm.usage_limit ? parseInt(voucherForm.usage_limit) : null,
        valid_from: voucherForm.valid_from || null,
        valid_until: voucherForm.valid_until || null,
        is_active: voucherForm.is_active
      };

      console.log('Voucher data to save:', voucherData);

      if (voucherForm.id) {
        // Update voucher
        const { error } = await supabase
          .from('vouchers' as any)
          .update(voucherData)
          .eq('id', voucherForm.id);

        if (error) throw error;

        // Update applicable items
        await updateVoucherApplicableItems(voucherForm.id);
        
        toast({
          title: "Berhasil",
          description: "Voucher berhasil diupdate"
        });
      } else {
        // Create voucher
        console.log('Creating new voucher...');
        const { data: newVoucher, error } = await supabase
          .from('vouchers' as any)
          .insert([voucherData])
          .select()
          .single();

        if (error) {
          console.error('Error creating voucher:', error);
          throw error;
        }

        console.log('New voucher created:', newVoucher);

        // Add applicable items - pass current form data before reset
        if (newVoucher) {
          await updateVoucherApplicableItems(newVoucher.id, voucherForm);
        }
        
        toast({
          title: "Berhasil",
          description: "Voucher berhasil ditambahkan"
        });
      }

      console.log('Resetting voucher form after save');
      setVoucherForm({
        id: '',
        code: '',
        discount_amount: '',
        usage_limit: '',
        usage_count: 0,
        valid_from: '',
        valid_until: '',
        is_active: true,
        applicable_categories: [],
        applicable_games: []
      });
      setVoucherDialogOpen(false);
      fetchVouchers();
    } catch (error) {
      console.error('Error saving voucher:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan voucher",
        variant: "destructive"
      });
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const deleteVoucher = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher ini?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vouchers' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: "Voucher berhasil dihapus"
      });
      
      fetchVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus voucher",
        variant: "destructive"
      });
    }
  };

  const editVoucher = (voucher: any) => {
    console.log('Editing voucher:', voucher);
    const applicableGames = voucher.voucher_applicable_games?.map((g: any) => g.game_id) || [];
    const applicableCategories = voucher.voucher_applicable_categories?.map((c: any) => c.category_id) || [];
    
    console.log('Applicable games:', applicableGames);
    console.log('Applicable categories:', applicableCategories);
    
    setVoucherForm({
      id: voucher.id,
      code: voucher.code,
      discount_amount: voucher.discount_amount.toString(),
      usage_limit: voucher.usage_limit?.toString() || '',
      usage_count: voucher.usage_count || 0,
      valid_from: voucher.valid_from ? voucher.valid_from.split('T')[0] : '',
      valid_until: voucher.valid_until ? voucher.valid_until.split('T')[0] : '',
      is_active: voucher.is_active,
      applicable_games: applicableGames,
      applicable_categories: applicableCategories
    });
    setVoucherDialogOpen(true);
  };

  const toggleVoucherStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('vouchers' as any)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Berhasil",
        description: `Voucher berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`
      });
      
      fetchVouchers();
    } catch (error) {
      console.error('Error toggling voucher status:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status voucher",
        variant: "destructive"
      });
    }
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
          <Button
            variant={activeTab === 'vouchers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('vouchers')}
          >
            <Ticket className="h-4 w-4 mr-2" />
            Vouchers
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
                  <Button onClick={() => setItemForm({ id: '', name: '', description: '', price: '', category_id: '', image_url: '', status: 'Tersedia' as ItemStatus })}>
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
                      <Label htmlFor="item-status">Status</Label>
                      <Select 
                        value={itemForm.status} 
                        onValueChange={(value) => setItemForm(prev => ({ ...prev, status: value as ItemStatus }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tersedia">Tersedia</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Best Seller">Best Seller</SelectItem>
                          <SelectItem value="Close">Close</SelectItem>
                          <SelectItem value="Diskon">Diskon</SelectItem>
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
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Harga: Rp {item.price.toLocaleString('id-ID')}</span>
                          <span>Kategori: {item.categories?.name}</span>
                          <span 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={getStatusBadgeStyle(item.status)}
                          >
                            {item.status || 'Tersedia'}
                          </span>
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

        {/* Vouchers Tab */}
        {activeTab === 'vouchers' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Manajemen Vouchers</h2>
              <Dialog open={voucherDialogOpen} onOpenChange={setVoucherDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setVoucherForm({
                      id: '',
                      code: '',
                      discount_amount: '',
                      usage_limit: '',
                      usage_count: 0,
                      valid_from: '',
                      valid_until: '',
                      is_active: true,
                      applicable_games: [],
                      applicable_categories: []
                    });
                    // Refresh data when opening voucher dialog
                    fetchItems();
                    fetchGameItems();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Voucher
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {voucherForm.id ? 'Edit Voucher' : 'Tambah Voucher'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleVoucherSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="voucher-code">Kode Voucher</Label>
                        <div className="flex gap-2">
                          <Input
                            id="voucher-code"
                            value={voucherForm.code}
                            onChange={(e) => setVoucherForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                            placeholder="DISKON50"
                            required
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setVoucherForm(prev => ({ ...prev, code: generateRandomCode() }))}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="voucher-discount">Diskon (Rp)</Label>
                        <Input
                          id="voucher-discount"
                          type="number"
                          value={voucherForm.discount_amount}
                          onChange={(e) => setVoucherForm(prev => ({ ...prev, discount_amount: e.target.value }))}
                          placeholder="5000"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="voucher-usage-limit">Batas Penggunaan</Label>
                        <Input
                          id="voucher-usage-limit"
                          type="number"
                          value={voucherForm.usage_limit}
                          onChange={(e) => setVoucherForm(prev => ({ ...prev, usage_limit: e.target.value }))}
                          placeholder="Kosongkan untuk unlimited"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="voucher-active"
                          checked={voucherForm.is_active}
                          onChange={(e) => setVoucherForm(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="rounded"
                        />
                        <Label htmlFor="voucher-active">Aktif</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="voucher-valid-from">Berlaku Dari</Label>
                        <Input
                          id="voucher-valid-from"
                          type="date"
                          value={voucherForm.valid_from}
                          onChange={(e) => setVoucherForm(prev => ({ ...prev, valid_from: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="voucher-valid-until">Berlaku Sampai</Label>
                        <Input
                          id="voucher-valid-until"
                          type="date"
                          value={voucherForm.valid_until}
                          onChange={(e) => setVoucherForm(prev => ({ ...prev, valid_until: e.target.value }))}
                          placeholder="Kosongkan untuk tidak ada batas"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Game Selection */}
                      <div>
                        <Label htmlFor="game-select">🎮 Pilih Game (Opsional)</Label>
                        <select
                          id="game-select"
                          value={voucherForm.applicable_games[0] || ''}
                          onChange={(e) => {
                            const gameId = e.target.value;
                            console.log('Game dropdown changed:', gameId);
                            console.log('Current form before update:', voucherForm);
                            setVoucherForm(prev => {
                              const newForm = {
                                ...prev,
                                applicable_games: gameId ? [gameId] : [],
                                applicable_categories: gameId ? [] : prev.applicable_categories
                              };
                              console.log('New form after game selection:', newForm);
                              return newForm;
                            });
                          }}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Pilih Game --</option>
                          {games?.map((game) => (
                            <option key={game.id} value={game.id}>
                              {game.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category Selection */}
                      <div>
                        <Label htmlFor="category-select">🌟 Pilih Kategori Sky (Opsional)</Label>
                        <select
                          id="category-select"
                          value={voucherForm.applicable_categories[0] || ''}
                          onChange={(e) => {
                            const categoryId = e.target.value;
                            console.log('Category dropdown changed:', categoryId);
                            console.log('Current form before update:', voucherForm);
                            setVoucherForm(prev => {
                              const newForm = {
                                ...prev,
                                applicable_categories: categoryId ? [categoryId] : [],
                                applicable_games: categoryId ? [] : prev.applicable_games
                              };
                              console.log('New form after category selection:', newForm);
                              return newForm;
                            });
                          }}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-- Pilih Kategori --</option>
                          {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Info Text */}
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      <p className="font-medium mb-1">ℹ️ Informasi:</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Pilih game atau kategori untuk membatasi voucher pada item tertentu</li>
                        <li>Jika tidak memilih apapun, voucher berlaku untuk semua item</li>
                        <li>Hanya bisa memilih satu game ATAU satu kategori, tidak keduanya</li>
                      </ul>
                    </div>

                    {/* No Items Message */}
                    {(!games || games.length === 0) && (!categories || categories.length === 0) && (
                      <div className="text-center text-gray-500 py-4 border rounded-md">
                        <p className="text-sm">Belum ada games atau categories yang tersedia.</p>
                        <p className="text-xs">Tambahkan games atau sky categories terlebih dahulu.</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        {voucherForm.id ? 'Update' : 'Tambah'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setVoucherDialogOpen(false)}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {vouchers.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Belum Ada Vouchers</h3>
                    <p className="text-muted-foreground">
                      Voucher diskon akan muncul di sini setelah ditambahkan
                    </p>
                  </CardContent>
                </Card>
              ) : (
                vouchers.map((voucher) => (
                  <Card key={voucher.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-semibold">{voucher.code}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              voucher.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {voucher.is_active ? 'Aktif' : 'Nonaktif'}
                            </span>
                            {voucher.usage_limit && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {voucher.usage_count}/{voucher.usage_limit} digunakan
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                            <span>Diskon: Rp {voucher.discount_amount.toLocaleString('id-ID')}</span>
                            <span>Penggunaan: {voucher.usage_count} kali</span>
                            {voucher.valid_from && (
                              <span>Berlaku dari: {new Date(voucher.valid_from).toLocaleDateString('id-ID')}</span>
                            )}
                            {voucher.valid_until && (
                              <span>Berlaku sampai: {new Date(voucher.valid_until).toLocaleDateString('id-ID')}</span>
                            )}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>Berlaku untuk: {
                              (() => {
                                console.log('Voucher data:', voucher);
                                console.log('Applicable categories:', (voucher as any).voucher_applicable_categories);
                                console.log('Applicable games:', (voucher as any).voucher_applicable_games);
                                
                                const categoryNames = (voucher as any).voucher_applicable_categories?.map((cat: any) => {
                                  console.log('Category item:', cat);
                                  return cat.categories?.name;
                                }).filter(Boolean) || [];
                                
                                const gameNames = (voucher as any).voucher_applicable_games?.map((game: any) => {
                                  console.log('Game item:', game);
                                  return game.games?.name;
                                }).filter(Boolean) || [];
                                
                                console.log('Category names:', categoryNames);
                                console.log('Game names:', gameNames);
                                
                                if (categoryNames.length === 0 && gameNames.length === 0) {
                                  return 'Semua item';
                                }
                                
                                const items = [...categoryNames, ...gameNames];
                                console.log('Final items:', items);
                                return items.join(', ');
                              })()
                            }</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => toggleVoucherStatus(voucher.id, voucher.is_active)}
                          >
                            {voucher.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => editVoucher(voucher)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteVoucher(voucher.id)}>
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
