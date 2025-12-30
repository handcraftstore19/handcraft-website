import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Image, Pencil, Trash2, Eye, EyeOff, GripVertical, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { carouselService } from '@/services/firestoreService';
import { uploadCarouselImage, deleteCarouselImage } from '@/services/storageService';

const AdminCarousels = () => {
  const [carousels, setCarousels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCarousels();
  }, []);

  const loadCarousels = async () => {
    try {
      setLoading(true);
      const allCarousels = await carouselService.getAll();
      setCarousels(allCarousels);
    } catch (error) {
      console.error('Error loading carousels:', error);
      toast({
        title: "Error",
        description: "Failed to load carousels from Firestore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title || !subtitle || (!imageUrl && !imageFile) || !link) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Subtitle, Image, and Link URL).",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalImageUrl = imageUrl;
      
      // Upload image to Firebase Storage if file is provided
      if (imageFile) {
        try {
          finalImageUrl = await uploadCarouselImage(imageFile, editingCarousel?.id);
        } catch (uploadError: any) {
          toast({
            title: "Image Upload Failed",
            description: uploadError.message || "Failed to upload image to Firebase Storage. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }

      // If editing and had a previous image in Storage, delete the old one
      if (isEditMode && editingCarousel && editingCarousel.image && 
          editingCarousel.image.startsWith('https://') && 
          editingCarousel.image !== finalImageUrl) {
        try {
          await deleteCarouselImage(editingCarousel.image);
        } catch (deleteError) {
          console.warn('Could not delete old carousel image:', deleteError);
          // Continue even if deletion fails
        }
      }

      const order = carousels.length > 0 
        ? Math.max(...carousels.map(c => c.order || 0)) + 1 
        : 1;

      if (isEditMode && editingCarousel) {
        await carouselService.update(editingCarousel.id, {
          title,
          subtitle,
          image: finalImageUrl,
          link,
          active: editingCarousel.active,
          order: editingCarousel.order,
        });
        toast({
          title: "Success",
          description: "Carousel updated successfully.",
        });
      } else {
        await carouselService.create({
          title,
          subtitle,
          image: finalImageUrl,
          link,
          active: true,
          order,
        });
        toast({
          title: "Success",
          description: "Carousel created successfully.",
        });
      }

      // Reset form
      setTitle('');
      setSubtitle('');
      setImageUrl('');
      setLink('');
      setImageFile(null);
      setIsEditMode(false);
      setEditingCarousel(null);
      setIsOpen(false);
      await loadCarousels();
    } catch (error: any) {
      console.error('Error saving carousel:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save carousel.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (carousel: any) => {
    setEditingCarousel(carousel);
    setTitle(carousel.title);
    setSubtitle(carousel.subtitle);
    setImageUrl(carousel.image);
    setLink(carousel.link);
    setImageFile(null);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleToggle = async (carouselId: string, currentActive: boolean) => {
    try {
      await carouselService.update(carouselId, { active: !currentActive });
      toast({
        title: "Success",
        description: "Carousel visibility updated.",
      });
      await loadCarousels();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update carousel.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (carouselId: string) => {
    if (!confirm('Are you sure you want to delete this carousel slide?')) {
      return;
    }

    try {
      // Get carousel to check if it has an image in Firebase Storage
      const carousel = carousels.find(c => c.id === carouselId);
      
      // Delete carousel from Firestore
      await carouselService.delete(carouselId);
      
      // Delete image from Firebase Storage if it exists
      if (carousel?.image && carousel.image.startsWith('https://')) {
        try {
          await deleteCarouselImage(carousel.image);
        } catch (deleteError) {
          console.warn('Could not delete carousel image from Storage:', deleteError);
          // Continue even if image deletion fails
        }
      }
      
      toast({
        title: "Success",
        description: "Carousel deleted successfully.",
      });
      await loadCarousels();
    } catch (error: any) {
      console.error('Error deleting carousel:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete carousel.",
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
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold">Carousels</h2>
          <p className="text-muted-foreground">Manage homepage carousels</p>
        </div>
        <Dialog 
          open={isOpen} 
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              // Reset form when dialog closes
              setTitle('');
              setSubtitle('');
              setImageUrl('');
              setLink('');
              setImageFile(null);
              setIsEditMode(false);
              setEditingCarousel(null);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />Add Slide
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit' : 'Add'} Carousel Slide</DialogTitle>
              <DialogDescription>
                {isEditMode ? 'Update' : 'Create'} a carousel slide for the homepage.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input 
                  placeholder="Slide title" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Subtitle *</Label>
                <Input 
                  placeholder="Slide subtitle" 
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Image *</Label>
                <Input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImageUrl('');
                    }
                  }}
                />
                {imageFile && (
                  <p className="text-xs text-muted-foreground mt-1">Selected: {imageFile.name}</p>
                )}
                <Input 
                  className="mt-2"
                  placeholder="Or enter image URL"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageFile(null);
                  }}
                />
                {imageUrl && !imageFile && (
                  <div className="mt-2">
                    <img src={imageUrl} alt="Preview" className="w-32 h-20 object-cover rounded" />
                  </div>
                )}
              </div>
              <div>
                <Label>Link URL *</Label>
                <Input 
                  placeholder="/category/1" 
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-accent">
                {isEditMode ? 'Update' : 'Add'} Slide
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {carousels.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No carousels found. Create your first carousel slide!
          </div>
        ) : (
          carousels.map(carousel => (
            <Card key={carousel.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4 items-center">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={carousel.image} 
                      alt={carousel.title} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{carousel.title}</p>
                    <p className="text-sm text-muted-foreground">{carousel.subtitle}</p>
                    <p className="text-xs text-accent">{carousel.link}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {carousel.active ? 'Visible' : 'Hidden'}
                      </span>
                      <Switch 
                        checked={carousel.active} 
                        onCheckedChange={() => handleToggle(carousel.id, carousel.active)}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(carousel)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDelete(carousel.id)}
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
  );
};

export default AdminCarousels;
