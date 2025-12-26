import { useParams, Link } from "react-router-dom";
import { ChevronRight, Star, Heart, ShoppingBag, Minus, Plus, Check } from "lucide-react";
import { useState, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getProductById, categories, Product } from "@/data/categories";
import { useWishlist } from "@/contexts/WishlistContext";
import { useReview } from "@/contexts/ReviewContext";
import { useAuth } from "@/contexts/AuthContext";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const result = getProductById(Number(productId));
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { getProductReviews, canUserReview, addReview } = useReview();

  // Get related products (from same category, excluding current product)
  const relatedProducts = useMemo(() => {
    if (!result) return [];
    const { product, category } = result;
    const allProducts: Product[] = [];
    
    category.subcategories.forEach(subcategory => {
      allProducts.push(...subcategory.products);
    });
    
    return allProducts
      .filter(p => p.id !== product.id)
      .sort(() => Math.random() - 0.5) // Shuffle for variety
      .slice(0, 4); // Show 4 related products
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-4">Product Not Found</h1>
            <Link to="/" className="text-primary hover:underline">Return to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { product, category, subcategory } = result;
  const reviews = getProductReviews(product.id);
  const canReview = user ? canUserReview(product.id, user.id) : false;
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating;

  const handleSubmitReview = () => {
    if (!user || !reviewComment.trim()) return;
    
    try {
      addReview({
        productId: product.id,
        userId: user.id,
        userName: user.name,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment("");
      setReviewRating(5);
      setShowReviewForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to submit review');
    }
  };

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
              <Link 
                to={`/category/${category.id}/subcategory/${subcategory.id}`} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {subcategory.name}
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Section */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Product Image */}
              <div className="animate-fade-in">
                <div className="aspect-square rounded-2xl overflow-hidden bg-card shadow-soft">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
                {/* Category Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                    {category.name}
                  </span>
                </div>

                {/* Title */}
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating)
                            ? "fill-primary text-primary"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-semibold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-8">
                  {product.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="font-semibold text-foreground mb-3">Features:</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3 text-muted-foreground">
                        <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-medium text-foreground">Quantity:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Minus className="h-4 w-4 text-foreground" />
                    </button>
                    <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
                    >
                      <Plus className="h-4 w-4 text-foreground" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1 rounded-full">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className={`rounded-full ${isInWishlist(product.id) ? "bg-primary/10 border-primary" : ""}`}
                    onClick={() => toggleWishlist(product)}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isInWishlist(product.id) ? "fill-primary text-primary" : ""}`} />
                    {isInWishlist(product.id) ? "Wishlisted" : "Add to Wishlist"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <section className="py-12 bg-secondary/30">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-8">
                You May Also Like
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="group">
                    <Link to={`/product/${relatedProduct.id}`}>
                      <div className="aspect-square overflow-hidden rounded-t-lg">
                        <img
                          src={relatedProduct.image}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </Link>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link to={`/product/${relatedProduct.id}`}>
                            <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                              {relatedProduct.name}
                            </CardTitle>
                          </Link>
                          <div className="flex items-center gap-2 mb-2">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-medium">{relatedProduct.rating}</span>
                            <span className="text-sm text-muted-foreground">({relatedProduct.reviews})</span>
                          </div>
                          <p className="text-xl font-semibold text-foreground">
                            ${relatedProduct.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(relatedProduct);
                          }}
                          className="p-2 rounded-full hover:bg-secondary transition-colors"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              isInWishlist(relatedProduct.id)
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" size="sm" asChild>
                        <Link to={`/product/${relatedProduct.id}`}>
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          View Product
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Customer Reviews
              </h2>
              {canReview && (
                <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                  Write a Review
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && user && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewRating(rating)}
                          className="p-1"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              rating <= reviewRating
                                ? "fill-primary text-primary"
                                : "text-muted"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Review</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSubmitReview}>Submit Review</Button>
                    <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Summary */}
            <div className="bg-card rounded-2xl p-6 shadow-soft mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(averageRating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-semibold text-foreground">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {!user && (
                <p className="text-muted-foreground">
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>{" "}
                  to leave a review. Only customers who purchased this product can review it.
                </p>
              )}
              {user && !canReview && (
                <p className="text-muted-foreground">
                  You can only review products you have purchased.
                </p>
              )}
            </div>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{review.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-primary text-primary"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
