import { useState, useEffect } from "react";
import Header from "@/components/Header";
import HeroCarousel from "@/components/HeroCarousel";
import CategoriesSection from "@/components/CategoriesSection";
import ProductSection from "@/components/ProductSection";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import { getBestSellerProducts, getNewArrivalProducts, getFeaturedProducts } from "@/lib/searchUtils";
import { useStore } from "@/contexts/StoreContext";
import { Product } from "@/data/categories";

const Index = () => {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id || null;
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [best, newArr, featured] = await Promise.all([
          getBestSellerProducts(storeId),
          getNewArrivalProducts(storeId),
          getFeaturedProducts(storeId)
        ]);
        setBestSellers(best);
        setNewArrivals(newArr);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Marquee />
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