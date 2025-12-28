import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoriesSection from "@/components/CategoriesSection";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";
import { getBestSellerProducts, getNewArrivalProducts, getFeaturedProducts } from "@/lib/searchUtils";
import { useStore } from "@/contexts/StoreContext";

const Index = () => {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id || null;
  const bestSellers = getBestSellerProducts(storeId);
  const newArrivals = getNewArrivalProducts(storeId);
  const featuredProducts = getFeaturedProducts(storeId);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroCarousel />
        
        {/* Shop by Category Section */}
        <CategoriesSection />
        
        {/* Best Sellers Section */}
        {bestSellers.length > 0 && (
          <ProductSection
            title="Best Sellers"
            subtitle="Our most popular products loved by customers"
            products={bestSellers}
            viewAllLink="/best-sellers"
          />
        )}

        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
          <ProductSection
            title="New Arrivals"
            subtitle="Fresh additions to our collection"
            products={newArrivals}
            viewAllLink="/new-arrivals"
          />
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <ProductSection
            title="Featured Products"
            subtitle="Handpicked selections just for you"
            products={featuredProducts}
            viewAllLink="/featured-products"
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;