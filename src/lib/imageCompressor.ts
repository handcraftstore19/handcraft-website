/**
 * Image Compressor Utility
 * Compresses images to max 1MB and converts to base64
 */

export interface CompressOptions {
  maxSizeMB?: number; // Default: 1MB
  maxWidthOrHeight?: number; // Default: 1920px
  quality?: number; // Default: 0.8 (0-1)
}

export interface CompressResult {
  base64: string;
  originalSize: number;
  compressedSize: number;
  file: File;
}

const MAX_SIZE_MB = 1; // 1MB
const MAX_WIDTH_HEIGHT = 1920;
const DEFAULT_QUALITY = 0.8;

/**
 * Compress image file to base64
 */
export const compressImageToBase64 = async (
  file: File,
  options: CompressOptions = {}
): Promise<CompressResult> => {
  const {
    maxSizeMB = MAX_SIZE_MB,
    maxWidthOrHeight = MAX_WIDTH_HEIGHT,
    quality = DEFAULT_QUALITY,
  } = options;

  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const originalSize = file.size;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    // If file is already small enough, just convert to base64
    if (originalSize <= maxSizeBytes) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve({
          base64,
          originalSize,
          compressedSize: originalSize,
          file,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    // Compress image
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
          if (width > height) {
            height = (height / width) * maxWidthOrHeight;
            width = maxWidthOrHeight;
          } else {
            width = (width / height) * maxWidthOrHeight;
            height = maxWidthOrHeight;
          }
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels until we get under max size
        let currentQuality = quality;
        let compressedBase64 = '';
        let compressedSize = 0;
        let attempts = 0;
        const maxAttempts = 10;

        const tryCompress = () => {
          compressedBase64 = canvas.toDataURL(file.type, currentQuality);
          compressedSize = new Blob([compressedBase64]).size;

          if (compressedSize <= maxSizeBytes || attempts >= maxAttempts) {
            resolve({
              base64: compressedBase64,
              originalSize,
              compressedSize,
              file,
            });
          } else {
            // Reduce quality and try again
            currentQuality -= 0.1;
            attempts++;
            tryCompress();
          }
        };

        tryCompress();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (before compression)
  const maxSizeMB = 10; // Allow up to 10MB before compression
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `Image must be less than ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Get file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

