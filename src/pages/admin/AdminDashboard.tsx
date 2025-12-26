import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatPrice } from '@/data/categories';

const stats = [
  {
    title: 'Total Revenue',
    value: 1245890,
    change: 12.5,
    isPositive: true,
    icon: IndianRupee,
    format: 'currency'
  },
  {
    title: 'Total Orders',
    value: 856,
    change: 8.2,
    isPositive: true,
    icon: ShoppingCart,
    format: 'number'
  },
  {
    title: 'Total Products',
    value: 234,
    change: 5.1,
    isPositive: true,
    icon: Package,
    format: 'number'
  },
  {
    title: 'Total Customers',
    value: 1523,
    change: -2.4,
    isPositive: false,
    icon: Users,
    format: 'number'
  }
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Rahul Kumar', product: 'Golden Champion Trophy', amount: 5999, status: 'Delivered' },
  { id: 'ORD-002', customer: 'Priya Sharma', product: 'Crystal Photo Frame', amount: 5499, status: 'Processing' },
  { id: 'ORD-003', customer: 'Amit Singh', product: 'Premium Gold Medal Set', amount: 1999, status: 'Shipped' },
  { id: 'ORD-004', customer: 'Sneha Reddy', product: 'Ceramic Artisan Vase', amount: 5999, status: 'Pending' },
  { id: 'ORD-005', customer: 'Vikram Patel', product: 'Macrame Wall Hanging', amount: 4499, status: 'Delivered' },
];

const topProducts = [
  { name: 'Golden Champion Trophy', sales: 156, revenue: 935844 },
  { name: 'Premium Gold Medal Set', sales: 234, revenue: 467766 },
  { name: 'Crystal Photo Frame', sales: 89, revenue: 489411 },
  { name: 'Ceramic Artisan Vase', sales: 78, revenue: 467922 },
  { name: 'Macrame Wall Hanging', sales: 67, revenue: 301433 },
];

const AdminDashboard = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {stat.format === 'currency' ? formatPrice(stat.value) : stat.value.toLocaleString('en-IN')}
              </div>
              <div className={`flex items-center text-xs mt-1 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(stat.change)}% from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatPrice(order.amount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <p className="font-medium text-foreground">{formatPrice(product.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
