export interface StoreAvailability {
  hyderabad: boolean;
  vizag: boolean;
  warangal: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  tags?: ('best-seller' | 'new-arrival' | 'trending' | 'limited-edition')[];
  stock: number;
  categoryId: number;
  subcategoryId: number;
  availableAt?: StoreAvailability;
}

export interface Subcategory {
  id: number;
  name: string;
  image: string;
  productCount: number;
  products: Product[];
  availableAt?: StoreAvailability;
}

export interface Category {
  id: number;
  name: string;
  iconName: string;
  image: string;
  description: string;
  subcategories: Subcategory[];
  availableAt?: StoreAvailability;
}

// Mock data removed - all data now comes from Firestore
// Use categoryService, productService, subcategoryService from @/services/firestoreService

export const categories: Category[] = []; // Empty array - data comes from Firestore

// Helper functions removed - use Firestore services instead:
// - categoryService.getById() for categories
// - subcategoryService.getById() for subcategories  
// - productService.getById() for products

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
