/**
 * Firestore Service
 * Handles all Firestore database operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Category, Subcategory } from '@/data/categories';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SUBCATEGORIES: 'subcategories',
  ORDERS: 'orders',
  REVIEWS: 'reviews',
  WISHLISTS: 'wishlists',
  COUPONS: 'coupons',
  CAROUSELS: 'carousels',
} as const;

// Convert Firestore timestamp to date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return new Date();
};

// Product Operations
export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      return snapshot.docs.map((doc) => ({
        id: parseInt(doc.id) || doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Get product by ID
  getById: async (productId: string | number): Promise<Product | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, String(productId));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: parseInt(docSnap.id) || docSnap.id,
          ...docSnap.data(),
        } as Product;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  // Get products by category
  getByCategory: async (categoryId: number): Promise<Product[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('categoryId', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: parseInt(doc.id) || doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw error;
    }
  },

  // Get products by subcategory
  getBySubcategory: async (categoryId: number, subcategoryId: number): Promise<Product[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('categoryId', '==', categoryId),
        where('subcategoryId', '==', subcategoryId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: parseInt(doc.id) || doc.id,
        ...doc.data(),
      })) as Product[];
    } catch (error) {
      console.error('Error getting products by subcategory:', error);
      throw error;
    }
  },

  // Create product
  create: async (product: Omit<Product, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  update: async (productId: string | number, updates: Partial<Product>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, String(productId));
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  delete: async (productId: string | number): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, String(productId));
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },
};

// Category Operations
export const categoryService = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
      const categories = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Convert iconName and image to strings if they're objects
          let iconName = data.iconName;
          if (typeof iconName === 'object' && iconName !== null) {
            iconName = iconName.toString() || '';
          } else if (iconName === undefined || iconName === null) {
            iconName = '';
          } else {
            iconName = String(iconName);
          }

          let image = data.image;
          if (typeof image === 'object' && image !== null) {
            image = image.toString() || '';
          } else if (image === undefined || image === null) {
            image = '';
          } else {
            image = String(image);
          }

          // Get subcategories for this category
          const subcategoriesSnapshot = await getDocs(
            query(
              collection(db, COLLECTIONS.SUBCATEGORIES),
              where('categoryId', '==', data.id)
            )
          );
          const subcategories = subcategoriesSnapshot.docs.map((subDoc) => {
            const subData = subDoc.data();
            // Convert iconName to string for subcategories too
            let subIconName = subData.iconName;
            if (typeof subIconName === 'object' && subIconName !== null) {
              subIconName = subIconName.toString() || '';
            } else if (subIconName === undefined || subIconName === null) {
              subIconName = '';
            } else {
              subIconName = String(subIconName);
            }

            let subImage = subData.image;
            if (typeof subImage === 'object' && subImage !== null) {
              subImage = subImage.toString() || '';
            } else if (subImage === undefined || subImage === null) {
              subImage = '';
            } else {
              subImage = String(subImage);
            }

            return {
              id: subData.id,
              name: subData.name || '',
              productCount: subData.productCount || 0,
              products: [],
              iconName: subIconName,
              image: subImage,
              categoryId: subData.categoryId,
              availableAt: subData.availableAt,
            } as Subcategory;
          });

          return {
            id: data.id,
            ...data,
            iconName,
            image,
            subcategories,
          } as Category;
        })
      );
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getById: async (categoryId: number): Promise<Category | null> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.CATEGORIES),
        where('id', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        
        // Convert iconName and image to strings if they're objects
        let iconName = data.iconName;
        if (typeof iconName === 'object' && iconName !== null) {
          iconName = iconName.toString() || '';
        } else if (iconName === undefined || iconName === null) {
          iconName = '';
        } else {
          iconName = String(iconName);
        }

        let image = data.image;
        if (typeof image === 'object' && image !== null) {
          image = image.toString() || '';
        } else if (image === undefined || image === null) {
          image = '';
        } else {
          image = String(image);
        }
        
        // Get subcategories
        const subcategoriesSnapshot = await getDocs(
          query(
            collection(db, COLLECTIONS.SUBCATEGORIES),
            where('categoryId', '==', categoryId)
          )
        );
        const subcategories = subcategoriesSnapshot.docs.map((subDoc) => {
          const subData = subDoc.data();
          // Convert iconName to string for subcategories too
          let subIconName = subData.iconName;
          if (typeof subIconName === 'object' && subIconName !== null) {
            subIconName = subIconName.toString() || '';
          } else if (subIconName === undefined || subIconName === null) {
            subIconName = '';
          } else {
            subIconName = String(subIconName);
          }

          let subImage = subData.image;
          if (typeof subImage === 'object' && subImage !== null) {
            subImage = subImage.toString() || '';
          } else if (subImage === undefined || subImage === null) {
            subImage = '';
          } else {
            subImage = String(subImage);
          }

          return {
            id: subData.id,
            name: subData.name || '',
            productCount: subData.productCount || 0,
            products: [],
            iconName: subIconName,
            image: subImage,
            categoryId: subData.categoryId,
            availableAt: subData.availableAt,
          } as Subcategory;
        });

        return {
          id: data.id,
          ...data,
          iconName,
          image,
          subcategories,
        } as Category;
      }
      return null;
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  },

  // Create category
  create: async (category: Omit<Category, 'subcategories'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  update: async (categoryId: number, updates: Partial<Category>): Promise<void> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.CATEGORIES),
        where('id', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } else {
        throw new Error('Category not found');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  delete: async (categoryId: number): Promise<void> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.CATEGORIES),
        where('id', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
      } else {
        throw new Error('Category not found');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

// Subcategory Operations
export const subcategoryService = {
  // Get all subcategories for a category
  getByCategory: async (categoryId: number): Promise<Subcategory[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.SUBCATEGORIES),
        where('categoryId', '==', categoryId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.data().id,
        ...doc.data(),
      })) as Subcategory[];
    } catch (error) {
      console.error('Error getting subcategories:', error);
      throw error;
    }
  },

  // Get subcategory by ID
  getById: async (subcategoryId: number): Promise<Subcategory | null> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.SUBCATEGORIES),
        where('id', '==', subcategoryId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        return {
          id: snapshot.docs[0].data().id,
          ...snapshot.docs[0].data(),
        } as Subcategory;
      }
      return null;
    } catch (error) {
      console.error('Error getting subcategory:', error);
      throw error;
    }
  },

  // Create subcategory
  create: async (subcategory: Omit<Subcategory, 'products'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SUBCATEGORIES), {
        ...subcategory,
        products: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  },

  // Update subcategory
  update: async (subcategoryId: number, updates: Partial<Subcategory>): Promise<void> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.SUBCATEGORIES),
        where('id', '==', subcategoryId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      } else {
        throw new Error('Subcategory not found');
      }
    } catch (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }
  },

  // Delete subcategory
  delete: async (subcategoryId: number): Promise<void> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.SUBCATEGORIES),
        where('id', '==', subcategoryId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        await deleteDoc(snapshot.docs[0].ref);
      } else {
        throw new Error('Subcategory not found');
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }
  },
};

// Order Operations
export const orderService = {
  // Get user orders
  getByUser: async (userId: string): Promise<any[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToDate(doc.data().createdAt),
        updatedAt: timestampToDate(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },

  // Get order by ID
  getById: async (orderId: string): Promise<any | null> => {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: timestampToDate(docSnap.data().createdAt),
          updatedAt: timestampToDate(docSnap.data().updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },

  // Get all orders (for admin)
  getAll: async (): Promise<any[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.ORDERS),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToDate(doc.data().createdAt),
        updatedAt: timestampToDate(doc.data().updatedAt),
      }));
    } catch (error) {
      console.error('Error getting all orders:', error);
      throw error;
    }
  },

  // Update order status
  updateStatus: async (orderId: string, status: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.ORDERS, orderId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      
      // Note: SMS notification should be sent from Cloud Functions
      // or backend service when status changes
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
};

// Review Operations
export const reviewService = {
  // Get reviews for a product
  getByProduct: async (productId: number): Promise<any[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.REVIEWS),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: timestampToDate(doc.data().createdAt),
      }));
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  },

  // Create review
  create: async (review: {
    productId: number;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
  }): Promise<void> => {
    try {
      await addDoc(collection(db, COLLECTIONS.REVIEWS), {
        ...review,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
};

// Wishlist Operations
export const wishlistService = {
  // Get user wishlist
  getByUser: async (userId: string): Promise<Product[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.WISHLISTS),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const productIds = snapshot.docs.map((doc) => doc.data().productId);
      
      // Get products
      const products = await Promise.all(
        productIds.map((id) => productService.getById(id))
      );
      
      return products.filter((p): p is Product => p !== null);
    } catch (error) {
      console.error('Error getting wishlist:', error);
      throw error;
    }
  },

  // Add to wishlist
  add: async (userId: string, productId: number): Promise<void> => {
    try {
      await addDoc(collection(db, COLLECTIONS.WISHLISTS), {
        userId,
        productId,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  },

  // Remove from wishlist
  remove: async (userId: string, productId: number): Promise<void> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.WISHLISTS),
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);
      
      await Promise.all(snapshot.docs.map((doc) => deleteDoc(doc.ref)));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  },
};

// Coupon Operations
export const couponService = {
  // Get all coupons
  getAll: async (): Promise<any[]> => {
    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.COUPONS));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        expiry: doc.data().expiry?.toDate?.()?.toISOString()?.split('T')[0] || doc.data().expiry,
      }));
    } catch (error) {
      console.error('Error getting coupons:', error);
      throw error;
    }
  },

  // Create coupon
  create: async (coupon: {
    code: string;
    type: 'percentage' | 'flat';
    value: number;
    minOrder: number;
    maxDiscount?: number;
    usageLimit: number;
    active: boolean;
    expiry: string;
  }): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.COUPONS), {
        ...coupon,
        used: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  },

  // Update coupon
  update: async (couponId: string, updates: Partial<any>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.COUPONS, couponId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  // Delete coupon
  delete: async (couponId: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.COUPONS, couponId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  },
};

// Carousel Operations
export const carouselService = {
  // Get all carousels
  getAll: async (): Promise<any[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.CAROUSELS),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error getting carousels:', error);
      throw error;
    }
  },

  // Create carousel
  create: async (carousel: {
    title: string;
    subtitle: string;
    image: string;
    link: string;
    active: boolean;
    order: number;
  }): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.CAROUSELS), {
        ...carousel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating carousel:', error);
      throw error;
    }
  },

  // Update carousel
  update: async (carouselId: string, updates: Partial<any>): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.CAROUSELS, carouselId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating carousel:', error);
      throw error;
    }
  },

  // Delete carousel
  delete: async (carouselId: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTIONS.CAROUSELS, carouselId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting carousel:', error);
      throw error;
    }
  },
};

