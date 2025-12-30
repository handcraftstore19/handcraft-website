import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2, Search, Package, Copy } from 'lucide-react';
import ProductFormWizard from './ProductFormWizard';
import { formatPrice, Product, StoreAvailability, Category } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';
import { productService, categoryService } from '@/services/firestoreService';
import { validateImageFile, formatFileSize } from '@/lib/imageCompressor';
import { uploadProductImage, deleteProductImage } from '@/services/storageService';
import { collection, query, where, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Helper function to update productCount in subcategory
const updateSubcategoryProductCount = async (categoryId: number, subcategoryId: number): Promise<void> => {
  try {
    // Get all products for this subcategory
    const q = query(
      collection(db, 'products'),
      where('categoryId', '==', categoryId),
      where('subcategoryId', '==', subcategoryId)
    );
    const snapshot = await getDocs(q);
    const productCount = snapshot.size;

    // Update subcategory productCount
    const subQ = query(
      collection(db, 'subcategories'),
      where('categoryId', '==', categoryId),
      where('id', '==', subcategoryId)
    );
    const subSnapshot = await getDocs(subQ);
    
    if (!subSnapshot.empty) {
      const subDocRef = subSnapshot.docs[0].ref;
      await updateDoc(subDocRef, {
        productCount,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating subcategory product count:', error);
  }
};

const tagOptions = [
  { value: 'best-seller', label: 'Best Seller', color: 'bg-green-100 text-green-800' },
  { value: 'new-arrival', label: 'New Arrival', color: 'bg-blue-100 text-blue-800' },
  { value: 'trending', label: 'Trending', color: 'bg-purple-100 text-purple-800' },
  { value: 'limited-edition', label: 'Limited Edition', color: 'bg-orange-100 text-orange-800' },
];

// All products now come from Firestore - no mock data fallback

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load products and categories from Firestore
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const firestoreCategories = await categoryService.getAll();
      setCategories(firestoreCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories from Firestore.",
        variant: "destructive",
      });
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const firestoreProducts = await productService.getAll();
      setProducts(firestoreProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products from Firestore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter products from Firestore
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = async (formData: any, imageFile: File | null, currentImageUrl?: string) => {
    try {
      let imageUrl = currentImageUrl || formData.image;

      // If a new image file is selected, upload it to Firebase Storage
      if (imageFile) {
        try {
          // Upload to Firebase Storage
          imageUrl = await uploadProductImage(imageFile, editingProduct?.id);
          
          // If updating and had a previous image, delete the old one from Storage
          if (editingProduct && editingProduct.image && editingProduct.image.startsWith('https://')) {
            try {
              await deleteProductImage(editingProduct.image);
            } catch (deleteError) {
              console.warn('Could not delete old image:', deleteError);
              // Continue even if deletion fails
            }
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast({
            title: "Image Upload Failed",
            description: "Failed to upload image to Firebase Storage. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      const productData: Omit<Product, 'id'> = {
        name: formData.name,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
        image: imageUrl, // Use Firebase Storage URL
        rating: formData.rating || 0,
        reviews: formData.reviews || 0,
        description: formData.description,
        features: formData.features.split('\n').filter((f: string) => f.trim()),
        tags: formData.tags,
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        subcategoryId: parseInt(formData.subcategoryId),
        availableAt: formData.availableAt || {
          hyderabad: true,
          vizag: false,
          warangal: false
        },
      };

      if (editingProduct) {
        // Check if category or subcategory changed
        const oldCategoryId = editingProduct.categoryId;
        const oldSubcategoryId = editingProduct.subcategoryId;
        const newCategoryId = parseInt(formData.categoryId);
        const newSubcategoryId = parseInt(formData.subcategoryId);
        
        await productService.update(editingProduct.id, productData);
        
        // Update counts for both old and new subcategories if changed
        if (oldCategoryId !== newCategoryId || oldSubcategoryId !== newSubcategoryId) {
          await updateSubcategoryProductCount(oldCategoryId, oldSubcategoryId);
          await updateSubcategoryProductCount(newCategoryId, newSubcategoryId);
        } else {
          await updateSubcategoryProductCount(newCategoryId, newSubcategoryId);
        }
        
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
      } else {
        await productService.create(productData);
        toast({
          title: "Product Created",
          description: "Product has been created successfully.",
        });
      }

      await loadProducts();
      setIsAddDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // Get product to check if it has an image in Firebase Storage
      const product = products.find(p => p.id === productId);
      
      // Delete product from Firestore
      await productService.delete(productId);
      
      // Delete image from Firebase Storage if it exists
      if (product?.image && product.image.startsWith('https://')) {
        try {
          await deleteProductImage(product.image);
        } catch (deleteError) {
          console.warn('Could not delete product image from Storage:', deleteError);
          // Continue even if image deletion fails
        }
      }

      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      });
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDuplicateProduct = async (product: Product) => {
    try {
      const productData: Omit<Product, 'id'> = {
        name: `${product.name} (Copy)`,
        price: product.price,
        discountPrice: product.discountPrice,
        image: product.image,
        rating: product.rating || 0,
        reviews: 0, // Reset reviews for duplicate
        description: product.description,
        features: product.features || [],
        tags: product.tags || [],
        stock: product.stock,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        availableAt: product.availableAt || {
          hyderabad: true,
          vizag: false,
          warangal: false
        },
      };

      await productService.create(productData);

      toast({
        title: "Success",
        description: "Product duplicated successfully.",
      });

      await loadProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate product.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            {isAddDialogOpen && (
              <ProductFormWizard
                categories={categories}
                onSave={handleSaveProduct}
                onClose={() => setIsAddDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.iconName ? (
                      <img src={cat.iconName} alt={cat.name} className="w-4 h-4 inline mr-2" />
                    ) : (
                      <span className="mr-2">📦</span>
                    )}
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const cat = categories.find(c => c.id === product.categoryId);
                              const subcat = cat?.subcategories.find(s => s.id === product.subcategoryId);
                              return subcat?.name || 'Unknown';
                            })()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        {product.discountPrice ? (
                          <>
                            <span className="font-medium text-foreground">{formatPrice(product.discountPrice)}</span>
                            <span className="text-xs text-muted-foreground line-through ml-1">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-foreground">{formatPrice(product.price)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${product.stock < 20 ? 'text-red-600' : 'text-foreground'}`}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.tags?.map(tag => {
                          const tagInfo = tagOptions.find(t => t.value === tag);
                          return (
                            <Badge key={tag} variant="secondary" className={tagInfo?.color}>
                              {tagInfo?.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDuplicateProduct(product)}
                          title="Duplicate Product"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => {
                          if (!open) {
                            setEditingProduct(null);
                          } else {
                            setEditingProduct(product);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} title="Edit Product">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            {editingProduct?.id === product.id && (
                              <ProductFormWizard
                                product={product}
                                categories={categories}
                                onSave={handleSaveProduct}
                                onClose={() => setEditingProduct(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProducts;
