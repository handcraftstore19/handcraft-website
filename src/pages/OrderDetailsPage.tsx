import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Phone, Mail, Calendar, Truck, CheckCircle, Clock, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/data/categories';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircle;
      case 'shipped':
      case 'out_for_delivery':
        return Truck;
      case 'processing':
        return Clock;
      default:
        return Package;
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
                <p className="text-muted-foreground">Loading order details...</p>
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

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Order Details</h1>
                <p className="text-muted-foreground">Order #{order.id}</p>
              </div>
              <Button variant="outline" onClick={() => navigate('/profile?tab=orders')}>
                Back to Orders
              </Button>
            </div>

            {/* Order Status */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${getStatusColor(order.status)}`}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Order Status</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p className="font-semibold">
                      {order.createdAt.toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Items */}
                <Card>
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
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{item.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Quantity: {item.quantity} × {formatPrice(item.price)}
                            </p>
                            <p className="font-semibold text-lg">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
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
                      <div className="space-y-2">
                        <p className="font-semibold">{order.billing.fullName}</p>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{order.billing.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-1" />
                          <div>
                            <p>{order.billing.address}</p>
                            {order.billing.landmark && <p>Landmark: {order.billing.landmark}</p>}
                            <p>
                              {order.billing.city}, {order.billing.state} - {order.billing.pincode}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {order.shipping === 0 ? 'Free' : formatPrice(order.shipping || 0)}
                      </span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatPrice(order.total || 0)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method</span>
                      <span className="font-medium capitalize">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status</span>
                      <Badge variant={order.paymentMethod === 'cod' ? 'outline' : 'default'}>
                        {order.paymentMethod === 'cod' ? 'Pending' : 'Paid'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/track-order?orderId=${order.id}`)}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Track Order
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" className="w-full">
                          Download Invoice
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderDetailsPage;

