import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

const AdminSettings = () => (
  <div className="space-y-6">
    <div><h2 className="text-2xl font-serif font-bold">Settings</h2><p className="text-muted-foreground">Store configuration</p></div>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Firebase Configuration</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div><Label>Firebase API Key</Label><Input type="password" placeholder="Enter Firebase API Key" /></div>
        <div><Label>Firebase Project ID</Label><Input placeholder="Enter Project ID" /></div>
        <div><Label>Firebase Auth Domain</Label><Input placeholder="your-app.firebaseapp.com" /></div>
        <div><Label>Firebase Storage Bucket</Label><Input placeholder="your-app.appspot.com" /></div>
        <Button className="bg-accent hover:bg-accent/90">Save Configuration</Button>
        <p className="text-sm text-muted-foreground">Note: Firebase configuration will be set up after you provide the credentials.</p>
      </CardContent>
    </Card>
  </div>
);

export default AdminSettings;
