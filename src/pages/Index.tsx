import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoriesSection from "@/components/CategoriesSection";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";
import { getBestSellerProducts, getNewArrivalProducts, getFeaturedProducts } from "@/lib/searchUtils";

const Index = () => {
  const bestSellers = getBestSellerProducts();
  const newArrivals = getNewArrivalProducts();
  const featuredProducts = getFeaturedProducts();

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
            viewAllLink="/search?q=best-seller"
          />
        )}

        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
          <ProductSection
            title="New Arrivals"
            subtitle="Fresh additions to our collection"
            products={newArrivals}
            viewAllLink="/search?q=new-arrival"
          />
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <ProductSection
            title="Featured Products"
            subtitle="Handpicked selections just for you"
            products={featuredProducts}
            viewAllLink="/search?q=trending"
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;