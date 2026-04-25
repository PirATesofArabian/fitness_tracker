import Tesseract from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

/**
 * Extract text from an image using Tesseract.js OCR
 * @param image - File, Blob, or base64 string
 * @param onProgress - Optional callback for progress updates
 * @returns Extracted text and confidence score
 */
export async function extractTextFromImage(
  image: File | Blob | string,
  onProgress?: (progress: OCRProgress) => void
): Promise<OCRResult> {
  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: (m: any) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: m.progress || 0,
          });
        }
      },
    });

    // Perform OCR
    const { data } = await worker.recognize(image);

    // Cleanup
    await worker.terminate();

    return {
      text: data.text,
      confidence: data.confidence,
    };
  } catch (error) {
    console.error('OCR extraction failed:', error);
    throw new Error('Failed to extract text from image. Please try again or enter data manually.');
  }
}

/**
 * Validate if image is likely a body composition scan
 * @param text - Extracted OCR text
 * @returns true if image appears to be a valid body scan
 */
export function validateBodyScan(text: string): boolean {
  const lowerText = text.toLowerCase();
  
  console.log('=== OCR Validation Debug ===');
  console.log('Extracted text:', text);
  console.log('Text length:', text.length);
  
  // Core body composition metrics that indicate a valid scan
  const coreMetrics = [
    'body fat', 'bodyfat', 'body_fat', 'fat %', 'fat%', 'fat',
    'muscle mass', 'skeletal muscle', 'lean mass', 'lean body', 'muscle',
    'bmi', 'body mass index', 'mass'
  ];
  
  // Secondary indicators common in body scans
  const secondaryIndicators = [
    'weight', 'kg', 'lbs', 'lb',
    'visceral', 'body water', 'water', 'protein', 'mineral',
    'basal metabolic', 'bmr', 'metabolic rate', 'metabolic',
    'body composition', 'composition', 'impedance', 'analysis'
  ];

  // Count matches
  const coreMatches = coreMetrics.filter(keyword =>
    lowerText.includes(keyword)
  );
  
  const secondaryMatches = secondaryIndicators.filter(keyword =>
    lowerText.includes(keyword)
  );

  console.log('Core matches:', coreMatches);
  console.log('Secondary matches:', secondaryMatches);

  // Check for numeric values (body scans should have many numbers)
  const numberMatches = text.match(/\d+\.?\d*/g);
  const hasEnoughNumbers = !!(numberMatches && numberMatches.length >= 5);
  
  console.log('Number matches:', numberMatches?.length || 0);
  console.log('Has enough numbers:', hasEnoughNumbers);

  // More lenient validation: need at least 1 core metric OR 2 secondary indicators, AND numbers
  const isValid = ((coreMatches.length >= 1 || secondaryMatches.length >= 2) && hasEnoughNumbers);
  
  console.log('Validation result:', isValid);
  console.log('=== End Debug ===');
  
  return isValid;
}

/**
 * Preprocess image for better OCR results
 * @param file - Image file
 * @returns Processed image as base64
 */
export async function preprocessImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Increase canvas size for better OCR (upscale if image is small)
        const scale = Math.max(1, 2000 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw image with scaling
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply aggressive preprocessing for better OCR
        for (let i = 0; i < data.length; i += 4) {
          // Convert to grayscale
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          
          // Increase contrast significantly
          const contrast = 2.0;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          let adjusted = factor * (gray - 128) + 128;
          
          // Apply threshold to reduce noise (binarization)
          // This helps separate text from background
          const threshold = 140;
          adjusted = adjusted > threshold ? 255 : 0;
          
          data[i] = adjusted;
          data[i + 1] = adjusted;
          data[i + 2] = adjusted;
        }
        
        // Put processed image back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to base64
        resolve(canvas.toDataURL('image/png'));
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

