import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const returnPolicy = {
  timeframe: '7 days',
  conditions: [
    'Product must be unused and in original condition',
    'Original packaging and tags must be intact',
    'Customized items are non-returnable (unless defective)',
    'Proof of purchase required',
  ],
  process: [
    {
      step: 1,
      title: 'Initiate Return',
      description: 'Go to your Orders page, select the order, and click "Return"',
    },
    {
      step: 2,
      title: 'Return Approval',
      description: 'We\'ll review your request and approve within 24 hours',
    },
    {
      step: 3,
      title: 'Ship Back',
      description: 'Pack the item securely and ship using our return label',
    },
    {
      step: 4,
      title: 'Refund Processed',
      description: 'Once received, refund will be processed within 5-7 business days',
    },
  ],
};

const exchangePolicy = {
  timeframe: '7 days',
  conditions: [
    'Exchange for different size/color/variant only',
    'Product must be unused and in original condition',
    'Price difference will be charged/refunded accordingly',
    'Customized items cannot be exchanged',
  ],
};

const ReturnsExchangesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Returns & Exchanges</h1>
              <p className="text-muted-foreground text-lg">
                We want you to be completely satisfied with your purchase
              </p>
            </div>

            {/* Return Policy */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Return Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Return Window</p>
                    <p className="text-muted-foreground">
                      You have <strong>{returnPolicy.timeframe}</strong> from delivery date to initiate a return
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Return Conditions</h3>
                  <ul className="space-y-2">
                    {returnPolicy.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Return Process</h3>
                  <div className="space-y-4">
                    {returnPolicy.process.map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-semibold text-primary">{step.step}</span>
                          </div>
                          {idx < returnPolicy.process.length - 1 && (
                            <div className="w-0.5 h-12 bg-border ml-5"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <h4 className="font-semibold mb-1">{step.title}</h4>
                          <p className="text-muted-foreground text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exchange Policy */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Exchange Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">Exchange Window</p>
                    <p className="text-muted-foreground">
                      You have <strong>{exchangePolicy.timeframe}</strong> from delivery date to request an exchange
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Exchange Conditions</h3>
                  <ul className="space-y-2">
                    {exchangePolicy.conditions.map((condition, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Eligible for Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Standard products in original condition</li>
                    <li>• Items with manufacturing defects</li>
                    <li>• Wrong items received</li>
                    <li>• Damaged during shipping</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    Not Eligible for Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>• Customized/personalized items</li>
                    <li>• Used or damaged items</li>
                    <li>• Items without original packaging</li>
                    <li>• Returned after 7 days</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Refund Information */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Refund Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Refund Timeline</h3>
                    <p className="text-muted-foreground">
                      Refunds are processed within <strong>5-7 business days</strong> after we receive and inspect the returned item.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Refund Method</h3>
                    <p className="text-muted-foreground">
                      Refunds are issued to the original payment method. For Cash on Delivery orders, refunds are processed via bank transfer.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Costs</h3>
                    <p className="text-muted-foreground">
                      Return shipping is free for defective or wrong items. For other returns, return shipping charges apply.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Need to Return or Exchange?</h3>
                  <p className="text-muted-foreground">
                    Log in to your account to initiate a return or exchange request
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button asChild>
                      <Link to="/login">Login to Return</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/contact-us">Contact Support</Link>
                    </Button>
                  </div>
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

export default ReturnsExchangesPage;

