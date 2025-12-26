import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "@/contexts/StoreContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ReviewProvider } from "@/contexts/ReviewContext";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductListingPage from "./pages/ProductListingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactUsPage from "./pages/ContactUsPage";
import FAQsPage from "./pages/FAQsPage";
import ShippingInfoPage from "./pages/ShippingInfoPage";
import ReturnsExchangesPage from "./pages/ReturnsExchangesPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import BestSellersPage from "./pages/BestSellersPage";
import NewArrivalsPage from "./pages/NewArrivalsPage";
import FeaturedProductsPage from "./pages/FeaturedProductsPage";
import SearchPage from "./pages/SearchPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminFinance from "./pages/admin/AdminFinance";
import AdminCarousels from "./pages/admin/AdminCarousels";
import AdminSettings from "./pages/admin/AdminSettings";
import StoreSelector from "./components/StoreSelector";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ReviewProvider>
              <StoreProvider>
            <Toaster />
            <Sonner />
            <StoreSelector />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/forget-password" element={<ForgetPasswordPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/contact-us" element={<ContactUsPage />} />
                <Route path="/faqs" element={<FAQsPage />} />
                <Route path="/shipping-info" element={<ShippingInfoPage />} />
                <Route path="/returns-exchanges" element={<ReturnsExchangesPage />} />
                <Route path="/track-order" element={<TrackOrderPage />} />
                <Route path="/order/:orderId" element={<OrderDetailsPage />} />
                <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                <Route path="/best-sellers" element={<BestSellersPage />} />
                <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                <Route path="/featured-products" element={<FeaturedProductsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/category/:categoryId/subcategory/:subcategoryId" element={<ProductListingPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="finance" element={<AdminFinance />} />
                  <Route path="carousels" element={<AdminCarousels />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
              </StoreProvider>
            </ReviewProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
