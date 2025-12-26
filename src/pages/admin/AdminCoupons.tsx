import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Ticket, Percent, IndianRupee, Trash2 } from 'lucide-react';
import { formatPrice } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';

const mockCoupons = [
  { id: 1, code: 'WELCOME20', type: 'percentage', value: 20, minOrder: 1000, maxDiscount: 500, usageLimit: 100, used: 45, active: true, expiry: '2024-03-31' },
  { id: 2, code: 'FLAT500', type: 'flat', value: 500, minOrder: 2500, maxDiscount: 500, usageLimit: 50, used: 12, active: true, expiry: '2024-02-28' },
  { id: 3, code: 'TROPHY10', type: 'percentage', value: 10, minOrder: 500, maxDiscount: 300, usageLimit: 200, used: 89, active: false, expiry: '2024-01-31' },
];

const AdminCoupons = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [couponType, setCouponType] = useState<'percentage' | 'flat'>('percentage');
  const { toast } = useToast();

  const handleSave = () => { toast({ title: "Coupon Saved", description: "Firebase integration pending." }); setIsOpen(false); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div><h2 className="text-2xl font-serif font-bold">Coupons</h2><p className="text-muted-foreground">Manage discount coupons</p></div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild><Button className="bg-accent hover:bg-accent/90"><Plus className="h-4 w-4 mr-2" />Add Coupon</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Coupon</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Coupon Code</Label><Input placeholder="e.g., SAVE20" /></div>
              <div><Label>Type</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant={couponType === 'percentage' ? 'default' : 'outline'} onClick={() => setCouponType('percentage')}><Percent className="h-4 w-4 mr-1" />Percentage</Button>
                  <Button variant={couponType === 'flat' ? 'default' : 'outline'} onClick={() => setCouponType('flat')}><IndianRupee className="h-4 w-4 mr-1" />Flat</Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Value {couponType === 'percentage' ? '(%)' : '(₹)'}</Label><Input type="number" /></div>
                <div><Label>Min Order (₹)</Label><Input type="number" /></div>
                <div><Label>Max Discount (₹)</Label><Input type="number" /></div>
                <div><Label>Usage Limit</Label><Input type="number" /></div>
              </div>
              <div><Label>Expiry Date</Label><Input type="date" /></div>
              <Button onClick={handleSave} className="w-full bg-accent">Create Coupon</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockCoupons.map(coupon => (
          <Card key={coupon.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {coupon.type === 'percentage' ? <Percent className="h-5 w-5 text-accent" /> : <IndianRupee className="h-5 w-5 text-accent" />}
                  <span className="font-bold text-lg">{coupon.code}</span>
                </div>
                <Badge variant={coupon.active ? 'default' : 'secondary'}>{coupon.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <p className="text-2xl font-bold text-accent mb-2">{coupon.type === 'percentage' ? `${coupon.value}% OFF` : formatPrice(coupon.value) + ' OFF'}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Min Order: {formatPrice(coupon.minOrder)}</p>
                <p>Used: {coupon.used}/{coupon.usageLimit}</p>
                <p>Expires: {coupon.expiry}</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <Switch checked={coupon.active} />
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminCoupons;
