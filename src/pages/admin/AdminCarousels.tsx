import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Image, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockCarousels = [
  { id: 1, title: 'Trophy Collection', subtitle: 'Premium Awards', image: '/assets/images/trophies_carousel.png', link: '/category/1', active: true, order: 1 },
  { id: 2, title: 'Momentos', subtitle: 'Memorable Gifts', image: '/assets/images/momentos_carousel.png', link: '/category/3', active: true, order: 2 },
  { id: 3, title: 'Home Decor', subtitle: 'Elegant Pieces', image: '/assets/images/decor_carousel.png', link: '/category/4', active: false, order: 3 },
];

const AdminCarousels = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = () => { toast({ title: "Carousel Saved", description: "Firebase integration pending." }); setIsOpen(false); };
  const handleToggle = (id: number) => { toast({ title: "Carousel Updated", description: "Visibility changed." }); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div><h2 className="text-2xl font-serif font-bold">Carousels</h2><p className="text-muted-foreground">Manage homepage carousels</p></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button className="bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-2" />Add Slide</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Carousel Slide</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input placeholder="Slide title" /></div>
              <div><Label>Subtitle</Label><Input placeholder="Slide subtitle" /></div>
              <div><Label>Image URL</Label><Input placeholder="https://..." /></div>
              <div><Label>Link URL</Label><Input placeholder="/category/1" /></div>
              <Button onClick={handleSave} className="w-full bg-accent">Add Slide</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {mockCarousels.map(carousel => (
          <Card key={carousel.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-center">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-muted"><img src={carousel.image} alt={carousel.title} className="w-full h-full object-cover" /></div>
                <div className="flex-1"><p className="font-medium">{carousel.title}</p><p className="text-sm text-muted-foreground">{carousel.subtitle}</p><p className="text-xs text-accent">{carousel.link}</p></div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">{carousel.active ? 'Visible' : 'Hidden'}</span><Switch checked={carousel.active} onCheckedChange={() => handleToggle(carousel.id)} /></div>
                  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCarousels;
