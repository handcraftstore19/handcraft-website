import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Ticket, Percent, IndianRupee, Trash2, Loader2 } from 'lucide-react';
import { formatPrice } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';
import { couponService } from '@/services/firestoreService';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [couponType, setCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [couponCode, setCouponCode] = useState('');
  const [couponValue, setCouponValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [expiry, setExpiry] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const allCoupons = await couponService.getAll();
      setCoupons(allCoupons);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast({
        title: "Error",
        description: "Failed to load coupons from Firestore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!couponCode || !couponValue || !minOrder || !usageLimit || !expiry) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await couponService.create({
        code: couponCode.toUpperCase(),
        type: couponType,
        value: parseFloat(couponValue),
        minOrder: parseFloat(minOrder),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
        usageLimit: parseInt(usageLimit),
        active: true,
        expiry: expiry,
      });

      toast({
        title: "Success",
        description: "Coupon created successfully.",
      });

      // Reset form
      setCouponCode('');
      setCouponValue('');
      setMinOrder('');
      setMaxDiscount('');
      setUsageLimit('');
      setExpiry('');
      setIsOpen(false);
      await loadCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (couponId: string, currentActive: boolean) => {
    try {
      await couponService.update(couponId, { active: !currentActive });
      toast({
        title: "Success",
        description: "Coupon status updated.",
      });
      await loadCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await couponService.delete(couponId);
      toast({
        title: "Success",
        description: "Coupon deleted successfully.",
      });
      await loadCoupons();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon.",
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
          <h2 className="text-2xl font-serif font-bold">Coupons</h2>
          <p className="text-muted-foreground">Manage discount coupons</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Coupon</DialogTitle>
              <DialogDescription>Create a new discount coupon for your customers.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Coupon Code *</Label>
                <Input 
                  placeholder="e.g., SAVE20" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <Label>Type *</Label>
                <div className="flex gap-2 mt-2">
                  <Button 
                    type="button"
                    variant={couponType === 'percentage' ? 'default' : 'outline'} 
                    onClick={() => setCouponType('percentage')}
                  >
                    <Percent className="h-4 w-4 mr-1" />Percentage
                  </Button>
                  <Button 
                    type="button"
                    variant={couponType === 'flat' ? 'default' : 'outline'} 
                    onClick={() => setCouponType('flat')}
                  >
                    <IndianRupee className="h-4 w-4 mr-1" />Flat
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Value {couponType === 'percentage' ? '(%)' : '(₹)'} *</Label>
                  <Input 
                    type="number" 
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Min Order (₹) *</Label>
                  <Input 
                    type="number" 
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Max Discount (₹)</Label>
                  <Input 
                    type="number" 
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Usage Limit *</Label>
                  <Input 
                    type="number" 
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Expiry Date *</Label>
                <Input 
                  type="date" 
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-accent">Create Coupon</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No coupons found. Create your first coupon!
          </div>
        ) : (
          coupons.map(coupon => (
            <Card key={coupon.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {coupon.type === 'percentage' ? (
                      <Percent className="h-5 w-5 text-accent" />
                    ) : (
                      <IndianRupee className="h-5 w-5 text-accent" />
                    )}
                    <span className="font-bold text-lg">{coupon.code}</span>
                  </div>
                  <Badge variant={coupon.active ? 'default' : 'secondary'}>
                    {coupon.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-accent mb-2">
                  {coupon.type === 'percentage' ? `${coupon.value}% OFF` : formatPrice(coupon.value) + ' OFF'}
                </p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Min Order: {formatPrice(coupon.minOrder)}</p>
                  <p>Used: {coupon.used || 0}/{coupon.usageLimit}</p>
                  <p>Expires: {coupon.expiry}</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <Switch 
                    checked={coupon.active} 
                    onCheckedChange={() => handleToggleActive(coupon.id, coupon.active)}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
