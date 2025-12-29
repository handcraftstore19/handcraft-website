import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowUpRight, ArrowDownRight, IndianRupee, Loader2 } from 'lucide-react';
import { formatPrice } from '@/data/categories';
import { orderService } from '@/services/firestoreService';

const AdminFinance = () => {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [revenueChange, setRevenueChange] = useState(0);
  const [expensesChange, setExpensesChange] = useState(0);
  const [profitChange, setProfitChange] = useState(0);
  const [storeRevenue, setStoreRevenue] = useState<{ store: string; revenue: number; orders: number }[]>([]);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);

      // Fetch all orders
      const orders = await orderService.getAll();

      // Calculate total revenue
      const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Calculate revenue from last month
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const lastMonthOrders = orders.filter(order => {
        const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt || 0);
        return orderDate < oneMonthAgo;
      });
      const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const revenueChangePercent = lastMonthRevenue > 0 
        ? ((revenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      // For expenses, we'll use a simple calculation (30% of revenue as a placeholder)
      // In a real app, expenses should be tracked separately
      const calculatedExpenses = revenue * 0.3;
      const lastMonthExpenses = lastMonthRevenue * 0.3;
      const expensesChangePercent = lastMonthExpenses > 0 
        ? ((calculatedExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
        : 0;

      // Calculate net profit
      const profit = revenue - calculatedExpenses;
      const lastMonthProfit = lastMonthRevenue - lastMonthExpenses;
      const profitChangePercent = lastMonthProfit > 0 
        ? ((profit - lastMonthProfit) / lastMonthProfit) * 100 
        : 0;

      // Calculate store-wise revenue
      const storeMap: { [key: string]: { revenue: number; orders: number } } = {
        'Hyderabad': { revenue: 0, orders: 0 },
        'Vizag': { revenue: 0, orders: 0 },
        'Warangal': { revenue: 0, orders: 0 },
      };

      orders.forEach(order => {
        const store = order.store || order.billing?.store || 'Hyderabad';
        if (storeMap[store]) {
          storeMap[store].revenue += order.total || 0;
          storeMap[store].orders += 1;
        } else {
          // Handle case-insensitive matching
          const storeLower = store.toLowerCase();
          if (storeLower.includes('hyderabad')) {
            storeMap['Hyderabad'].revenue += order.total || 0;
            storeMap['Hyderabad'].orders += 1;
          } else if (storeLower.includes('vizag') || storeLower.includes('visakhapatnam')) {
            storeMap['Vizag'].revenue += order.total || 0;
            storeMap['Vizag'].orders += 1;
          } else if (storeLower.includes('warangal')) {
            storeMap['Warangal'].revenue += order.total || 0;
            storeMap['Warangal'].orders += 1;
          }
        }
      });

      const storeRevenueData = Object.entries(storeMap).map(([store, data]) => ({
        store,
        revenue: data.revenue,
        orders: data.orders,
      }));

      setTotalRevenue(revenue);
      setExpenses(calculatedExpenses);
      setNetProfit(profit);
      setRevenueChange(revenueChangePercent);
      setExpensesChange(expensesChangePercent);
      setProfitChange(profitChangePercent);
      setStoreRevenue(storeRevenueData);
    } catch (error) {
      console.error('Error loading finance data:', error);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">Finance</h2>
        <p className="text-muted-foreground">Financial overview and reports</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                {revenueChange !== 0 && (
                  <p className={`text-xs flex items-center ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <ArrowUpRight className="h-3 w-3" />
                    {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
                  </p>
                )}
              </div>
              <IndianRupee className="h-8 w-8 text-green-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expenses</p>
                <p className="text-2xl font-bold">{formatPrice(expenses)}</p>
                {expensesChange !== 0 && (
                  <p className={`text-xs flex items-center ${expensesChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <ArrowDownRight className="h-3 w-3" />
                    {expensesChange >= 0 ? '+' : ''}{expensesChange.toFixed(1)}%
                  </p>
                )}
              </div>
              <Wallet className="h-8 w-8 text-red-600/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className="text-2xl font-bold">{formatPrice(netProfit)}</p>
                {profitChange !== 0 && (
                  <p className={`text-xs flex items-center ${profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <ArrowUpRight className="h-3 w-3" />
                    {profitChange >= 0 ? '+' : ''}{profitChange.toFixed(1)}%
                  </p>
                )}
              </div>
              <IndianRupee className="h-8 w-8 text-accent/50" />
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Store-wise Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storeRevenue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No revenue data available
              </div>
            ) : (
              storeRevenue.map(s => (
                <div key={s.store} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{s.store}</p>
                    <p className="text-sm text-muted-foreground">{s.orders} orders</p>
                  </div>
                  <p className="font-bold">{formatPrice(s.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinance;
