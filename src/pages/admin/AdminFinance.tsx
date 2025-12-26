import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowUpRight, ArrowDownRight, IndianRupee } from 'lucide-react';
import { formatPrice } from '@/data/categories';

const AdminFinance = () => (
  <div className="space-y-6">
    <div><h2 className="text-2xl font-serif font-bold">Finance</h2><p className="text-muted-foreground">Financial overview and reports</p></div>
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">{formatPrice(1245890)}</p><p className="text-xs text-green-600 flex items-center"><ArrowUpRight className="h-3 w-3" />+12.5%</p></div><IndianRupee className="h-8 w-8 text-green-600/50" /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Expenses</p><p className="text-2xl font-bold">{formatPrice(345000)}</p><p className="text-xs text-red-600 flex items-center"><ArrowDownRight className="h-3 w-3" />+5.2%</p></div><Wallet className="h-8 w-8 text-red-600/50" /></div></CardContent></Card>
      <Card><CardContent className="pt-6"><div className="flex justify-between"><div><p className="text-sm text-muted-foreground">Net Profit</p><p className="text-2xl font-bold">{formatPrice(900890)}</p><p className="text-xs text-green-600 flex items-center"><ArrowUpRight className="h-3 w-3" />+15.8%</p></div><IndianRupee className="h-8 w-8 text-accent/50" /></div></CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Store-wise Revenue</CardTitle></CardHeader><CardContent><div className="space-y-4">{[{ store: 'Hyderabad', revenue: 523450, orders: 342 }, { store: 'Vizag', revenue: 412340, orders: 278 }, { store: 'Warangal', revenue: 310100, orders: 236 }].map(s => (<div key={s.store} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg"><div><p className="font-medium">{s.store}</p><p className="text-sm text-muted-foreground">{s.orders} orders</p></div><p className="font-bold">{formatPrice(s.revenue)}</p></div>))}</div></CardContent></Card>
  </div>
);

export default AdminFinance;
