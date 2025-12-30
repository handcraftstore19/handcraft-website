import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-foreground text-card">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl font-semibold">Damodar Handicrafts</h3>
            <p className="text-card/70 leading-relaxed">
              Crafting excellence since 1989. Premium trophies, medals, 
              home decor and decorative crafts delivered to your door.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-card/10 hover:bg-card/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-card/10 hover:bg-card/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-full bg-card/10 hover:bg-card/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {["Trophies", "Medals", "Momentos", "Home Decor", "Wall Art"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-card/70 hover:text-card transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <a href="/contact-us" className="text-card/70 hover:text-card transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/faqs" className="text-card/70 hover:text-card transition-colors">
                  FAQs
                </a>
              </li>
              <li>
                <a href="/shipping-info" className="text-card/70 hover:text-card transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="/returns-exchanges" className="text-card/70 hover:text-card transition-colors">
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a href="/track-order" className="text-card/70 hover:text-card transition-colors">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
            <p className="text-card/70 mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-card/10 border-card/20 text-card placeholder:text-card/50 focus-visible:ring-card/30"
              />
              <Button className="bg-card text-foreground hover:bg-card/90">
                Subscribe
              </Button>
            </div>
            <div className="mt-6 space-y-3 text-card/70 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 (XXX) XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@damodarhandicrafts.com</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Visakhapatnam Office</p>
                    <p className="text-xs text-card/60">Address coming soon</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <div>
                    <p className="font-medium">Warangal Office</p>
                    <p className="text-xs text-card/60">Address coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-card/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-card/60 text-sm">
          <p>© 2025 Damodar Handicrafts. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-card transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-card transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-card transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;