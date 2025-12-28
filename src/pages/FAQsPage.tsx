import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for select locations. You can track your order status in your profile.',
      },
      {
        q: 'What are the shipping charges?',
        a: 'Free shipping on orders above ₹5,000. For orders below ₹5,000, shipping charges are ₹100. Express shipping charges may vary.',
      },
      {
        q: 'Can I modify or cancel my order?',
        a: 'You can cancel your order within 2 hours of placing it. After that, please contact our customer support team. Modifications are subject to order status.',
      },
      {
        q: 'How do I track my order?',
        a: 'Once your order is shipped, you\'ll receive a tracking number via SMS and email. You can also track your order in the "Orders" section of your profile.',
      },
    ],
  },
  {
    category: 'Products',
    questions: [
      {
        q: 'Are the products customizable?',
        a: 'Yes! Many of our products can be customized with names, dates, or special messages. Look for the "Customizable" badge on product pages or contact us for custom orders.',
      },
      {
        q: 'What is your return policy?',
        a: 'We offer 7-day return policy for unused products in original packaging. Customized items are non-returnable unless there\'s a manufacturing defect.',
      },
      {
        q: 'Do you offer bulk discounts?',
        a: 'Yes! We offer special pricing for bulk orders (25+ items). Contact our sales team at bulk@damodarhandicrafts.com for a custom quote.',
      },
      {
        q: 'What materials are used in your products?',
        a: 'We use premium materials including crystal, brass, wood, ceramic, and high-quality metals. Material details are mentioned in each product description.',
      },
    ],
  },
  {
    category: 'Payment',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept Cash on Delivery (COD), Credit/Debit Cards, UPI, Net Banking, and digital wallets like Paytm, PhonePe, and Google Pay.',
      },
      {
        q: 'Is it safe to pay online?',
        a: 'Absolutely! We use secure payment gateways with SSL encryption. We never store your card details on our servers.',
      },
      {
        q: 'When will I be charged for my order?',
        a: 'For online payments, you\'ll be charged immediately. For Cash on Delivery, payment is collected when you receive the order.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Yes, refunds are processed within 5-7 business days after we receive the returned product. Refunds are issued to the original payment method.',
      },
    ],
  },
  {
    category: 'Account & Profile',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on "Sign Up" in the header. You can sign up using your email, phone number, or Google account. Phone signup requires OTP verification.',
      },
      {
        q: 'I forgot my password. What should I do?',
        a: 'Click "Forgot Password" on the login page. Enter your phone number to receive an OTP, then set a new password.',
      },
      {
        q: 'How do I update my profile information?',
        a: 'Go to your Profile page and click on the "Profile" tab. You can update your name, email, and phone number there.',
      },
      {
        q: 'How do I save multiple addresses?',
        a: 'In your Profile page, go to the "Addresses" tab. Click "Add Address" to save a new address. You can set one as default for faster checkout.',
      },
    ],
  },
];

const FAQsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <HelpCircle className="h-10 w-10 text-primary" />
                <h1 className="text-4xl font-bold">Frequently Asked Questions</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Find answers to common questions about our products, orders, and services.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((category, categoryIdx) => (
                <Card key={categoryIdx}>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-semibold mb-4 text-foreground">
                      {category.category}
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, idx) => (
                        <AccordionItem key={idx} value={`item-${categoryIdx}-${idx}`}>
                          <AccordionTrigger className="text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-8">
              <CardContent className="pt-6 text-center">
                <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
                <p className="text-muted-foreground mb-4">
                  Can't find the answer you're looking for? Please contact our support team.
                </p>
                <a href="/contact-us">
                  <Button>Contact Us</Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQsPage;

