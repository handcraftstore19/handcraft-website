import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Layers, Loader2, Copy } from 'lucide-react';
import { StoreAvailability, Category, Subcategory } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';
import { categoryService, subcategoryService } from '@/services/firestoreService';
import { uploadImageAsBase64 } from '@/services/storageService';
import { productService } from '@/services/firestoreService';

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  
  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryIconFile, setCategoryIconFile] = useState<File | null>(null);
  const [categoryImage, setCategoryImage] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryStoreAvailability, setCategoryStoreAvailability] = useState<StoreAvailability>({
    hyderabad: true,
    vizag: false,
    warangal: false
  });
  
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryIcon, setSubcategoryIcon] = useState('');
  const [subcategoryIconFile, setSubcategoryIconFile] = useState<File | null>(null);
  const [subcategoryImage, setSubcategoryImage] = useState('');
  const [subcategoryStoreAvailability, setSubcategoryStoreAvailability] = useState<StoreAvailability>({
    hyderabad: true,
    vizag: false,
    warangal: false
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [subcategoryImageFile, setSubcategoryImageFile] = useState<File | null>(null);
  
  const { toast } = useToast();

  // Helper function to recursively remove File objects from data
  const sanitizeData = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return null;
    }
    if (obj instanceof File) {
      console.warn('File object detected in data, removing:', obj.name);
      return null; // Remove File objects
    }
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeData(item)).filter(item => item !== null);
    }
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = sanitizeData(obj[key]);
          if (value !== null && value !== undefined) {
            sanitized[key] = value;
          }
        }
      }
      return sanitized;
    }
    return obj;
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const firestoreCategories = await categoryService.getAll();
      setCategories(firestoreCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories from Firestore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalProducts = async (categoryId: number): Promise<number> => {
    try {
      const products = await productService.getByCategory(categoryId);
      return products.length;
    } catch (error) {
      return 0;
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName || !categoryDescription) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = categoryImage;
      let iconUrl = categoryIcon;
      
      // If image file is provided, upload it
      if (imageFile) {
        imageUrl = await uploadImageAsBase64(imageFile);
      }
      
      // If icon file is provided, upload it
      if (categoryIconFile) {
        iconUrl = await uploadImageAsBase64(categoryIconFile);
      }

      // Get next ID (simple increment - in production, use a better ID system)
      const nextId = categories.length > 0 
        ? Math.max(...categories.map(c => c.id)) + 1 
        : 1;

      // Ensure iconUrl and imageUrl are strings, not objects
      const finalIconUrl = typeof iconUrl === 'string' ? iconUrl : (iconUrl ? String(iconUrl) : '');
      const finalImageUrl = typeof imageUrl === 'string' ? imageUrl : (imageUrl ? String(imageUrl) : '');

      const categoryData: any = {
        id: nextId,
        name: categoryName,
        iconName: finalIconUrl, // Already a string
        image: finalImageUrl, // Already a string
        description: categoryDescription,
        availableAt: categoryStoreAvailability,
      };
      
      // Sanitize the entire object to remove any File objects or nested File objects
      const sanitizedData = sanitizeData(categoryData);
      
      // Ensure iconName and image are strings after sanitization
      if (sanitizedData.iconName && typeof sanitizedData.iconName !== 'string') {
        sanitizedData.iconName = String(sanitizedData.iconName);
      }
      if (sanitizedData.image && typeof sanitizedData.image !== 'string') {
        sanitizedData.image = String(sanitizedData.image);
      }
      
      // Remove any null or undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          delete sanitizedData[key];
        }
      });
      
      console.log('Creating category with data:', { ...sanitizedData, iconName: sanitizedData.iconName?.substring(0, 50), image: sanitizedData.image?.substring(0, 50) });
      await categoryService.create(sanitizedData);

      toast({
        title: "Success",
        description: "Category created successfully.",
      });

      // Reset form
      setCategoryName('');
      setCategoryIcon('');
      setCategoryIconFile(null);
      setCategoryImage('');
      setCategoryDescription('');
      setCategoryStoreAvailability({ hyderabad: true, vizag: false, warangal: false });
      setImageFile(null);
      setIsAddDialogOpen(false);
      
      // Reload categories
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create category.",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.iconName || ''); // iconName stores the icon URL/base64
    setCategoryIconFile(null);
    setCategoryImage(category.image);
    setCategoryDescription(category.description);
    setCategoryStoreAvailability(category.availableAt || { hyderabad: true, vizag: false, warangal: false });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !categoryName || !categoryDescription) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = categoryImage;
      let iconUrl = categoryIcon;
      
      if (imageFile) {
        imageUrl = await uploadImageAsBase64(imageFile);
      }
      
      // If icon file is provided, upload it
      if (categoryIconFile) {
        iconUrl = await uploadImageAsBase64(categoryIconFile);
      }

      // Ensure iconUrl and imageUrl are strings, not objects
      const finalIconUrl = typeof iconUrl === 'string' ? iconUrl : (iconUrl ? String(iconUrl) : (categoryIcon || ''));
      const finalImageUrl = typeof imageUrl === 'string' ? imageUrl : (imageUrl ? String(imageUrl) : '');

      // Ensure we only pass clean data to Firestore (no File objects)
      const updateData: any = {
        name: categoryName,
        iconName: finalIconUrl, // Already a string
        image: finalImageUrl, // Already a string
        description: categoryDescription,
        availableAt: categoryStoreAvailability,
      };
      
      // Sanitize the entire object to remove any File objects or nested File objects
      const sanitizedData = sanitizeData(updateData);
      
      // Ensure iconName and image are strings after sanitization
      if (sanitizedData.iconName && typeof sanitizedData.iconName !== 'string') {
        sanitizedData.iconName = String(sanitizedData.iconName);
      }
      if (sanitizedData.image && typeof sanitizedData.image !== 'string') {
        sanitizedData.image = String(sanitizedData.image);
      }
      
      // Remove any null or undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          delete sanitizedData[key];
        }
      });
      
      console.log('Updating category with data:', { ...sanitizedData, iconName: sanitizedData.iconName?.substring(0, 50), image: sanitizedData.image?.substring(0, 50) });
      await categoryService.update(selectedCategory.id, sanitizedData);

      toast({
        title: "Success",
        description: "Category updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setImageFile(null);
      setCategoryIconFile(null);
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update category.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      return;
    }

    try {
      await categoryService.delete(categoryId);
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      });
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive",
      });
    }
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategoryId || !subcategoryName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = subcategoryImage;
      
      if (subcategoryImageFile) {
        imageUrl = await uploadImageAsBase64(subcategoryImageFile);
      }

      // Get next subcategory ID
      const category = categories.find(c => c.id === selectedCategoryId);
      const nextId = category && category.subcategories.length > 0
        ? Math.max(...category.subcategories.map(s => s.id)) + 1
        : selectedCategoryId * 100 + 1;

      let subcategoryIconUrl = '';
      
      // If icon file is provided, upload it
      if (subcategoryIconFile) {
        subcategoryIconUrl = await uploadImageAsBase64(subcategoryIconFile);
      } else if (subcategoryIcon) {
        subcategoryIconUrl = subcategoryIcon;
      }

      // Ensure we only pass clean data to Firestore (no File objects)
      const subcategoryData: any = {
        id: nextId,
        name: subcategoryName,
        image: String(imageUrl || ''), // Ensure it's a string
        iconName: String(subcategoryIconUrl || ''), // Ensure it's a string
        productCount: 0,
        availableAt: subcategoryStoreAvailability,
        categoryId: selectedCategoryId,
      };
      
      // Sanitize the entire object to remove any File objects or nested File objects
      const sanitizedData = sanitizeData(subcategoryData);
      
      // Remove any null or undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          delete sanitizedData[key];
        }
      });
      
      await subcategoryService.create(sanitizedData);

      toast({
        title: "Success",
        description: "Subcategory created successfully.",
      });

      setSubcategoryName('');
      setSubcategoryIcon('');
      setSubcategoryIconFile(null);
      setSubcategoryImage('');
      setSubcategoryStoreAvailability({ hyderabad: true, vizag: false, warangal: false });
      setSubcategoryImageFile(null);
      setIsSubcategoryDialogOpen(false);
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create subcategory.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubcategory = (subcategory: Subcategory, categoryId: number) => {
    setEditingSubcategory(subcategory);
    setSelectedCategoryId(categoryId);
    setSubcategoryName(subcategory.name);
    setSubcategoryIcon((subcategory as any).iconName || '');
    setSubcategoryIconFile(null);
    setSubcategoryImage(subcategory.image);
    setSubcategoryStoreAvailability(subcategory.availableAt || { hyderabad: true, vizag: false, warangal: false });
    setIsSubcategoryDialogOpen(true);
  };

  const handleUpdateSubcategory = async () => {
    if (!editingSubcategory || !subcategoryName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = subcategoryImage;
      
      if (subcategoryImageFile) {
        imageUrl = await uploadImageAsBase64(subcategoryImageFile);
      }

      let subcategoryIconUrl = '';
      
      // If icon file is provided, upload it
      if (subcategoryIconFile) {
        subcategoryIconUrl = await uploadImageAsBase64(subcategoryIconFile);
      } else if (subcategoryIcon) {
        subcategoryIconUrl = subcategoryIcon;
      }

      // Ensure we only pass clean data to Firestore (no File objects)
      const updateData: any = {
        name: subcategoryName,
        image: String(imageUrl || ''), // Ensure it's a string
        iconName: String(subcategoryIconUrl || ''), // Ensure it's a string
        availableAt: subcategoryStoreAvailability,
      };
      
      // Sanitize the entire object to remove any File objects or nested File objects
      const sanitizedData = sanitizeData(updateData);
      
      // Remove any null or undefined values
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          delete sanitizedData[key];
        }
      });
      
      await subcategoryService.update(editingSubcategory.id, sanitizedData);

      toast({
        title: "Success",
        description: "Subcategory updated successfully.",
      });

      setIsSubcategoryDialogOpen(false);
      setEditingSubcategory(null);
      setSubcategoryImageFile(null);
      setSubcategoryIconFile(null);
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subcategory.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: number) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) {
      return;
    }

    try {
      await subcategoryService.delete(subcategoryId);
      toast({
        title: "Success",
        description: "Subcategory deleted successfully.",
      });
      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subcategory.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateCategory = async (category: Category) => {
    try {
      // Get next ID
      const nextId = categories.length > 0 
        ? Math.max(...categories.map(c => c.id)) + 1 
        : 1;

      const categoryData: any = {
        id: nextId,
        name: `${category.name} (Copy)`,
        iconName: String(category.iconName || ''),
        image: String(category.image || ''),
        description: category.description,
        availableAt: category.availableAt || { hyderabad: true, vizag: false, warangal: false },
      };

      // Sanitize the data
      const sanitizedData = sanitizeData(categoryData);
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          delete sanitizedData[key];
        }
      });

      await categoryService.create(sanitizedData);

      toast({
        title: "Success",
        description: "Category duplicated successfully.",
      });

      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate category.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateSubcategory = async (subcategory: Subcategory, categoryId: number) => {
    try {
      // Get next subcategory ID
      const category = categories.find(c => c.id === categoryId);
      const nextId = category && category.subcategories.length > 0
        ? Math.max(...category.subcategories.map(s => s.id)) + 1
        : categoryId * 100 + 1;

      const subcategoryData: any = {
        id: nextId,
        name: `${subcategory.name} (Copy)`,
        image: String(subcategory.image || ''),
        iconName: String((subcategory as any).iconName || ''),
        productCount: 0,
        availableAt: subcategory.availableAt || { hyderabad: true, vizag: false, warangal: false },
        categoryId: categoryId,
      };

      // Sanitize the data
      const sanitizedData = sanitizeData(subcategoryData);
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined || sanitizedData[key] === null) {
          delete sanitizedData[key];
        }
      });

      await subcategoryService.create(sanitizedData);

      toast({
        title: "Success",
        description: "Subcategory duplicated successfully.",
      });

      await loadCategories();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate subcategory.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Categories</h2>
          <p className="text-muted-foreground">Manage product categories and subcategories</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a new product category with icon and cover image.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="catName">Category Name *</Label>
                <Input 
                  id="catName" 
                  placeholder="Enter category name" 
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="catIcon">Category Icon *</Label>
                <Input 
                  type="file"
                  accept="image/*"
                  id="catIcon"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setCategoryIconFile(file);
                      setCategoryIcon('');
                    }
                  }}
                />
                {categoryIconFile && (
                  <p className="text-xs text-muted-foreground mt-1">Selected: {categoryIconFile.name}</p>
                )}
                <Input 
                  className="mt-2"
                  placeholder="Or enter icon URL"
                  value={categoryIcon}
                  onChange={(e) => {
                    setCategoryIcon(e.target.value);
                    setCategoryIconFile(null);
                  }}
                />
                <p className="text-xs text-muted-foreground mt-1">Upload an icon image file or provide a URL</p>
              </div>
              <div>
                <Label htmlFor="catImage">Cover Image</Label>
                <Input 
                  type="file"
                  accept="image/*"
                  id="catImage"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setCategoryImage('');
                    }
                  }}
                />
                {imageFile && (
                  <p className="text-xs text-muted-foreground mt-1">Selected: {imageFile.name}</p>
                )}
                <Input 
                  className="mt-2"
                  placeholder="Or enter image URL"
                  value={categoryImage}
                  onChange={(e) => {
                    setCategoryImage(e.target.value);
                    setImageFile(null);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="catDesc">Description *</Label>
                <Textarea 
                  id="catDesc" 
                  placeholder="Category description" 
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Category Available At Stores</Label>
                <div className="space-y-3 mt-2 p-4 border rounded-lg bg-muted/30">
                  {(['hyderabad', 'vizag', 'warangal'] as const).map((store) => (
                    <div key={store} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{store === 'vizag' ? 'Visakhapatnam' : store}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${categoryStoreAvailability[store] ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {categoryStoreAvailability[store] ? 'ON' : 'OFF'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCategoryStoreAvailability({ ...categoryStoreAvailability, [store]: !categoryStoreAvailability[store] })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            categoryStoreAvailability[store] ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              categoryStoreAvailability[store] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory} className="bg-accent hover:bg-accent/90">
                  Add Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details, icon, and cover image.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editCatName">Category Name *</Label>
              <Input 
                id="editCatName" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="editCatIcon">Category Icon *</Label>
              <Input 
                type="file"
                accept="image/*"
                id="editCatIcon"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setCategoryIconFile(file);
                    setCategoryIcon('');
                  }
                }}
              />
              {categoryIconFile && (
                <p className="text-xs text-muted-foreground mt-1">Selected: {categoryIconFile.name}</p>
              )}
              {categoryIcon && !categoryIconFile && (
                <div className="mt-2">
                  <img src={categoryIcon} alt="Current icon" className="w-12 h-12 object-cover rounded" />
                </div>
              )}
              <Input 
                className="mt-2"
                placeholder="Or enter icon URL"
                value={categoryIcon}
                onChange={(e) => {
                  setCategoryIcon(e.target.value);
                  setCategoryIconFile(null);
                }}
              />
            </div>
            <div>
              <Label htmlFor="editCatImage">Cover Image</Label>
              <Input 
                type="file"
                accept="image/*"
                id="editCatImage"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setCategoryImage('');
                  }
                }}
              />
              <Input 
                className="mt-2"
                placeholder="Or enter image URL"
                value={categoryImage}
                onChange={(e) => {
                  setCategoryImage(e.target.value);
                  setImageFile(null);
                }}
              />
            </div>
            <div>
              <Label htmlFor="editCatDesc">Description *</Label>
              <Textarea 
                id="editCatDesc" 
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
              />
            </div>
            <div>
              <Label>Category Available At Stores</Label>
              <div className="space-y-3 mt-2 p-4 border rounded-lg bg-muted/30">
                {(['hyderabad', 'vizag', 'warangal'] as const).map((store) => (
                  <div key={store} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{store === 'vizag' ? 'Visakhapatnam' : store}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${categoryStoreAvailability[store] ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {categoryStoreAvailability[store] ? 'ON' : 'OFF'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCategoryStoreAvailability({ ...categoryStoreAvailability, [store]: !categoryStoreAvailability[store] })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          categoryStoreAvailability[store] ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            categoryStoreAvailability[store] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory} className="bg-accent hover:bg-accent/90">
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {category.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {category.subcategories.length} subcategories
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDuplicateCategory(category)}
                    title="Duplicate Category"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditCategory(category)}
                    title="Edit Category"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteCategory(category.id)}
                    title="Delete Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Subcategories
                </h4>
                <Dialog 
                  open={isSubcategoryDialogOpen && selectedCategoryId === category.id} 
                  onOpenChange={(open) => {
                    setIsSubcategoryDialogOpen(open);
                    if (open) {
                      setSelectedCategoryId(category.id);
                      setEditingSubcategory(null);
                      setSubcategoryName('');
                      setSubcategoryIcon('');
                      setSubcategoryIconFile(null);
                      setSubcategoryImage('');
                      setSubcategoryStoreAvailability({ hyderabad: true, vizag: false, warangal: false });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Subcategory
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSubcategory ? 'Edit' : 'Add'} Subcategory to {category.name}
                      </DialogTitle>
                      <DialogDescription>
                        {editingSubcategory ? 'Update' : 'Create'} a subcategory with icon and cover image.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subName">Subcategory Name *</Label>
                        <Input 
                          id="subName" 
                          placeholder="Enter subcategory name" 
                          value={subcategoryName}
                          onChange={(e) => setSubcategoryName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subIcon">Subcategory Icon *</Label>
                        <Input 
                          type="file"
                          accept="image/*"
                          id="subIcon"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSubcategoryIconFile(file);
                              setSubcategoryIcon('');
                            }
                          }}
                        />
                        {subcategoryIconFile && (
                          <p className="text-xs text-muted-foreground mt-1">Selected: {subcategoryIconFile.name}</p>
                        )}
                        {subcategoryIcon && !subcategoryIconFile && (
                          <div className="mt-2">
                            <img src={subcategoryIcon} alt="Current icon" className="w-12 h-12 object-cover rounded" />
                          </div>
                        )}
                        <Input 
                          className="mt-2"
                          placeholder="Or enter icon URL"
                          value={subcategoryIcon}
                          onChange={(e) => {
                            setSubcategoryIcon(e.target.value);
                            setSubcategoryIconFile(null);
                          }}
                        />
                      </div>
                      <div>
                        <Label htmlFor="subImage">Cover Image</Label>
                        <Input 
                          type="file"
                          accept="image/*"
                          id="subImage"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSubcategoryImageFile(file);
                              setSubcategoryImage('');
                            }
                          }}
                        />
                        {subcategoryImageFile && (
                          <p className="text-xs text-muted-foreground mt-1">Selected: {subcategoryImageFile.name}</p>
                        )}
                        <Input 
                          className="mt-2"
                          placeholder="Or enter image URL"
                          value={subcategoryImage}
                          onChange={(e) => {
                            setSubcategoryImage(e.target.value);
                            setSubcategoryImageFile(null);
                          }}
                        />
                      </div>
                      <div>
                        <Label>Subcategory Available At Stores</Label>
                        <div className="space-y-3 mt-2 p-4 border rounded-lg bg-muted/30">
                          {(['hyderabad', 'vizag', 'warangal'] as const).map((store) => (
                            <div key={store} className="flex items-center justify-between">
                              <span className="text-sm font-medium capitalize">{store === 'vizag' ? 'Visakhapatnam' : store}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs ${subcategoryStoreAvailability[store] ? 'text-green-600' : 'text-muted-foreground'}`}>
                                  {subcategoryStoreAvailability[store] ? 'ON' : 'OFF'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSubcategoryStoreAvailability({ ...subcategoryStoreAvailability, [store]: !subcategoryStoreAvailability[store] })}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    subcategoryStoreAvailability[store] ? 'bg-primary' : 'bg-muted'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      subcategoryStoreAvailability[store] ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={editingSubcategory ? handleUpdateSubcategory : handleAddSubcategory} 
                          className="bg-accent hover:bg-accent/90"
                        >
                          {editingSubcategory ? 'Update' : 'Add'} Subcategory
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {category.subcategories.map((subcategory) => (
                  <div 
                    key={subcategory.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={subcategory.image} 
                        alt={subcategory.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{subcategory.name}</p>
                      <p className="text-xs text-muted-foreground">{subcategory.productCount || 0} products</p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDuplicateSubcategory(subcategory, category.id)}
                        title="Duplicate Subcategory"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditSubcategory(subcategory, category.id)}
                        title="Edit Subcategory"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSubcategory(subcategory.id)}
                        title="Delete Subcategory"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
