import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Search, 
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Loader2
} from 'lucide-react';
import { formatPrice } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';
import { orderService } from '@/services/firestoreService';
import { useNavigate } from 'react-router-dom';

const orderStatuses = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const allOrders = await orderService.getAll();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders from Firestore.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = order.billing?.fullName || order.customer?.name || '';
    const orderId = order.id || '';
    const matchesSearch = 
      orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const store = order.store || order.billing?.store || '';
    const matchesStore = storeFilter === 'all' || store === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      toast({
        title: "Order Updated",
        description: `Order ${orderId} status changed to ${newStatus}.`,
      });
      await loadOrders(); // Reload orders to reflect the change
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
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
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Orders</h2>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {orderStatuses.map(status => {
          const count = orders.filter(o => o.status === status.value).length;
          const StatusIcon = status.icon;
          return (
            <Card key={status.value} className="bg-card">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{status.label}</p>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                  </div>
                  <StatusIcon className={`h-8 w-8 opacity-50`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {orderStatuses.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                <SelectItem value="Vizag">Vizag</SelectItem>
                <SelectItem value="Warangal">Warangal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status || 'pending');
                    const customerName = order.billing?.fullName || order.customer?.name || 'Unknown';
                    const customerPhone = order.billing?.phone || order.customer?.phone || '';
                    const orderDate = order.createdAt 
                      ? (order.createdAt instanceof Date ? order.createdAt.toISOString().split('T')[0] : order.date)
                      : order.date || 'N/A';
                    const store = order.store || order.billing?.store || 'N/A';
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{customerName}</p>
                            <p className="text-xs text-muted-foreground">{customerPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {order.items?.map((item: any, i: number) => (
                              <p key={i} className="text-sm truncate">
                                {item.quantity || item.qty}x {item.name}
                              </p>
                            )) || <p className="text-sm text-muted-foreground">No items</p>}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatPrice(order.total || 0)}</TableCell>
                        <TableCell>{store}</TableCell>
                        <TableCell>
                          <Select 
                            value={order.status || 'pending'} 
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                          >
                            <SelectTrigger className={`w-32 h-8 ${statusInfo.color}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {orderStatuses.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{orderDate}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/order/${order.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
