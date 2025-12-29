import { useState, useEffect } from 'react';
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
import { Plus, Pencil, Trash2, Search, Package, Upload, X, Copy } from 'lucide-react';
import { formatPrice, Product, StoreAvailability, Category } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';
import { productService, categoryService } from '@/services/firestoreService';
import { validateImageFile, formatFileSize } from '@/lib/imageCompressor';
import { uploadProductImage, deleteProductImage } from '@/services/storageService';

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
        await productService.update(editingProduct.id, productData);
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

  const ProductForm = ({ product }: { product?: Product | null }) => {
    // Form state - all controlled inputs
    // Initialize with product values or defaults, but don't reset on re-renders
    const [productName, setProductName] = useState(() => product?.name || '');
    const [productPrice, setProductPrice] = useState(() => product?.price?.toString() || '0');
    const [productDiscountPrice, setProductDiscountPrice] = useState(() => product?.discountPrice?.toString() || '');
    const [productStock, setProductStock] = useState(() => product?.stock?.toString() || '0');
    const [productDescription, setProductDescription] = useState(() => product?.description || '');
    const [productFeatures, setProductFeatures] = useState(() => product?.features?.join('\n') || '');
    const [formCategory, setFormCategory] = useState(() => product?.categoryId?.toString() || '');
    const [formSubcategory, setFormSubcategory] = useState(() => product?.subcategoryId?.toString() || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(() => product?.tags || []);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(() => product?.image || '');
    const [imageUrl, setImageUrl] = useState<string>(() => product?.image || '');
    const [compressing, setCompressing] = useState(false);
    const [storeAvailability, setStoreAvailability] = useState<StoreAvailability>(() =>
      product?.availableAt || {
        hyderabad: true,
        vizag: false,
        warangal: false
      }
    );

    // Track the product ID to detect when we're switching products
    const prevProductIdRef = useRef<number | string | undefined | null>(product?.id);
    
    // Only update form when product ID actually changes (switching between products)
    // This prevents resets when uploading images or other re-renders
    useEffect(() => {
      const currentProductId = product?.id;
      const prevProductId = prevProductIdRef.current;
      
      // Only update if product ID actually changed (not just a re-render)
      if (currentProductId !== prevProductId) {
        prevProductIdRef.current = currentProductId;
        
        // Only update form if we have a product (edit mode)
        // For new products (product is undefined), keep user's input
        if (product) {
          setProductName(product.name || '');
          setProductPrice(product.price?.toString() || '0');
          setProductDiscountPrice(product.discountPrice?.toString() || '');
          setProductStock(product.stock?.toString() || '0');
          setProductDescription(product.description || '');
          setProductFeatures(product.features?.join('\n') || '');
          setFormCategory(product.categoryId?.toString() || '');
          setFormSubcategory(product.subcategoryId?.toString() || '');
          setSelectedTags(product.tags || []);
          setImagePreview(product.image || '');
          setImageUrl(product.image || '');
          setStoreAvailability(product.availableAt || {
            hyderabad: true,
            vizag: false,
            warangal: false
          });
        }
        // If product is undefined (new product), don't reset - preserve user input
      }
    }, [product?.id, product]); // Depend on both ID and product to catch changes

    const selectedCategoryData = categories.find(c => c.id.toString() === formCategory);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast({
          title: "Invalid Image",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      setCompressing(true);

      try {
        // Create a preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);

        toast({
          title: "Image Selected",
          description: "Image will be uploaded to Firebase Storage when you save the product.",
        });
      } catch (error) {
        console.error('Error processing image:', error);
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setCompressing(false);
      }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = {
        name: productName,
        price: productPrice,
        discountPrice: productDiscountPrice,
        stock: productStock,
        image: imagePreview || imageUrl,
        description: productDescription,
        features: productFeatures,
        tags: selectedTags,
        categoryId: formCategory,
        subcategoryId: formSubcategory,
        availableAt: storeAvailability,
      };
      handleSaveProduct(formData, imageFile, product?.image);
    };

    return (
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Product Name</Label>
              <Input 
                id="name" 
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name" 
                required 
              />
            </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formCategory} onValueChange={setFormCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subcategory">Subcategory</Label>
            <Select value={formSubcategory} onValueChange={setFormSubcategory} disabled={!formCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select subcategory" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategoryData?.subcategories.map(sub => (
                  <SelectItem key={sub.id} value={sub.id.toString()}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">Price (₹)</Label>
            <Input 
              id="price" 
              type="number" 
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="0" 
            />
          </div>

          <div>
            <Label htmlFor="discountPrice">Discount Price (₹)</Label>
            <Input 
              id="discountPrice" 
              type="number" 
              value={productDiscountPrice}
              onChange={(e) => setProductDiscountPrice(e.target.value)}
              placeholder="Optional" 
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input 
              id="stock" 
              type="number" 
              value={productStock}
              onChange={(e) => setProductStock(e.target.value)}
              placeholder="0" 
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="space-y-2">
              {imagePreview && (
                <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <Label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted"
                >
                  <Upload className="h-4 w-4" />
                  {compressing ? 'Compressing...' : imageFile ? 'Change Image' : 'Upload Image'}
                </Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={compressing}
                  className="hidden"
                />
                {!imagePreview && (
                  <Input
                    id="image-url"
                    placeholder="Or enter image URL"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload an image (max 1MB) or enter an image URL
              </p>
            </div>
          </div>

          <div className="col-span-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {tagOptions.map(tag => (
                <label
                  key={tag.value}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer border transition-all
                    ${selectedTags.includes(tag.value) 
                      ? `${tag.color} border-transparent` 
                      : 'bg-muted border-border hover:bg-muted/80'
                    }
                  `}
                >
                  <Checkbox
                    checked={selectedTags.includes(tag.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTags([...selectedTags, tag.value]);
                      } else {
                        setSelectedTags(selectedTags.filter(t => t !== tag.value));
                      }
                    }}
                    className="hidden"
                  />
                  <span className="text-sm">{tag.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              defaultValue={product?.description} 
              placeholder="Product description..."
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea 
              id="features" 
              value={productFeatures}
              onChange={(e) => setProductFeatures(e.target.value)}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              rows={4}
            />
          </div>

          <div className="col-span-2">
            <Label>Product Available At Stores</Label>
            <div className="space-y-3 mt-2 p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Hyderabad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${storeAvailability.hyderabad ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {storeAvailability.hyderabad ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStoreAvailability({ ...storeAvailability, hyderabad: !storeAvailability.hyderabad })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      storeAvailability.hyderabad ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        storeAvailability.hyderabad ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Visakhapatnam</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${storeAvailability.vizag ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {storeAvailability.vizag ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStoreAvailability({ ...storeAvailability, vizag: !storeAvailability.vizag })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      storeAvailability.vizag ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        storeAvailability.vizag ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Warangal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${storeAvailability.warangal ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {storeAvailability.warangal ? 'ON' : 'OFF'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStoreAvailability({ ...storeAvailability, warangal: !storeAvailability.warangal })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      storeAvailability.warangal ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        storeAvailability.warangal ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setEditingProduct(null);
                setImagePreview('');
                setImageFile(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              {product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </div>
      </form>
    );
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
            {isAddDialogOpen && <ProductForm key="add-product" />}
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
                    {cat.icon} {cat.name}
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
                          <p className="text-xs text-muted-foreground">{product.subcategoryName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{product.categoryName}</span>
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} title="Edit Product">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            {editingProduct?.id === product.id && <ProductForm key={`edit-product-${product.id}`} product={product} />}
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
