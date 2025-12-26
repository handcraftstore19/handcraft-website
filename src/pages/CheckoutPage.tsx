import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { CreditCard, MapPin, Phone, Mail, User, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/data/categories';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'billing' | 'payment' | 'confirmation'>('billing');
  const [loading, setLoading] = useState(false);
  
  // Billing form state
  const [billingData, setBillingData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [paymentCode, setPaymentCode] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const subtotal = getTotal();
  const shipping = subtotal > 5000 ? 0 : 100;
  const total = subtotal + shipping;

  const handleBillingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // For online payment, show payment form first
    if (paymentMethod === 'online' && !showPaymentForm) {
      setShowPaymentForm(true);
      return;
    }

    // For online payment, verify payment code before placing order
    if (paymentMethod === 'online' && showPaymentForm) {
      if (paymentCode !== 'RAZORPAY2024') {
        toast({
          title: "Invalid Payment Code",
          description: "Please enter the correct Razorpay payment confirmation code.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    
    try {
      // Create order in Firestore
      const orderData = {
        userId: user.id,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        billing: billingData,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentCode: paymentMethod === 'online' ? paymentCode : null,
        subtotal,
        shipping,
        total,
        status: paymentMethod === 'cod' ? 'pending' : 'processing',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Clear cart
      clearCart();
      
      // Show success
      toast({
        title: "Order Placed!",
        description: `Your order #${orderRef.id} has been placed successfully.`,
      });

      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderRef.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step === 'billing') {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {step === 'billing' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Billing & Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBillingSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={billingData.fullName}
                            onChange={(e) => setBillingData({ ...billingData, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={billingData.email}
                            onChange={(e) => setBillingData({ ...billingData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={billingData.phone}
                            onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            value={billingData.pincode}
                            onChange={(e) => setBillingData({ ...billingData, pincode: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address *</Label>
                        <Textarea
                          id="address"
                          value={billingData.address}
                          onChange={(e) => setBillingData({ ...billingData, address: e.target.value })}
                          required
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={billingData.city}
                            onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={billingData.state}
                            onChange={(e) => setBillingData({ ...billingData, state: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="landmark">Landmark (Optional)</Label>
                        <Input
                          id="landmark"
                          value={billingData.landmark}
                          onChange={(e) => setBillingData({ ...billingData, landmark: e.target.value })}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Continue to Payment
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!showPaymentForm ? (
                      <>
                        <RadioGroup 
                          value={paymentMethod} 
                          onValueChange={(value: 'cod' | 'online') => {
                            setPaymentMethod(value);
                            setShowPaymentForm(false);
                          }}
                        >
                          <div className="flex items-center space-x-2 p-4 border rounded-lg">
                            <RadioGroupItem value="cod" id="cod" />
                            <Label htmlFor="cod" className="flex-1 cursor-pointer">
                              <div>
                                <p className="font-semibold">Cash on Delivery</p>
                                <p className="text-sm text-muted-foreground">Pay when you receive</p>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-4 border rounded-lg">
                            <RadioGroupItem value="online" id="online" />
                            <Label htmlFor="online" className="flex-1 cursor-pointer">
                              <div>
                                <p className="font-semibold">Online Payment (Razorpay)</p>
                                <p className="text-sm text-muted-foreground">Credit/Debit Card, UPI, Net Banking</p>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>

                        <Separator />

                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setStep('billing')} className="flex-1">
                            Back
                          </Button>
                          <Button onClick={handlePlaceOrder} disabled={loading} className="flex-1">
                            {loading ? 'Placing Order...' : paymentMethod === 'online' ? 'Proceed to Payment' : 'Place Order'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 mb-2">
                            <strong>Demo Payment:</strong> Enter the Razorpay payment confirmation code to complete your order.
                          </p>
                          <p className="text-xs text-blue-600 font-mono">
                            Use code: <strong>RAZORPAY2024</strong>
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paymentCode">Payment Confirmation Code *</Label>
                          <Input
                            id="paymentCode"
                            placeholder="Enter Razorpay payment code"
                            value={paymentCode}
                            onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
                            className="font-mono"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter the unique code provided by Razorpay after successful payment
                          </p>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setShowPaymentForm(false);
                              setPaymentCode('');
                            }} 
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button onClick={handlePlaceOrder} disabled={loading || !paymentCode.trim()} className="flex-1">
                            {loading ? 'Placing Order...' : 'Confirm & Place Order'}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-2 text-sm">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <p className="font-medium line-clamp-2">{item.name}</p>
                          <p className="text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="font-semibold">{formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? 'Free' : formatPrice(shipping)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;

