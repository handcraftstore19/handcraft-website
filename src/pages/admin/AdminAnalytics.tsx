import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, ShoppingCart } from 'lucide-react';

const AdminAnalytics = () => (
  <div className="space-y-6">
    <div><h2 className="text-2xl font-serif font-bold">Analytics</h2><p className="text-muted-foreground">View store performance metrics</p></div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[{ title: 'Page Views', value: '45,231', change: '+12%', icon: BarChart3 }, { title: 'Conversion Rate', value: '3.2%', change: '+0.5%', icon: TrendingUp }, { title: 'New Customers', value: '234', change: '+18%', icon: Users }, { title: 'Avg Order Value', value: '₹4,567', change: '+8%', icon: ShoppingCart }].map(stat => (
        <Card key={stat.title}><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">{stat.title}</p><p className="text-2xl font-bold">{stat.value}</p><p className="text-xs text-green-600">{stat.change}</p></div><stat.icon className="h-8 w-8 text-muted-foreground/50" /></div></CardContent></Card>
      ))}
    </div>
    <Card><CardHeader><CardTitle>Sales Overview</CardTitle></CardHeader><CardContent><div className="h-64 flex items-center justify-center text-muted-foreground">Chart will be rendered with Firebase data</div></CardContent></Card>
  </div>
);

export default AdminAnalytics;
