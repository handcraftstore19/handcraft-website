import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, FolderTree, Image as ImageIcon } from 'lucide-react';
import { categories } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';

const AdminCategories = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { toast } = useToast();

  const handleSaveCategory = () => {
    toast({
      title: "Category Saved",
      description: "Category has been saved. Firebase integration pending.",
    });
    setIsAddDialogOpen(false);
  };

  const handleSaveSubcategory = () => {
    toast({
      title: "Subcategory Saved",
      description: "Subcategory has been saved. Firebase integration pending.",
    });
    setIsSubcategoryDialogOpen(false);
  };

  const handleDelete = (type: 'category' | 'subcategory', id: number) => {
    toast({
      title: `${type === 'category' ? 'Category' : 'Subcategory'} Deleted`,
      description: "Firebase integration pending.",
    });
  };

  const getTotalProducts = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.subcategories.reduce((sum, sub) => sum + sub.products.length, 0) || 0;
  };

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="catName">Category Name</Label>
                <Input id="catName" placeholder="Enter category name" />
              </div>
              <div>
                <Label htmlFor="catIcon">Icon (Emoji)</Label>
                <Input id="catIcon" placeholder="🏆" />
              </div>
              <div>
                <Label htmlFor="catImage">Cover Image URL</Label>
                <Input id="catImage" placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="catDesc">Description</Label>
                <Input id="catDesc" placeholder="Category description" />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory} className="bg-accent hover:bg-accent/90">
                  Add Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                      <span className="text-2xl">{category.icon}</span>
                      {category.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {category.subcategories.length} subcategories
                      </span>
                      <span className="text-muted-foreground">
                        {getTotalProducts(category.id)} products
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete('category', category.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Subcategories
                </h4>
                <Dialog 
                  open={isSubcategoryDialogOpen && selectedCategoryId === category.id} 
                  onOpenChange={(open) => {
                    setIsSubcategoryDialogOpen(open);
                    if (open) setSelectedCategoryId(category.id);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Subcategory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Subcategory to {category.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subName">Subcategory Name</Label>
                        <Input id="subName" placeholder="Enter subcategory name" />
                      </div>
                      <div>
                        <Label htmlFor="subImage">Cover Image URL</Label>
                        <Input id="subImage" placeholder="https://..." />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSubcategory} className="bg-accent hover:bg-accent/90">
                          Add Subcategory
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
                      <p className="text-xs text-muted-foreground">{subcategory.products.length} products</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete('subcategory', subcategory.id)}
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
