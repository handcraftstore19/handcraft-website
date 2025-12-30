import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts, getTrendingProducts } from '@/lib/searchUtils';
import { Product, formatPrice } from '@/data/categories';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Star, ShoppingBag, Heart, Filter, X } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { categoryService } from '@/services/firestoreService';
import { Category } from '@/data/categories';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    categoryId: undefined as number | undefined,
    minPrice: 0,
    maxPrice: 50000,
    minRating: 0,
    tags: [] as string[]
  });
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryService.getAll();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (query) {
        const results = await searchProducts(query, filters);
        setProducts(results);
      } else {
        // Show trending products when search is empty
        const trending = await getTrendingProducts();
        setProducts(trending);
      }
    };

    fetchProducts();
  }, [query, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      categoryId: undefined,
      minPrice: 0,
      maxPrice: 50000,
      minRating: 0,
      tags: []
    });
  };

  const tagOptions = ['best-seller', 'new-arrival', 'trending', 'limited-edition'];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Search Results Header */}
          <div className="mb-6">
            {query ? (
              <>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                  Search Results for "{query}"
                </h1>
                <p className="text-muted-foreground">
                  {products.length > 0 
                    ? `Found ${products.length} product${products.length !== 1 ? 's' : ''}`
                    : 'No products found'}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                  Trending Products
                </h1>
                <p className="text-muted-foreground">
                  Discover our best sellers and new arrivals
                </p>
              </>
            )}
          </div>

          {/* Filters Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              {products.length > 0 && (
                <p className="text-muted-foreground">
                  Found {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <Card className="w-64 flex-shrink-0 h-fit sticky top-24">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Filters</CardTitle>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={filters.categoryId?.toString() || 'all'}
                      onValueChange={(value) =>
                        handleFilterChange('categoryId', value === 'all' ? undefined : Number(value))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label>Price Range</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[filters.minPrice, filters.maxPrice]}
                        onValueChange={([min, max]) => {
                          handleFilterChange('minPrice', min);
                          handleFilterChange('maxPrice', max);
                        }}
                        max={50000}
                        step={100}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatPrice(filters.minPrice)}</span>
                        <span>{formatPrice(filters.maxPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <Label>Minimum Rating</Label>
                    <Select
                      value={filters.minRating.toString()}
                      onValueChange={(value) => handleFilterChange('minRating', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags Filter */}
                  <div>
                    <Label>Tags</Label>
                    <div className="space-y-2 mt-2">
                      {tagOptions.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={filters.tags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange('tags', [...filters.tags, tag]);
                              } else {
                                handleFilterChange('tags', filters.tags.filter(t => t !== tag));
                              }
                            }}
                          />
                          <Label htmlFor={tag} className="text-sm font-normal capitalize">
                            {tag.replace('-', ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Products Grid */}
            <div className="flex-1">
              {products.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {query ? 'No products found' : 'No trending products available'}
                    </h3>
                    <p className="text-muted-foreground">
                      {query ? 'Try adjusting your search or filters' : 'Check back later for trending products'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group">
                      <Link to={`/product/${product.id}`}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      </Link>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link to={`/product/${product.id}`}>
                              <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {product.name}
                              </CardTitle>
                            </Link>
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span className="text-sm font-medium">{product.rating}</span>
                              <span className="text-sm text-muted-foreground">({product.reviews})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {product.discountPrice ? (
                                <>
                                  <p className="text-xl font-semibold text-foreground">
                                    {formatPrice(product.discountPrice)}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-through">
                                    {formatPrice(product.price)}
                                  </p>
                                </>
                              ) : (
                                <p className="text-xl font-semibold text-foreground">
                                  {formatPrice(product.price)}
                                </p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleWishlist(product);
                            }}
                            className="p-2 rounded-full hover:bg-secondary transition-colors"
                          >
                            <Heart
                              className={`h-5 w-5 ${
                                isInWishlist(product.id)
                                  ? 'fill-primary text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full" size="sm">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;

