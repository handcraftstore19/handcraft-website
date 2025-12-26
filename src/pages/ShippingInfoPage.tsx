import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, Package, Clock, MapPin, CheckCircle } from 'lucide-react';

const shippingInfo = [
  {
    title: 'Standard Shipping',
    duration: '5-7 Business Days',
    cost: '₹100 (Free above ₹5,000)',
    description: 'Regular delivery to most locations',
    icon: Package,
  },
  {
    title: 'Express Shipping',
    duration: '2-3 Business Days',
    cost: '₹250',
    description: 'Fast delivery for urgent orders',
    icon: Truck,
  },
  {
    title: 'Same Day Delivery',
    duration: 'Same Day',
    cost: '₹500',
    description: 'Available in select cities (Hyderabad, Vizag)',
    icon: Clock,
  },
];

const shippingSteps = [
  {
    step: 1,
    title: 'Order Placed',
    description: 'Your order is confirmed and payment is processed',
  },
  {
    step: 2,
    title: 'Order Processing',
    description: 'We prepare your items for shipment',
  },
  {
    step: 3,
    title: 'Shipped',
    description: 'Your order is on its way! Track with provided tracking number',
  },
  {
    step: 4,
    title: 'Out for Delivery',
    description: 'Your order is with the delivery partner',
  },
  {
    step: 5,
    title: 'Delivered',
    description: 'Your order has been delivered successfully',
  },
];

const ShippingInfoPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Truck className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
              <p className="text-muted-foreground text-lg">
                Everything you need to know about our shipping and delivery options
              </p>
            </div>

            {/* Shipping Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {shippingInfo.map((option, idx) => {
                const Icon = option.icon;
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-6 w-6 text-primary" />
                        <CardTitle className="text-lg">{option.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{option.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{option.cost}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          {option.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Shipping Process */}
            <Card className="mb-12">
              <CardHeader>
                <CardTitle>Shipping Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {shippingSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-semibold text-primary">{step.step}</span>
                        </div>
                        {idx < shippingSteps.length - 1 && (
                          <div className="w-0.5 h-12 bg-border ml-5"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Delivery Locations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>All major cities in India</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Free shipping on orders above ₹5,000</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Same-day delivery in Hyderabad & Vizag</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>International shipping available (contact us)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Packaging & Handling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Secure packaging for fragile items</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Gift wrapping available (add ₹50)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Insurance included for high-value orders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Eco-friendly packaging materials</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Need Help with Shipping?</h3>
                  <p className="text-muted-foreground mb-4">
                    Contact our support team for shipping inquiries or special delivery requests.
                  </p>
                  <a href="/contact-us">
                    <Button>Contact Support</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShippingInfoPage;

