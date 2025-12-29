import { Product, StoreAvailability } from '@/data/categories';
import { productService, categoryService } from '@/services/firestoreService';

// Helper function to check if product is available at store
function isProductAvailableAtStore(product: Product, storeId: string | null): boolean {
  if (!storeId) return true; // If no store selected, show all products
  
  // Default availability: Hyderabad ON, others OFF
  const defaultAvailability: StoreAvailability = {
    hyderabad: true,
    vizag: false,
    warangal: false
  };
  
  const availability = product.availableAt || defaultAvailability;
  return availability[storeId as keyof StoreAvailability] ?? false;
}

// Helper function to check if category is available at store
function isCategoryAvailableAtStore(category: { availableAt?: StoreAvailability }, storeId: string | null): boolean {
  if (!storeId) return true;
  const defaultAvailability: StoreAvailability = {
    hyderabad: true,
    vizag: false,
    warangal: false
  };
  const availability = category.availableAt || defaultAvailability;
  return availability[storeId as keyof StoreAvailability] ?? false;
}

// Helper function to check if subcategory is available at store
function isSubcategoryAvailableAtStore(subcategory: { availableAt?: StoreAvailability }, storeId: string | null): boolean {
  if (!storeId) return true;
  const defaultAvailability: StoreAvailability = {
    hyderabad: true,
    vizag: false,
    warangal: false
  };
  const availability = subcategory.availableAt || defaultAvailability;
  return availability[storeId as keyof StoreAvailability] ?? false;
}

// Levenshtein distance for typo tolerance
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[len1][len2];
}

// Calculate similarity score (0-1)
function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - distance / maxLen;
}

// Get all products from Firestore
export async function getAllProducts(storeId: string | null = null): Promise<Product[]> {
  try {
    const allProducts = await productService.getAll();
    
    // Filter by store availability
    if (storeId) {
      return allProducts.filter(product => isProductAvailableAtStore(product, storeId));
    }
    
    return allProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Search products with typo tolerance
export async function searchProducts(query: string, filters?: {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
  storeId?: string | null;
}): Promise<Product[]> {
  const storeId = filters?.storeId ?? null;
  
  try {
    let allProducts = await getAllProducts(storeId);
    
    if (!query.trim()) {
      // Apply filters even without query
      if (filters?.categoryId) {
        allProducts = allProducts.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters?.minPrice) {
        allProducts = allProducts.filter(p => p.price >= filters.minPrice!);
      }
      if (filters?.maxPrice) {
        allProducts = allProducts.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters?.minRating) {
        allProducts = allProducts.filter(p => p.rating >= filters.minRating!);
      }
      if (filters?.tags && filters.tags.length > 0) {
        allProducts = allProducts.filter(p => 
          p.tags && filters.tags!.some(tag => p.tags?.includes(tag as any))
        );
      }
      return allProducts;
    }

    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/);

    // Get categories for matching
    const categories = await categoryService.getAll();

    // Score each product
    const scoredProducts = await Promise.all(allProducts.map(async (product) => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDescription = (product.description || '').toLowerCase();
      const category = categories.find(c => c.id === product.categoryId);
      const categoryName = category?.name.toLowerCase() || '';
      const subcategory = category?.subcategories.find(s => s.id === product.subcategoryId);
      const subcategoryName = subcategory?.name.toLowerCase() || '';

      // Exact match gets highest score
      if (productName.includes(queryLower)) {
        score += 100;
      }
      if (categoryName.includes(queryLower) || subcategoryName.includes(queryLower)) {
        score += 80;
      }
      if (productDescription.includes(queryLower)) {
        score += 40;
      }

      // Word-by-word matching
      queryWords.forEach(word => {
        if (productName.includes(word)) score += 30;
        if (categoryName.includes(word) || subcategoryName.includes(word)) score += 20;
        if (productDescription.includes(word)) score += 10;
      });

      // Fuzzy matching with typo tolerance
      const nameSimilarity = similarity(queryLower, productName);
      if (nameSimilarity > 0.6) {
        score += nameSimilarity * 50;
      }

      const categorySimilarity = similarity(queryLower, categoryName);
      if (categorySimilarity > 0.6) {
        score += categorySimilarity * 30;
      }

      // Check if query is similar to common misspellings
      const commonMisspellings: Record<string, string[]> = {
        'decorative': ['decarative', 'decoritive', 'decorativ'],
        'trophy': ['trophie', 'trophies', 'trophy'],
        'medal': ['medel', 'medle', 'medals'],
        'momento': ['momentos', 'mementos', 'memento'],
        'home': ['hom', 'hme'],
        'wall': ['wal', 'wll'],
        'art': ['arte', 'arts']
      };

      Object.entries(commonMisspellings).forEach(([correct, misspellings]) => {
        if (misspellings.some(misspelling => queryLower.includes(misspelling))) {
          if (productName.includes(correct) || categoryName.includes(correct)) {
            score += 60;
          }
        }
      });

      return { product, score };
    }));

    // Filter by additional criteria
    let filtered = scoredProducts.filter(({ product }) => {
      if (filters?.categoryId && product.categoryId !== filters.categoryId) return false;
      if (filters?.minPrice && product.price < filters.minPrice) return false;
      if (filters?.maxPrice && product.price > filters.maxPrice) return false;
      if (filters?.minRating && product.rating < filters.minRating) return false;
      if (filters?.tags && filters.tags.length > 0) {
        if (!product.tags || !filters.tags.some(tag => product.tags?.includes(tag as any))) {
          return false;
        }
      }
      return true;
    });

    // Sort by score and return products
    return filtered
      .sort((a, b) => b.score - a.score)
      .filter(({ score }) => score > 0)
      .map(({ product }) => product);
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

// Get trending products (best sellers, new arrivals, trending)
export async function getTrendingProducts(storeId: string | null = null): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts(storeId);
    
    // Prioritize products with tags
    const trending = allProducts
      .filter(p => p.tags && p.tags.length > 0)
      .sort((a, b) => {
        // Prioritize best-seller, then trending, then new-arrival
        const aScore = (a.tags?.includes('best-seller') ? 3 : 0) +
                       (a.tags?.includes('trending') ? 2 : 0) +
                       (a.tags?.includes('new-arrival') ? 1 : 0);
        const bScore = (b.tags?.includes('best-seller') ? 3 : 0) +
                       (b.tags?.includes('trending') ? 2 : 0) +
                       (b.tags?.includes('new-arrival') ? 1 : 0);
        
        if (bScore !== aScore) return bScore - aScore;
        // Then by rating
        return b.rating - a.rating;
      })
      .slice(0, 8);
    
    // If not enough tagged products, add high-rated products
    if (trending.length < 8) {
      const highRated = allProducts
        .filter(p => !trending.includes(p))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8 - trending.length);
      trending.push(...highRated);
    }
    
    return trending;
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return [];
  }
}

// Get search suggestions (products and categories)
export async function getSearchSuggestions(query: string): Promise<{ type: 'product' | 'category'; name: string; id: number; image?: string }[]> {
  // Note: getSearchSuggestions doesn't filter by store to show all suggestions
  // Store filtering happens at the product listing level
  try {
    if (!query.trim() || query.length < 1) {
      // Return trending products when empty
      const trending = await getTrendingProducts(null);
      return trending.slice(0, 6).map(p => ({
        type: 'product' as const,
        name: p.name,
        id: typeof p.id === 'number' ? p.id : parseInt(p.id) || 0,
        image: p.image
      }));
    }

    const allProducts = await getAllProducts(null);
    const categories = await categoryService.getAll();
    const suggestions: { type: 'product' | 'category'; name: string; id: number; image?: string }[] = [];
    const queryLower = query.toLowerCase();
    const seen = new Set<string>();

    // Add matching products
    allProducts.forEach(product => {
      const productName = product.name.toLowerCase();
      if (productName.includes(queryLower) && !seen.has(product.name)) {
        suggestions.push({
          type: 'product',
          name: product.name,
          id: typeof product.id === 'number' ? product.id : parseInt(product.id) || 0,
          image: product.image
        });
        seen.add(product.name);
      }
    });

    // Add matching categories
    categories.forEach(category => {
      const categoryName = category.name.toLowerCase();
      if (categoryName.includes(queryLower) && !seen.has(category.name)) {
        suggestions.push({
          type: 'category',
          name: category.name,
          id: category.id
        });
        seen.add(category.name);
      }
    });

    return suggestions.slice(0, 8);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}

// Get best seller products
export async function getBestSellerProducts(storeId: string | null = null): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts(storeId);
    return allProducts
      .filter(p => p.tags?.includes('best-seller'))
      .sort((a, b) => {
        // Sort by rating first, then by reviews
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviews - a.reviews;
      })
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching best seller products:', error);
    return [];
  }
}

// Get new arrival products
export async function getNewArrivalProducts(storeId: string | null = null): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts(storeId);
    return allProducts
      .filter(p => p.tags?.includes('new-arrival'))
      .sort((a, b) => {
        // Sort by rating first, then by reviews
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviews - a.reviews;
      })
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching new arrival products:', error);
    return [];
  }
}

// Get featured products (trending or high-rated)
export async function getFeaturedProducts(storeId: string | null = null): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts(storeId);
    return allProducts
      .filter(p => p.tags?.includes('trending') || (!p.tags && p.rating >= 4.5))
      .sort((a, b) => {
        // Prioritize trending, then by rating
        const aTrending = a.tags?.includes('trending') ? 1 : 0;
        const bTrending = b.tags?.includes('trending') ? 1 : 0;
        if (bTrending !== aTrending) return bTrending - aTrending;
        return b.rating - a.rating;
      })
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

