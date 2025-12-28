import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product, formatPrice } from '@/data/categories';
import { getNewArrivalProducts } from '@/lib/searchUtils';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';

const NewArrivalsPage = () => {
  const { selectedStore } = useStore();
  const storeId = selectedStore?.id || null;
  const allProducts = getNewArrivalProducts(storeId);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">New Arrivals</h1>
            <p className="text-muted-foreground text-lg">
              Fresh additions to our collection
            </p>
          </div>

          {allProducts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No new arrival products found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-hover transition-all duration-300"
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
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(product);
                        }}
                        className="p-2 rounded-full bg-card shadow-md hover:bg-secondary transition-colors"
                        title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            isInWishlist(product.id)
                              ? "fill-primary text-primary"
                              : "text-foreground"
                          }`}
                        />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product, 1);
                        }}
                        className="p-2 rounded-full bg-card shadow-md hover:bg-secondary transition-colors"
                        title="Add to cart"
                      >
                        <ShoppingBag className="h-5 w-5 text-foreground" />
                      </button>
                    </div>

                    {/* Discount Badge */}
                    {product.discountPrice && (
                      <div className="absolute top-4 left-4 px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </div>
                    )}

                    {/* Tag Badge */}
                    {product.tags && product.tags.length > 0 && (
                      <div className="absolute bottom-4 left-4">
                        <span className="px-2 py-1 bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium rounded capitalize">
                          {product.tags[0].replace('-', ' ')}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <CardHeader>
                    <Link to={`/product/${product.id}`}>
                      <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium text-foreground">{product.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                    </div>
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
                  </CardHeader>

                  <CardContent>
                    <Button className="w-full" size="sm" asChild>
                      <Link to={`/product/${product.id}`}>
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Product
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewArrivalsPage;

