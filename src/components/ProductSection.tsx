import { Link } from "react-router-dom";
import { Star, ShoppingBag, Heart, ArrowRight, ChevronRight } from "lucide-react";
import { Product, formatPrice } from "@/data/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWishlist } from "@/contexts/WishlistContext";
import { useState } from "react";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
}

const ProductSection = ({ title, subtitle, products, viewAllLink }: ProductSectionProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  if (products.length === 0) return null;

  // Show only first 4 products
  const displayedProducts = products.slice(0, 4);

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-lg">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Products Grid with View More Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
          {displayedProducts.map((product, index) => (
            <Card
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
          
          {/* Circular View More Button - Beside the cards */}
          {viewAllLink && products.length > 4 && (
            <div className="flex items-center justify-center">
              <Link
                to={viewAllLink}
                className="group flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                title="View More"
              >
                <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;

