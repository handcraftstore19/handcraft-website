import { Product, categories } from '@/data/categories';

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

// Get all products from all categories
export function getAllProducts(): Product[] {
  const allProducts: Product[] = [];
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      allProducts.push(...subcategory.products);
    });
  });
  return allProducts;
}

// Search products with typo tolerance
export function searchProducts(query: string, filters?: {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  tags?: string[];
}): Product[] {
  if (!query.trim()) {
    return getAllProducts();
  }

  const allProducts = getAllProducts();
  const queryLower = query.toLowerCase().trim();
  const queryWords = queryLower.split(/\s+/);

  // Score each product
  const scoredProducts = allProducts.map(product => {
    let score = 0;
    const productName = product.name.toLowerCase();
    const productDescription = product.description.toLowerCase();
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
  });

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
}

// Get trending products (best sellers, new arrivals, trending)
export function getTrendingProducts(): Product[] {
  const allProducts = getAllProducts();
  
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
}

// Get search suggestions (products and categories)
export function getSearchSuggestions(query: string): { type: 'product' | 'category'; name: string; id: number; image?: string }[] {
  if (!query.trim() || query.length < 1) {
    // Return trending products when empty
    return getTrendingProducts().slice(0, 6).map(p => ({
      type: 'product' as const,
      name: p.name,
      id: p.id,
      image: p.image
    }));
  }

  const allProducts = getAllProducts();
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
        id: product.id,
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
}

// Get best seller products
export function getBestSellerProducts(): Product[] {
  const allProducts = getAllProducts();
  return allProducts
    .filter(p => p.tags?.includes('best-seller'))
    .sort((a, b) => {
      // Sort by rating first, then by reviews
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    })
    .slice(0, 8);
}

// Get new arrival products
export function getNewArrivalProducts(): Product[] {
  const allProducts = getAllProducts();
  return allProducts
    .filter(p => p.tags?.includes('new-arrival'))
    .sort((a, b) => {
      // Sort by rating first, then by reviews
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviews - a.reviews;
    })
    .slice(0, 8);
}

// Get featured products (trending or high-rated)
export function getFeaturedProducts(): Product[] {
  const allProducts = getAllProducts();
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
}

