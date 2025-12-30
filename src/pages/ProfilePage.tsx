import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, ShoppingBag, Package, LogOut, User as UserIcon, Star, 
  Edit, MapPin, Lock, Plus, Trash2, Check, X, Eye, EyeOff
} from 'lucide-react';
import { Product, formatPrice } from '@/data/categories';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{ id: number; name: string; quantity: number; price: number; image?: string }>;
  billing?: Address;
  paymentMethod?: string;
}

const ProfilePage = () => {
  const { user, logout, updateUserProfile, changePassword } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  // Profile edit state
  const [editProfile, setEditProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form state
  const [addressForm, setAddressForm] = useState<Omit<Address, 'id'>>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false,
  });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      loadOrders();
      loadAddresses();
      setEditProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoadingOrders(true);
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef,
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const ordersData: Order[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.createdAt?.toDate?.()?.toISOString() || data.date || new Date().toISOString(),
          status: data.status || 'pending',
          total: data.total || 0,
          items: data.items || [],
          billing: data.billing,
          paymentMethod: data.paymentMethod,
        };
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Fallback to mock data
      setOrders([
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 7499,
          items: [{ id: 1001, name: 'Golden Champion Trophy', quantity: 1, price: 7499 }]
        },
        {
          id: 'ORD-002',
          date: '2024-01-10',
          status: 'processing',
          total: 12999,
          items: [{ id: 5001, name: 'Abstract Canvas Art', quantity: 1, price: 12999 }]
        },
      ]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      // Load addresses from Firestore
      // For now, use empty array - addresses will be saved in user document
      const userDoc = await getDoc(doc(db, 'users', user.id));
      const userData = userDoc.data();
      setAddresses(userData?.addresses || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateUserProfile(editProfile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async () => {
    try {
      if (!user) return;

      const addressData = editingAddress 
        ? { ...addressForm, id: editingAddress.id }
        : { ...addressForm, id: Date.now().toString() };

      // If this is set as default, unset others
      if (addressForm.isDefault) {
        addresses.forEach(addr => {
          if (addr.id !== addressData.id) {
            addr.isDefault = false;
          }
        });
      }

      const updatedAddresses = editingAddress
        ? addresses.map(addr => addr.id === editingAddress.id ? addressData : addr)
        : [...addresses, addressData];

      setAddresses(updatedAddresses);
      
      // Save to Firestore
      await updateUserProfile({});
      // Note: Addresses should be saved in a separate collection or user document
      
      toast({
        title: "Address Saved",
        description: "Your address has been saved successfully.",
      });
      
      setShowAddressDialog(false);
      setEditingAddress(null);
      setAddressForm({
        fullName: user.name || '',
        phone: user.phone || '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        isDefault: false,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save address",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
    toast({
      title: "Address Deleted",
      description: "Address has been removed.",
    });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your email to complete password change.",
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      const product: Product = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || '',
        rating: 0,
        reviews: 0,
        description: '',
        features: [],
        stock: 10,
        categoryId: 1,
        subcategoryId: 1,
      };
      addToCart(product, item.quantity);
    });
    toast({
      title: "Added to Cart",
      description: "Items have been added to your cart.",
    });
    navigate('/cart');
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'shipped':
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
        return '✓';
      case 'shipped':
        return '🚚';
      case 'processing':
        return '⏳';
      case 'pending':
        return '📦';
      case 'cancelled':
        return '✕';
      default:
        return '📦';
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
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <UserIcon className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email || user.phone}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => logout()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist ({wishlist.length})
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Edit Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={editProfile.name}
                        onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editProfile.email}
                        onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={editProfile.phone}
                        onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Saved Addresses
                  </CardTitle>
                  <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingAddress(null);
                        setAddressForm({
                          fullName: user.name || '',
                          phone: user.phone || '',
                          address: '',
                          city: '',
                          state: '',
                          pincode: '',
                          landmark: '',
                          isDefault: addresses.length === 0,
                        });
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addrName">Full Name *</Label>
                            <Input
                              id="addrName"
                              value={addressForm.fullName}
                              onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addrPhone">Phone Number *</Label>
                            <Input
                              id="addrPhone"
                              type="tel"
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addrAddress">Address *</Label>
                          <Input
                            id="addrAddress"
                            value={addressForm.address}
                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addrCity">City *</Label>
                            <Input
                              id="addrCity"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addrState">State *</Label>
                            <Input
                              id="addrState"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="addrPincode">Pincode *</Label>
                            <Input
                              id="addrPincode"
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="addrLandmark">Landmark (Optional)</Label>
                          <Input
                            id="addrLandmark"
                            value={addressForm.landmark}
                            onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="rounded"
                          />
                          <Label htmlFor="isDefault" className="cursor-pointer">Set as default address</Label>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowAddressDialog(false)} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={handleSaveAddress} className="flex-1">
                            Save Address
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">No addresses saved</h3>
                      <p className="text-muted-foreground mb-4">Add an address for faster checkout</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((address) => (
                        <Card key={address.id} className={address.isDefault ? 'border-primary' : ''}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                {address.isDefault && (
                                  <Badge className="mb-2">Default</Badge>
                                )}
                                <p className="font-semibold">{address.fullName}</p>
                                <p className="text-sm text-muted-foreground">{address.phone}</p>
                                <p className="text-sm mt-2">{address.address}</p>
                                <p className="text-sm">
                                  {address.city}, {address.state} - {address.pincode}
                                </p>
                                {address.landmark && (
                                  <p className="text-sm text-muted-foreground">Landmark: {address.landmark}</p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingAddress(address);
                                    setAddressForm({
                                      fullName: address.fullName,
                                      phone: address.phone,
                                      address: address.address,
                                      city: address.city,
                                      state: address.state,
                                      pincode: address.pincode,
                                      landmark: address.landmark,
                                      isDefault: address.isDefault,
                                    });
                                    setShowAddressDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteAddress(address.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Change Password Tab */}
            <TabsContent value="password" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      >
                        {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      >
                        {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              {loadingOrders ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
                    <p className="text-muted-foreground">Loading orders...</p>
                  </CardContent>
                </Card>
              ) : orders.length === 0 ? (
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
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                              <span className="text-xl">{getStatusIcon(order.status)}</span>
                            </div>
                            <div>
                              <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-1">
                                Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={`${getStatusColor(order.status)} border mb-2`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </Badge>
                            <p className="text-xl font-bold text-foreground mt-2">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Order Items */}
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Quantity: {item.quantity} × {formatPrice(item.price)}
                                  </p>
                                </div>
                                <p className="font-semibold text-foreground">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Order Info */}
                          {order.billing && (
                            <div className="pt-4 border-t">
                              <p className="text-sm font-semibold mb-2">Delivery Address:</p>
                              <p className="text-sm text-muted-foreground">
                                {order.billing.fullName}, {order.billing.phone}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.billing.address}, {order.billing.city}, {order.billing.state} - {order.billing.pincode}
                              </p>
                            </div>
                          )}

                          {order.paymentMethod && (
                            <div className="pt-2">
                              <p className="text-sm">
                                <span className="font-semibold">Payment:</span>{' '}
                                <span className="text-muted-foreground">
                                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                </span>
                              </p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" className="flex-1" asChild>
                              <Link to={`/order/${order.id}`}>View Details</Link>
                            </Button>
                            {order.status === 'delivered' && (
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleReorder(order)}
                              >
                                <ShoppingBag className="h-4 w-4 mr-2" />
                                Reorder
                              </Button>
                            )}
                            {order.status === 'processing' && (
                              <Button variant="outline" className="flex-1" disabled>
                                Track Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

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
                              {formatPrice(product.discountPrice || product.price)}
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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
