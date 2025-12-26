import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, Search, MapPin, Clock, CheckCircle, Truck, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/data/categories';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast({
        title: "Error",
        description: "Please enter an order ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Try to get order from Firestore
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      
      if (orderDoc.exists()) {
        const orderData = orderDoc.data();
        setOrder({
          id: orderDoc.id,
          ...orderData,
          createdAt: orderData.createdAt?.toDate?.() || new Date(orderData.date || Date.now()),
        });
      } else {
        // Fallback to mock data for demo
        setOrder({
          id: orderId,
          status: 'shipped',
          total: 7499,
          items: [{ id: 1001, name: 'Golden Champion Trophy', quantity: 1, price: 7499 }],
          date: new Date().toISOString(),
          billing: {
            fullName: 'John Doe',
            address: '123 Main St',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500001',
          },
        });
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Error",
        description: "Failed to track order. Please check the order ID.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: Package },
      { key: 'processing', label: 'Processing', icon: Clock },
      { key: 'shipped', label: 'Shipped', icon: Truck },
      { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const statusIndex = steps.findIndex(s => s.key === status);
    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= statusIndex,
      current: idx === statusIndex,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'pending':
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
              <p className="text-muted-foreground text-lg">
                Enter your order ID to track the status of your shipment
              </p>
            </div>

            {/* Track Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Enter Order ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTrack} className="flex gap-4">
                  <div className="flex-1">
                    <Label htmlFor="orderId" className="sr-only">Order ID</Label>
                    <Input
                      id="orderId"
                      placeholder="Enter your order ID (e.g., ORD-001)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Tracking...' : 'Track Order'}
                  </Button>
                </form>
                {isAuthenticated && (
                  <div className="mt-4">
                    <Button variant="link" onClick={() => navigate('/profile?tab=orders')}>
                      View all your orders
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            {order && (
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Order #{order.id}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed on {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Order Items</h3>
                        <div className="space-y-2">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                                )}
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Quantity: {item.quantity} × {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total Amount</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tracking Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {getStatusSteps(order.status).map((step, idx) => {
                        const Icon = step.icon;
                        return (
                          <div key={idx} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                step.completed
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                <Icon className="h-6 w-6" />
                              </div>
                              {idx < getStatusSteps(order.status).length - 1 && (
                                <div className={`w-0.5 h-12 ml-6 ${
                                  step.completed ? 'bg-primary' : 'bg-border'
                                }`}></div>
                              )}
                            </div>
                            <div className="flex-1 pb-6">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{step.label}</h3>
                                {step.current && (
                                  <Badge variant="outline" className="text-xs">Current</Badge>
                                )}
                                {step.completed && !step.current && (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                              {step.completed && (
                                <p className="text-sm text-muted-foreground">
                                  {step.key === 'delivered' 
                                    ? 'Your order has been delivered successfully'
                                    : step.key === 'shipped'
                                    ? 'Your order is on its way'
                                    : step.key === 'processing'
                                    ? 'We\'re preparing your order'
                                    : 'Order confirmed'}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                {order.billing && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <p className="font-semibold">{order.billing.fullName}</p>
                        <p className="text-muted-foreground">{order.billing.phone}</p>
                        <p className="text-muted-foreground">
                          {order.billing.address}, {order.billing.city}, {order.billing.state} - {order.billing.pincode}
                        </p>
                        {order.billing.landmark && (
                          <p className="text-muted-foreground">Landmark: {order.billing.landmark}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      {isAuthenticated && (
                        <Button variant="outline" onClick={() => navigate('/profile?tab=orders')} className="flex-1">
                          View All Orders
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => navigate('/contact-us')} className="flex-1">
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Help Section */}
            {!order && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
                  <p className="text-muted-foreground mb-4">
                    Can't find your order ID? Check your email or contact our support team.
                  </p>
                  <div className="flex gap-4 justify-center">
                    {isAuthenticated ? (
                      <Button onClick={() => navigate('/profile?tab=orders')}>
                        View My Orders
                      </Button>
                    ) : (
                      <Button onClick={() => navigate('/login')}>
                        Login to View Orders
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate('/contact-us')}>
                      Contact Support
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TrackOrderPage;

