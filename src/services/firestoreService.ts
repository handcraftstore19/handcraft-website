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
          // Get subcategories for this category
          const subcategoriesSnapshot = await getDocs(
            query(
              collection(db, COLLECTIONS.SUBCATEGORIES),
              where('categoryId', '==', data.id)
            )
          );
          const subcategories = subcategoriesSnapshot.docs.map((subDoc) => ({
            id: subDoc.data().id,
            ...subDoc.data(),
          })) as Subcategory[];

          return {
            id: data.id,
            ...data,
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
        
        // Get subcategories
        const subcategoriesSnapshot = await getDocs(
          query(
            collection(db, COLLECTIONS.SUBCATEGORIES),
            where('categoryId', '==', categoryId)
          )
        );
        const subcategories = subcategoriesSnapshot.docs.map((subDoc) => ({
          id: subDoc.data().id,
          ...subDoc.data(),
        })) as Subcategory[];

        return {
          id: data.id,
          ...data,
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
  create: async (category: Omit<Category, 'subcategories'>): Promise<void> => {
    try {
      await addDoc(collection(db, COLLECTIONS.CATEGORIES), {
        ...category,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error creating category:', error);
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

