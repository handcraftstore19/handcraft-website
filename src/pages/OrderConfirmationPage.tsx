import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/data/categories';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Unique payment confirmation code (simulating Razorpay)
const PAYMENT_CONFIRMATION_CODE = 'RAZORPAY2024';

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentCode, setPaymentCode] = useState('');
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/profile?tab=orders');
      return;
    }

    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          
          // Check if user owns this order
          if (user && orderData.userId !== user.id) {
            toast({
              title: "Access Denied",
              description: "You don't have permission to view this order.",
              variant: "destructive",
            });
            navigate('/profile?tab=orders');
            return;
          }

          setOrder({
            id: orderDoc.id,
            ...orderData,
            createdAt: orderData.createdAt?.toDate?.() || new Date(orderData.date || Date.now()),
          });

          // Check if payment is already verified
          if (orderData.paymentStatus === 'paid' || orderData.paymentMethod === 'cod') {
            setPaymentVerified(true);
          }
        } else {
          toast({
            title: "Order Not Found",
            description: "The order you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate('/profile?tab=orders');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Error",
          description: "Failed to load order details.",
          variant: "destructive",
        });
        navigate('/profile?tab=orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user, navigate, toast]);

  const handlePaymentVerification = async () => {
    if (!paymentCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the payment confirmation code.",
        variant: "destructive",
      });
      return;
    }

    if (paymentCode !== PAYMENT_CONFIRMATION_CODE) {
      toast({
        title: "Invalid Code",
        description: "The payment confirmation code is incorrect. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setVerifyingPayment(true);
    try {
      // Update order payment status in Firestore
      await updateDoc(doc(db, 'orders', orderId!), {
        paymentStatus: 'paid',
        paymentVerifiedAt: new Date(),
        status: 'processing',
      });

      setPaymentVerified(true);
      setOrder((prev: any) => ({
        ...prev,
        paymentStatus: 'paid',
        status: 'processing',
      }));

      toast({
        title: "Payment Verified!",
        description: "Your payment has been confirmed successfully.",
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Failed to verify payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
                <p className="text-muted-foreground">Loading order confirmation...</p>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const needsPaymentVerification = order.paymentMethod === 'online' && !paymentVerified;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <Card className="mb-6 border-green-200 bg-green-50/50">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-green-700">Order Placed Successfully!</h1>
                <p className="text-muted-foreground mb-4">
                  Your order #{order.id} has been placed successfully.
                </p>
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to {order.billing?.email || 'your email'}
                </p>
              </CardContent>
            </Card>

            {/* Payment Verification (for online payments) */}
            {needsPaymentVerification && (
              <Card className="mb-6 border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Verify Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-yellow-800 mb-1">Payment Verification Required</p>
                        <p className="text-sm text-yellow-700">
                          To complete your order, please enter the Razorpay payment confirmation code.
                        </p>
                        <p className="text-xs text-yellow-600 mt-2 font-mono">
                          Demo Code: <strong>{PAYMENT_CONFIRMATION_CODE}</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentCode">Payment Confirmation Code</Label>
                    <Input
                      id="paymentCode"
                      placeholder="Enter payment confirmation code"
                      value={paymentCode}
                      onChange={(e) => setPaymentCode(e.target.value.toUpperCase())}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the unique code provided by Razorpay after payment
                    </p>
                  </div>

                  <Button
                    onClick={handlePaymentVerification}
                    disabled={verifyingPayment || !paymentCode.trim()}
                    className="w-full"
                  >
                    {verifyingPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify Payment
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Order ID</span>
                    <span className="font-mono font-semibold">#{order.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Order Date</span>
                    <span className="font-medium">
                      {order.createdAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Method</span>
                    <Badge variant="outline" className="capitalize">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Status</span>
                    <Badge variant={paymentVerified || order.paymentMethod === 'cod' ? 'default' : 'destructive'}>
                      {paymentVerified || order.paymentMethod === 'cod' ? 'Confirmed' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>{formatPrice(order.total || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" asChild>
                <Link to={`/order/${order.id}`}>View Order Details</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link to="/">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;

