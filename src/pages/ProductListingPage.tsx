import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Star, Heart, ShoppingBag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Category, Subcategory, Product, StoreAvailability, formatPrice } from "@/data/categories";
import { useStore } from "@/contexts/StoreContext";
import { categoryService, subcategoryService, productService } from "@/services/firestoreService";

const ProductListingPage = () => {
  const { categoryId, subcategoryId } = useParams();
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id || null;
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId || !subcategoryId) return;
      setLoading(true);
      try {
        const [cat, subcat, prods] = await Promise.all([
          categoryService.getById(Number(categoryId)),
          subcategoryService.getById(Number(subcategoryId)),
          productService.getBySubcategory(Number(categoryId), Number(subcategoryId))
        ]);
        setCategory(cat);
        setSubcategory(subcat);
        setProducts(prods);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, subcategoryId]);

  // Helper function to check if product is available at store
  const isProductAvailable = (product: { availableAt?: StoreAvailability }) => {
    if (!storeId) return true;
    const defaultAvailability: StoreAvailability = {
      hyderabad: true,
      vizag: false,
      warangal: false
    };
    const availability = product.availableAt || defaultAvailability;
    return availability[storeId as keyof StoreAvailability] ?? false;
  };

  // Filter products by store availability
  const availableProducts = products.filter(isProductAvailable);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Products Not Found</h1>
            <Link to="/" className="text-primary hover:underline">Return to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm flex-wrap">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link 
                to={`/category/${category.id}`} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{subcategory.name}</span>
            </nav>
          </div>
        </div>

        {/* Page Header */}
        <section className="py-8 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
              {subcategory.name}
            </h1>
            <p className="text-muted-foreground">
              {availableProducts.length} products available
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {availableProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products available in this category yet.</p>
                <Link to={`/category/${category.id}`} className="text-primary hover:underline mt-4 inline-block">
                  Browse other subcategories
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {availableProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Product Image */}
                    <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Quick Actions */}
                      <div 
                        className={`absolute top-4 right-4 flex flex-col gap-2 transition-all duration-300 ${
                          hoveredProduct === product.id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                        }`}
                      >
                        <button className="p-2 rounded-full bg-card shadow-md hover:bg-secondary transition-colors">
                          <Heart className="h-5 w-5 text-foreground" />
                        </button>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-medium text-foreground">{product.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                      </div>
                      
                      {/* Price & Add to Cart */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {product.discountPrice ? (
                            <>
                              <span className="text-xl font-semibold text-foreground">
                                {formatPrice(product.discountPrice)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-xl font-semibold text-foreground">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <Button size="sm" className="rounded-full">
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductListingPage;
