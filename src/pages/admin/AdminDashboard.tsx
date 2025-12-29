import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { formatPrice } from '@/data/categories';
import { orderService, productService } from '@/services/firestoreService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
    productsChange: 0,
    customersChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all orders
      const orders = await orderService.getAll();
      
      // Fetch all products
      const products = await productService.getAll();
      
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate total revenue from orders
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Calculate revenue from last month (orders created 30+ days ago)
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const lastMonthOrders = orders.filter(order => {
        const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
        return orderDate < oneMonthAgo;
      });
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const revenueChange = lastMonthRevenue > 0 
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // Calculate orders change
      const lastMonthOrdersCount = lastMonthOrders.length;
      const ordersChange = lastMonthOrdersCount > 0 
        ? ((orders.length - lastMonthOrdersCount) / lastMonthOrdersCount) * 100 
        : 0;

      // Calculate products change (simplified - comparing current count)
      const productsChange = 0; // Would need historical data for accurate calculation

      // Calculate customers change
      const lastMonthUsers = users.filter(user => {
        const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt || 0);
        return userDate < oneMonthAgo;
      });
      const customersChange = lastMonthUsers.length > 0 
        ? ((users.length - lastMonthUsers.length) / lastMonthUsers.length) * 100 
        : 0;

      // Get recent orders (last 5)
      const sortedOrders = orders
        .sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt || 0).getTime();
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);

      const recentOrdersData = sortedOrders.map(order => ({
        id: order.id,
        customer: order.billing?.fullName || order.customer?.name || 'Unknown',
        product: order.items?.[0]?.name || 'Multiple items',
        amount: order.total || 0,
        status: order.status || 'pending',
      }));

      // Calculate top products by revenue
      const productRevenueMap: { [key: string]: { name: string; sales: number; revenue: number } } = {};
      
      orders.forEach(order => {
        order.items?.forEach((item: any) => {
          const productId = item.productId || item.id;
          const productName = item.name || 'Unknown Product';
          const quantity = item.quantity || item.qty || 1;
          const price = item.price || 0;
          const revenue = quantity * price;

          if (!productRevenueMap[productId]) {
            productRevenueMap[productId] = {
              name: productName,
              sales: 0,
              revenue: 0,
            };
          }
          productRevenueMap[productId].sales += quantity;
          productRevenueMap[productId].revenue += revenue;
        });
      });

      const topProductsData = Object.values(productRevenueMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalCustomers: users.length,
        revenueChange,
        ordersChange,
        productsChange,
        customersChange,
      });
      setRecentOrders(recentOrdersData);
      setTopProducts(topProductsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const statsConfig = [
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      change: stats.revenueChange,
      isPositive: stats.revenueChange >= 0,
      icon: IndianRupee,
      format: 'currency' as const
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      change: stats.ordersChange,
      isPositive: stats.ordersChange >= 0,
      icon: ShoppingCart,
      format: 'number' as const
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      change: stats.productsChange,
      isPositive: stats.productsChange >= 0,
      icon: Package,
      format: 'number' as const
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      change: stats.customersChange,
      isPositive: stats.customersChange >= 0,
      icon: Users,
      format: 'number' as const
    }
  ];

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
        <h2 className="text-2xl font-serif font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
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
              {stat.change !== 0 && (
                <div className={`flex items-center text-xs mt-1 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.isPositive ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.change).toFixed(1)}% from last month
                </div>
              )}
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
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders yet
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/50 rounded px-2"
                    onClick={() => navigate(`/order/${order.id}`)}
                  >
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
            )}
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
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No product sales yet
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
