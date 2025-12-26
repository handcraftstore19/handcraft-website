import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, ShoppingBag, Package, LogOut, User as UserIcon, Star } from 'lucide-react';
import { Product } from '@/data/categories';

// Mock orders data
const mockOrders = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 7499,
    items: [
      { id: 1001, name: 'Golden Champion Trophy', quantity: 1, price: 7499 }
    ]
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    status: 'processing',
    total: 12999,
    items: [
      { id: 5001, name: 'Abstract Canvas Art', quantity: 1, price: 12999 }
    ]
  },
  {
    id: 'ORD-003',
    date: '2024-01-05',
    status: 'shipped',
    total: 4599,
    items: [
      { id: 1004, name: 'Scholar Excellence Award', quantity: 1, price: 4599 }
    ]
  }
];

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'wishlist');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'wishlist' || tab === 'orders') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-600';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-600';
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-600';
      default:
        return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Profile Header */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist ({wishlist.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders ({mockOrders.length})
              </TabsTrigger>
            </TabsList>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist" className="mt-6">
              {wishlist.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h3>
                    <p className="text-muted-foreground mb-4">Start adding products you love!</p>
                    <Button asChild>
                      <Link to="/">Browse Products</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlist.map((product) => (
                    <Card key={product.id} className="group">
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </Link>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link to={`/product/${product.id}`}>
                              <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                                {product.name}
                              </CardTitle>
                            </Link>
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm font-medium">{product.rating}</span>
                              <span className="text-sm text-muted-foreground">({product.reviews})</span>
                            </div>
                            <p className="text-xl font-semibold text-foreground">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => removeFromWishlist(product.id)}
                        >
                          <Heart className="h-4 w-4 mr-2 fill-primary text-primary" />
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              {mockOrders.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">Start shopping to see your orders here!</p>
                    <Button asChild>
                      <Link to="/">Start Shopping</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">Order {order.id}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-foreground">
                              ${order.total.toFixed(2)}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div>
                                <p className="font-medium text-foreground">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium text-foreground">${item.price.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t flex gap-2">
                          <Button variant="outline" className="flex-1">
                            View Details
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" className="flex-1">
                              Reorder
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;

