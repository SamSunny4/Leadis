/**
 * Handwriting Readability Analyzer
 * Uses Tesseract.js OCR and image analysis to predict readability score (0-1)
 */

import Tesseract from 'tesseract.js';

/**
 * Analyze handwriting readability from an image file
 * @param {File} imageFile - The uploaded image file
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Analysis results with readability score
 */
export async function analyzeHandwriting(imageFile, onProgress = () => {}) {
  try {
    // Convert file to data URL for processing
    const imageDataUrl = await fileToDataUrl(imageFile);
    
    // Run OCR analysis
    onProgress(10);
    const ocrResult = await performOCR(imageDataUrl, (p) => {
      onProgress(10 + p * 0.6); // OCR takes 60% of progress
    });
    
    // Perform image quality analysis
    onProgress(75);
    const imageMetrics = await analyzeImageQuality(imageDataUrl);
    
    // Calculate final readability score
    onProgress(90);
    const readabilityScore = calculateReadabilityScore(ocrResult, imageMetrics);
    
    onProgress(100);
    
    return {
      readabilityScore: Math.round(readabilityScore * 100) / 100,
      confidence: ocrResult.confidence,
      extractedText: ocrResult.text,
      wordCount: ocrResult.wordCount,
      lineCount: ocrResult.lineCount,
      metrics: {
        ocrConfidence: ocrResult.confidence,
        textDensity: imageMetrics.textDensity,
        contrastScore: imageMetrics.contrastScore,
        lineConsistency: imageMetrics.lineConsistency,
      },
      findings: generateFindings(readabilityScore, ocrResult, imageMetrics),
    };
  } catch (error) {
    console.error('Handwriting analysis error:', error);
    throw new Error('Failed to analyze handwriting: ' + error.message);
  }
}

/**
 * Convert File to Data URL
 */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Perform OCR using Tesseract.js
 */
async function performOCR(imageDataUrl, onProgress) {
  const worker = await Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && m.progress) {
        onProgress(m.progress * 100);
      }
    },
  });

  try {
    const { data } = await worker.recognize(imageDataUrl);
    
    // Extract metrics from OCR result
    const words = data.words || [];
    const lines = data.lines || [];
    
    // Calculate average word confidence
    let totalConfidence = 0;
    let validWords = 0;
    
    words.forEach(word => {
      if (word.confidence > 0) {
        totalConfidence += word.confidence;
        validWords++;
      }
    });
    
    const avgConfidence = validWords > 0 ? totalConfidence / validWords : 0;
    
    await worker.terminate();
    
    return {
      text: data.text.trim(),
      confidence: avgConfidence / 100, // Normalize to 0-1
      wordCount: validWords,
      lineCount: lines.length,
      words: words.map(w => ({
        text: w.text,
        confidence: w.confidence / 100,
        bbox: w.bbox,
      })),
      lines: lines.map(l => ({
        text: l.text,
        confidence: l.confidence / 100,
        bbox: l.bbox,
      })),
    };
  } catch (error) {
    await worker.terminate();
    throw error;
  }
}

/**
 * Analyze image quality metrics
 */
async function analyzeImageQuality(imageDataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      // Calculate contrast score
      const contrastScore = calculateContrast(pixels);
      
      // Calculate text density (non-white pixels ratio)
      const textDensity = calculateTextDensity(pixels);
      
      // Estimate line consistency
      const lineConsistency = estimateLineConsistency(imageData);
      
      resolve({
        contrastScore,
        textDensity,
        lineConsistency,
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = () => {
      resolve({
        contrastScore: 0.5,
        textDensity: 0.5,
        lineConsistency: 0.5,
        width: 0,
        height: 0,
      });
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Calculate image contrast
 */
function calculateContrast(pixels) {
  let min = 255;
  let max = 0;
  
  for (let i = 0; i < pixels.length; i += 4) {
    // Convert to grayscale
    const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    min = Math.min(min, gray);
    max = Math.max(max, gray);
  }
  
  // Normalize contrast to 0-1
  const contrast = (max - min) / 255;
  return Math.min(1, contrast * 1.2); // Boost slightly for readability
}

/**
 * Calculate text density (darker pixels ratio)
 */
function calculateTextDensity(pixels) {
  let darkPixels = 0;
  const totalPixels = pixels.length / 4;
  const threshold = 200; // Consider pixels below this as "text"
  
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    if (gray < threshold) {
      darkPixels++;
    }
  }
  
  // Ideal text density is around 10-30%
  const density = darkPixels / totalPixels;
  
  // Score peaks at ~20% density
  if (density < 0.05) return density * 4; // Too sparse
  if (density > 0.5) return Math.max(0, 1 - (density - 0.5)); // Too dense
  if (density <= 0.2) return 0.2 + (density * 4);
  return 1 - ((density - 0.2) / 0.3) * 0.2;
}

/**
 * Estimate line consistency by analyzing horizontal pixel distribution
 */
function estimateLineConsistency(imageData) {
  const { data, width, height } = imageData;
  const rowDensities = [];
  
  // Calculate density per row
  for (let y = 0; y < height; y++) {
    let rowDark = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (gray < 200) rowDark++;
    }
    rowDensities.push(rowDark / width);
  }
  
  // Find peaks (text lines) and gaps (line spacing)
  const peaks = [];
  const threshold = 0.05;
  
  for (let i = 0; i < rowDensities.length; i++) {
    if (rowDensities[i] > threshold) {
      peaks.push(i);
    }
  }
  
  if (peaks.length < 2) return 0.5; // Not enough data
  
  // Calculate spacing consistency
  const gaps = [];
  let inLine = false;
  let lineStart = 0;
  
  for (let i = 0; i < rowDensities.length; i++) {
    if (rowDensities[i] > threshold && !inLine) {
      if (lineStart > 0) {
        gaps.push(i - lineStart);
      }
      inLine = true;
      lineStart = i;
    } else if (rowDensities[i] <= threshold && inLine) {
      lineStart = i;
      inLine = false;
    }
  }
  
  if (gaps.length < 2) return 0.6;
  
  // Calculate standard deviation of gaps
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower std dev = more consistent = higher score
  const consistency = Math.max(0, 1 - (stdDev / avgGap));
  return Math.min(1, consistency);
}

/**
 * Calculate final readability score (0-1)
 */
function calculateReadabilityScore(ocrResult, imageMetrics) {
  // Weight factors
  const weights = {
    ocrConfidence: 0.40,    // OCR confidence is most important
    textDensity: 0.15,      // How well-spaced is the text
    contrastScore: 0.20,    // Is there good contrast?
    lineConsistency: 0.25,  // Are lines evenly spaced?
  };
  
  // Calculate weighted score
  let score = 0;
  score += ocrResult.confidence * weights.ocrConfidence;
  score += imageMetrics.textDensity * weights.textDensity;
  score += imageMetrics.contrastScore * weights.contrastScore;
  score += imageMetrics.lineConsistency * weights.lineConsistency;
  
  // Bonus for having detectable text
  if (ocrResult.wordCount > 0) {
    score = Math.min(1, score + 0.05);
  }
  
  // Penalty for very few words detected
  if (ocrResult.wordCount < 3 && ocrResult.confidence < 0.5) {
    score *= 0.7;
  }
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Generate human-readable findings
 */
function generateFindings(readabilityScore, ocrResult, imageMetrics) {
  const findings = [];
  
  // Readability assessment
  if (readabilityScore >= 0.8) {
    findings.push({
      type: 'positive',
      message: 'Excellent handwriting clarity - easily readable',
    });
  } else if (readabilityScore >= 0.6) {
    findings.push({
      type: 'positive',
      message: 'Good handwriting clarity - mostly readable',
    });
  } else if (readabilityScore >= 0.4) {
    findings.push({
      type: 'warning',
      message: 'Moderate readability - some characters may be unclear',
    });
  } else {
    findings.push({
      type: 'concern',
      message: 'Low readability - handwriting may need attention',
    });
  }
  
  // Line consistency
  if (imageMetrics.lineConsistency >= 0.7) {
    findings.push({
      type: 'positive',
      message: 'Consistent line spacing detected',
    });
  } else if (imageMetrics.lineConsistency < 0.4) {
    findings.push({
      type: 'warning',
      message: 'Irregular line spacing - lines may be uneven',
    });
  }
  
  // Text density
  if (imageMetrics.textDensity >= 0.7) {
    findings.push({
      type: 'positive',
      message: 'Good letter spacing and word formation',
    });
  } else if (imageMetrics.textDensity < 0.3) {
    findings.push({
      type: 'info',
      message: 'Sparse text detected - ensure image captures full writing',
    });
  }
  
  // OCR confidence
  if (ocrResult.confidence >= 0.7) {
    findings.push({
      type: 'positive',
      message: 'Characters are well-formed and recognizable',
    });
  } else if (ocrResult.confidence < 0.4) {
    findings.push({
      type: 'warning',
      message: 'Some characters are difficult to recognize',
    });
  }
  
  // Word count info
  if (ocrResult.wordCount > 0) {
    findings.push({
      type: 'info',
      message: `Detected approximately ${ocrResult.wordCount} words across ${ocrResult.lineCount} lines`,
    });
  }
  
  return findings;
}

/**
 * Get readability level label
 */
export function getReadabilityLabel(score) {
  if (score >= 0.8) return { label: 'Excellent', color: '#22c55e' };
  if (score >= 0.6) return { label: 'Good', color: '#84cc16' };
  if (score >= 0.4) return { label: 'Fair', color: '#eab308' };
  if (score >= 0.2) return { label: 'Needs Improvement', color: '#f97316' };
  return { label: 'Difficult to Read', color: '#ef4444' };
}
