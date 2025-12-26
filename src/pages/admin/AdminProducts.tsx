import { useState } from 'react';
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
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react';
import { categories, formatPrice, Product } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';

const tagOptions = [
  { value: 'best-seller', label: 'Best Seller', color: 'bg-green-100 text-green-800' },
  { value: 'new-arrival', label: 'New Arrival', color: 'bg-blue-100 text-blue-800' },
  { value: 'trending', label: 'Trending', color: 'bg-purple-100 text-purple-800' },
  { value: 'limited-edition', label: 'Limited Edition', color: 'bg-orange-100 text-orange-800' },
];

// Flatten all products for display
const getAllProducts = () => {
  const products: (Product & { categoryName: string; subcategoryName: string })[] = [];
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.products.forEach(product => {
        products.push({
          ...product,
          categoryName: category.name,
          subcategoryName: subcategory.name
        });
      });
    });
  });
  return products;
};

const AdminProducts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const allProducts = getAllProducts();
  
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = () => {
    toast({
      title: "Product Saved",
      description: "Product has been saved successfully. Firebase integration pending.",
    });
    setIsAddDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: number) => {
    toast({
      title: "Product Deleted",
      description: "Product has been deleted. Firebase integration pending.",
    });
  };

  const ProductForm = ({ product }: { product?: Product | null }) => {
    const [formCategory, setFormCategory] = useState(product?.categoryId?.toString() || '');
    const [formSubcategory, setFormSubcategory] = useState(product?.subcategoryId?.toString() || '');
    const [selectedTags, setSelectedTags] = useState<string[]>(product?.tags || []);

    const selectedCategoryData = categories.find(c => c.id.toString() === formCategory);

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" defaultValue={product?.name} placeholder="Enter product name" />
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
            <Input id="price" type="number" defaultValue={product?.price} placeholder="0" />
          </div>

          <div>
            <Label htmlFor="discountPrice">Discount Price (₹)</Label>
            <Input id="discountPrice" type="number" defaultValue={product?.discountPrice} placeholder="Optional" />
          </div>

          <div>
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input id="stock" type="number" defaultValue={product?.stock} placeholder="0" />
          </div>

          <div>
            <Label htmlFor="image">Image URL</Label>
            <Input id="image" defaultValue={product?.image} placeholder="https://..." />
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
              defaultValue={product?.features?.join('\n')} 
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => {
            setIsAddDialogOpen(false);
            setEditingProduct(null);
          }}>
            Cancel
          </Button>
          <Button onClick={handleSaveProduct} className="bg-accent hover:bg-accent/90">
            {product ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </div>
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
            <ProductForm />
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
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm product={product} />
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteProduct(product.id)}
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
