/**
 * Firebase Storage Service
 * Handles image uploads to Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { compressImageToBase64 } from '@/lib/imageCompressor';

/**
 * Upload product image to Firebase Storage
 * @param file - Image file to upload
 * @param productId - Product ID (for organizing files)
 * @returns Download URL of uploaded image
 */
export const uploadProductImage = async (
  file: File,
  productId?: string | number
): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Compress image (max 1MB)
    const compressedBase64 = await compressImageToBase64(file, 1024 * 1024); // 1MB
    
    // Convert base64 back to blob for upload
    const response = await fetch(compressedBase64);
    const blob = await response.blob();

    // Create storage reference
    const timestamp = Date.now();
    const fileName = productId 
      ? `products/${productId}/${timestamp}_${file.name}`
      : `products/${timestamp}_${file.name}`;
    
    const storageRef = ref(storage, fileName);

    // Upload file
    await uploadBytes(storageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading product image:', error);
    throw error;
  }
};

/**
 * Delete product image from Firebase Storage
 * @param imageUrl - URL of image to delete
 */
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const path = decodeURIComponent(url.pathname.split('/o/')[1]?.split('?')[0] || '');
    
    if (!path) {
      throw new Error('Invalid image URL');
    }

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting product image:', error);
    throw error;
  }
};

/**
 * Upload category/subcategory image as base64 (for smaller images)
 * @param file - Image file
 * @returns Base64 string
 */
export const uploadImageAsBase64 = async (file: File): Promise<string> => {
  try {
    // Compress to base64 (max 500KB for categories)
    const base64 = await compressImageToBase64(file, 500 * 1024);
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

