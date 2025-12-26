import { Link } from "react-router-dom";
import { Star, ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { Product } from "@/data/categories";
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

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
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
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
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
                        ${product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-semibold text-foreground">
                      ${product.price.toFixed(2)}
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

        {/* Mobile View All Link */}
        {viewAllLink && (
          <div className="mt-8 text-center md:hidden">
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;

