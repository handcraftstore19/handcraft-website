import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, ShoppingCart, Loader2 } from 'lucide-react';
import { formatPrice } from '@/data/categories';
import { orderService } from '@/services/firestoreService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [pageViews, setPageViews] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [newCustomers, setNewCustomers] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [pageViewsChange, setPageViewsChange] = useState(0);
  const [conversionRateChange, setConversionRateChange] = useState(0);
  const [newCustomersChange, setNewCustomersChange] = useState(0);
  const [avgOrderValueChange, setAvgOrderValueChange] = useState(0);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Fetch all orders
      const orders = await orderService.getAll();
      
      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate page views (simplified - using total orders as a proxy)
      // In a real app, page views should be tracked separately
      const totalPageViews = orders.length * 10; // Estimate: 10 page views per order
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const lastMonthOrders = orders.filter(order => {
        const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt || 0);
        return orderDate < oneMonthAgo;
      });
      const lastMonthPageViews = lastMonthOrders.length * 10;
      const pageViewsChangePercent = lastMonthPageViews > 0 
        ? ((totalPageViews - lastMonthPageViews) / lastMonthPageViews) * 100 
        : 0;

      // Calculate conversion rate (orders / users * 100)
      const conversionRateValue = users.length > 0 ? (orders.length / users.length) * 100 : 0;
      const lastMonthUsers = users.filter(user => {
        const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt || 0);
        return userDate < oneMonthAgo;
      });
      const lastMonthConversionRate = lastMonthUsers.length > 0 
        ? (lastMonthOrders.length / lastMonthUsers.length) * 100 
        : 0;
      const conversionRateChangePercent = lastMonthConversionRate > 0 
        ? conversionRateValue - lastMonthConversionRate 
        : 0;

      // Calculate new customers (users created in last month)
      const newCustomersCount = users.filter(user => {
        const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt || 0);
        return userDate >= oneMonthAgo;
      }).length;
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      const previousMonthUsers = users.filter(user => {
        const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt || 0);
        return userDate >= twoMonthsAgo && userDate < oneMonthAgo;
      }).length;
      const newCustomersChangePercent = previousMonthUsers > 0 
        ? ((newCustomersCount - previousMonthUsers) / previousMonthUsers) * 100 
        : 0;

      // Calculate average order value
      const avgOrderValueAmount = orders.length > 0 
        ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length 
        : 0;
      const lastMonthAvgOrderValue = lastMonthOrders.length > 0 
        ? lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0) / lastMonthOrders.length 
        : 0;
      const avgOrderValueChangePercent = lastMonthAvgOrderValue > 0 
        ? ((avgOrderValueAmount - lastMonthAvgOrderValue) / lastMonthAvgOrderValue) * 100 
        : 0;

      setPageViews(totalPageViews);
      setConversionRate(conversionRateValue);
      setNewCustomers(newCustomersCount);
      setAvgOrderValue(avgOrderValueAmount);
      setPageViewsChange(pageViewsChangePercent);
      setConversionRateChange(conversionRateChangePercent);
      setNewCustomersChange(newCustomersChangePercent);
      setAvgOrderValueChange(avgOrderValueChangePercent);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = [
    { 
      title: 'Page Views', 
      value: pageViews.toLocaleString('en-IN'), 
      change: pageViewsChange, 
      icon: BarChart3 
    },
    { 
      title: 'Conversion Rate', 
      value: `${conversionRate.toFixed(1)}%`, 
      change: conversionRateChange, 
      icon: TrendingUp 
    },
    { 
      title: 'New Customers', 
      value: newCustomers.toString(), 
      change: newCustomersChange, 
      icon: Users 
    },
    { 
      title: 'Avg Order Value', 
      value: formatPrice(avgOrderValue), 
      change: avgOrderValueChange, 
      icon: ShoppingCart 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Analytics</h2>
        <p className="text-muted-foreground">View store performance metrics</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.change !== 0 && (
                    <p className={`text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change >= 0 ? '+' : ''}{stat.change.toFixed(1)}%
                    </p>
                  )}
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart will be rendered with Firebase data
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
