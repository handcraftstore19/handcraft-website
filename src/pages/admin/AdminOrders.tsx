import { useState } from 'react';
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
  Package
} from 'lucide-react';
import { formatPrice } from '@/data/categories';
import { useToast } from '@/hooks/use-toast';

const orderStatuses = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
];

const mockOrders = [
  {
    id: 'ORD-2024-001',
    customer: { name: 'Rahul Kumar', email: 'rahul@example.com', phone: '+91 98765 43210' },
    items: [
      { name: 'Golden Champion Trophy', qty: 2, price: 5999 },
      { name: 'Silver Star Trophy', qty: 1, price: 5499 }
    ],
    total: 17497,
    status: 'delivered',
    store: 'Hyderabad',
    date: '2024-01-15',
    address: '123, Banjara Hills, Hyderabad'
  },
  {
    id: 'ORD-2024-002',
    customer: { name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 87654 32109' },
    items: [
      { name: 'Crystal Photo Frame', qty: 1, price: 5499 }
    ],
    total: 5499,
    status: 'shipped',
    store: 'Vizag',
    date: '2024-01-16',
    address: '456, Beach Road, Visakhapatnam'
  },
  {
    id: 'ORD-2024-003',
    customer: { name: 'Amit Singh', email: 'amit@example.com', phone: '+91 76543 21098' },
    items: [
      { name: 'Premium Gold Medal Set', qty: 5, price: 1999 }
    ],
    total: 9995,
    status: 'processing',
    store: 'Warangal',
    date: '2024-01-17',
    address: '789, Fort Road, Warangal'
  },
  {
    id: 'ORD-2024-004',
    customer: { name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 65432 10987' },
    items: [
      { name: 'Ceramic Artisan Vase', qty: 1, price: 5999 },
      { name: 'Macrame Wall Hanging', qty: 2, price: 4499 }
    ],
    total: 14997,
    status: 'pending',
    store: 'Hyderabad',
    date: '2024-01-18',
    address: '321, Jubilee Hills, Hyderabad'
  },
  {
    id: 'ORD-2024-005',
    customer: { name: 'Vikram Patel', email: 'vikram@example.com', phone: '+91 54321 09876' },
    items: [
      { name: 'Abstract Canvas Art', qty: 1, price: 8499 }
    ],
    total: 8499,
    status: 'cancelled',
    store: 'Vizag',
    date: '2024-01-14',
    address: '654, MVP Colony, Visakhapatnam'
  },
];

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const { toast } = useToast();

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesStore = storeFilter === 'all' || order.store === storeFilter;
    return matchesSearch && matchesStatus && matchesStore;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    toast({
      title: "Order Updated",
      description: `Order ${orderId} status changed to ${newStatus}. Firebase integration pending.`,
    });
  };

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Orders</h2>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        {orderStatuses.map(status => {
          const count = mockOrders.filter(o => o.status === status.value).length;
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
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{order.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {order.items.map((item, i) => (
                            <p key={i} className="text-sm truncate">
                              {item.qty}x {item.name}
                            </p>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                      <TableCell>{order.store}</TableCell>
                      <TableCell>
                        <Select 
                          value={order.status} 
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
                      <TableCell className="text-muted-foreground">{order.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
