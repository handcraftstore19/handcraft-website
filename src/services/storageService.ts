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
    const compressResult = await compressImageToBase64(file, { maxSizeMB: 1 }); // 1MB
    
    // Convert base64 data URL to blob
    const base64Response = await fetch(compressResult.base64);
    if (!base64Response.ok) {
      throw new Error('Failed to convert base64 to blob');
    }
    const blob = await base64Response.blob();

    // Create storage reference
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = productId 
      ? `products/${productId}/${timestamp}_${sanitizedFileName}`
      : `products/${timestamp}_${sanitizedFileName}`;
    
    const storageRef = ref(storage, fileName);

    // Upload file
    console.log('Uploading image to Firebase Storage:', fileName);
    await uploadBytes(storageRef, blob);
    console.log('Image uploaded successfully');

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    if (!downloadURL || !downloadURL.startsWith('https://')) {
      throw new Error('Invalid download URL received from Firebase Storage');
    }
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading product image:', error);
    throw new Error(error.message || 'Failed to upload image to Firebase Storage');
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
 * Upload carousel image to Firebase Storage
 * @param file - Image file to upload
 * @param carouselId - Carousel ID (for organizing files, optional)
 * @returns Download URL of uploaded image
 */
export const uploadCarouselImage = async (
  file: File,
  carouselId?: string
): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Compress image (max 2MB for carousels - they can be larger)
    const compressResult = await compressImageToBase64(file, { maxSizeMB: 2 }); // 2MB
    
    // Convert base64 data URL to blob
    const base64Response = await fetch(compressResult.base64);
    if (!base64Response.ok) {
      throw new Error('Failed to convert base64 to blob');
    }
    const blob = await base64Response.blob();

    // Create storage reference
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = carouselId 
      ? `carousels/${carouselId}/${timestamp}_${sanitizedFileName}`
      : `carousels/${timestamp}_${sanitizedFileName}`;
    
    const storageRef = ref(storage, fileName);

    // Upload file
    console.log('Uploading carousel image to Firebase Storage:', fileName);
    await uploadBytes(storageRef, blob);
    console.log('Carousel image uploaded successfully');

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    if (!downloadURL || !downloadURL.startsWith('https://')) {
      throw new Error('Invalid download URL received from Firebase Storage');
    }
    
    return downloadURL;
  } catch (error: any) {
    console.error('Error uploading carousel image:', error);
    throw new Error(error.message || 'Failed to upload image to Firebase Storage');
  }
};

/**
 * Delete carousel image from Firebase Storage
 * @param imageUrl - URL of image to delete
 */
export const deleteCarouselImage = async (imageUrl: string): Promise<void> => {
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
    console.error('Error deleting carousel image:', error);
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
    const compressResult = await compressImageToBase64(file, { maxSizeMB: 0.5 });
    return compressResult.base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

