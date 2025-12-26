import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Review {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVisible: boolean;
  orderId?: string; // To verify purchase
}

interface ReviewContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'isVisible'>) => void;
  canUserReview: (productId: number, userId: string) => boolean;
  getProductReviews: (productId: number) => Review[];
  toggleReviewVisibility: (reviewId: string, isVisible: boolean) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

// Mock orders to verify purchases
const mockOrders = [
  { id: 'ORD-001', userId: '1', productIds: [1001] },
  { id: 'ORD-002', userId: '1', productIds: [5001] },
  { id: 'ORD-003', userId: '3', productIds: [1004] },
];

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('reviews');
    if (saved) {
      setReviews(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  const hasPurchasedProduct = (productId: number, userId: string): boolean => {
    return mockOrders.some(
      order => order.userId === userId && order.productIds.includes(productId)
    );
  };

  const canUserReview = (productId: number, userId: string): boolean => {
    // Check if user has purchased the product
    if (!hasPurchasedProduct(productId, userId)) {
      return false;
    }
    // Check if user has already reviewed this product
    return !reviews.some(r => r.productId === productId && r.userId === userId);
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'isVisible'>) => {
    if (!canUserReview(reviewData.productId, reviewData.userId)) {
      throw new Error('You can only review products you have purchased');
    }

    const newReview: Review = {
      ...reviewData,
      id: `review-${Date.now()}`,
      date: new Date().toISOString(),
      isVisible: true, // New reviews are visible by default
    };

    setReviews(prev => [...prev, newReview]);
  };

  const getProductReviews = (productId: number): Review[] => {
    return reviews.filter(r => r.productId === productId && r.isVisible);
  };

  const toggleReviewVisibility = (reviewId: string, isVisible: boolean) => {
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, isVisible } : r))
    );
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        addReview,
        canUserReview,
        getProductReviews,
        toggleReviewVisibility
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

