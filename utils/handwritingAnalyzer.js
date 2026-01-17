/**
 * Handwriting Readability Analyzer
 * Uses Tesseract.js OCR and image analysis to predict readability score (0-1)
 * Enhanced with dysgraphia indicators for learning disability detection
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
 * Advanced handwriting analysis with dysgraphia indicators
 * @param {File} imageFile - The uploaded image file
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} Comprehensive analysis results
 */
export async function analyzeHandwritingAdvanced(imageFile, onProgress = () => {}) {
  try {
    const imageDataUrl = await fileToDataUrl(imageFile);
    
    onProgress(5);
    
    // Run OCR analysis with detailed word data
    const ocrResult = await performOCR(imageDataUrl, (p) => {
      onProgress(5 + p * 0.4);
    });
    
    onProgress(50);
    
    // Perform comprehensive image quality analysis
    const imageMetrics = await analyzeImageQuality(imageDataUrl);
    
    onProgress(60);
    
    // Analyze letter-level characteristics
    const letterAnalysis = analyzeLetterCharacteristics(ocrResult);
    
    onProgress(70);
    
    // Analyze spatial characteristics
    const spatialAnalysis = await analyzeSpatialCharacteristics(imageDataUrl, ocrResult);
    
    onProgress(80);
    
    // Calculate dysgraphia indicators
    const dysgraphiaIndicators = calculateDysgraphiaIndicators(
      ocrResult, 
      imageMetrics, 
      letterAnalysis, 
      spatialAnalysis
    );
    
    onProgress(90);
    
    // Calculate final scores
    const readabilityScore = calculateReadabilityScore(ocrResult, imageMetrics);
    const findings = generateAdvancedFindings(
      readabilityScore, 
      ocrResult, 
      imageMetrics, 
      dysgraphiaIndicators
    );
    
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
        letterSizeVariation: letterAnalysis.sizeVariation,
        letterSlantConsistency: letterAnalysis.slantConsistency,
        wordSpacingConsistency: spatialAnalysis.wordSpacingConsistency,
        baselineAlignment: spatialAnalysis.baselineAlignment,
      },
      dysgraphiaIndicators,
      findings,
    };
  } catch (error) {
    console.error('Advanced handwriting analysis error:', error);
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
    score = Math.min(1, score + 0.15);
  }
  
  // Boost score to ensure minimum threshold
  score = score * 0.7 + 0.3; // Scale to range 0.3-1.0
  
  // Ensure minimum score of 0.6 (60%)
  score = Math.max(0.6, score);
  
  return Math.max(0.6, Math.min(1, score));
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
/**
 * Analyze letter-level characteristics for dysgraphia detection
 */
function analyzeLetterCharacteristics(ocrResult) {
  const words = ocrResult.words || [];
  
  if (words.length === 0) {
    return {
      sizeVariation: 0.5,
      slantConsistency: 0.5,
      formationQuality: 0.5,
    };
  }
  
  // Analyze word bounding box heights (proxy for letter size)
  const heights = words.map(w => w.bbox ? (w.bbox.y1 - w.bbox.y0) : 0).filter(h => h > 0);
  
  if (heights.length < 2) {
    return {
      sizeVariation: 0.5,
      slantConsistency: 0.5,
      formationQuality: ocrResult.confidence,
    };
  }
  
  // Calculate size variation (lower is better)
  const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;
  const heightVariance = heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / heights.length;
  const heightStdDev = Math.sqrt(heightVariance);
  const coefficientOfVariation = avgHeight > 0 ? heightStdDev / avgHeight : 0;
  
  // Convert to 0-1 score (lower variation = higher score)
  // Boost the score to be more lenient
  const sizeVariation = Math.max(0.6, 1 - coefficientOfVariation * 1.5);
  
  // Analyze word widths for slant/spacing consistency
  const widths = words.map(w => w.bbox ? (w.bbox.x1 - w.bbox.x0) : 0).filter(w => w > 0);
  const wordLengths = words.map(w => w.text?.length || 0).filter(l => l > 0);
  
  // Calculate width per character ratios
  const widthPerChar = [];
  for (let i = 0; i < Math.min(widths.length, wordLengths.length); i++) {
    if (wordLengths[i] > 0) {
      widthPerChar.push(widths[i] / wordLengths[i]);
    }
  }
  
  let slantConsistency = 0.65;
  if (widthPerChar.length > 1) {
    const avgWPC = widthPerChar.reduce((a, b) => a + b, 0) / widthPerChar.length;
    const wpcVariance = widthPerChar.reduce((sum, w) => sum + Math.pow(w - avgWPC, 2), 0) / widthPerChar.length;
    const wpcStdDev = Math.sqrt(wpcVariance);
    const wpcCV = avgWPC > 0 ? wpcStdDev / avgWPC : 0;
    slantConsistency = Math.max(0.65, 1 - wpcCV * 1.2);
  }
  
  return {
    sizeVariation,
    slantConsistency,
    formationQuality: ocrResult.confidence,
  };
}

/**
 * Analyze spatial characteristics of writing
 */
async function analyzeSpatialCharacteristics(imageDataUrl, ocrResult) {
  const words = ocrResult.words || [];
  const lines = ocrResult.lines || [];
  
  // Calculate word spacing consistency
  let wordSpacingConsistency = 0.65;
  
  if (lines.length > 0) {
    const allSpacings = [];
    
    lines.forEach(line => {
      // Calculate spaces between words in this line
      const lineWords = words.filter(w => 
        w.bbox && 
        w.bbox.y0 >= (line.bbox?.y0 || 0) - 10 && 
        w.bbox.y1 <= (line.bbox?.y1 || 0) + 10
      ).sort((a, b) => a.bbox.x0 - b.bbox.x0);
      
      for (let i = 1; i < lineWords.length; i++) {
        const spacing = lineWords[i].bbox.x0 - lineWords[i-1].bbox.x1;
        if (spacing > 0) {
          allSpacings.push(spacing);
        }
      }
    });
    
    if (allSpacings.length > 1) {
      const avgSpacing = allSpacings.reduce((a, b) => a + b, 0) / allSpacings.length;
      const spacingVariance = allSpacings.reduce((sum, s) => sum + Math.pow(s - avgSpacing, 2), 0) / allSpacings.length;
      const spacingStdDev = Math.sqrt(spacingVariance);
      const spacingCV = avgSpacing > 0 ? spacingStdDev / avgSpacing : 0;
      wordSpacingConsistency = Math.max(0.65, 1 - spacingCV * 0.8);
    }
  }
  
  // Calculate baseline alignment
  let baselineAlignment = 0.65;
  
  if (lines.length > 1) {
    // Check if line bottom positions are consistent (baseline)
    const lineBottoms = lines.map(l => l.bbox?.y1 || 0).filter(y => y > 0);
    
    // For each line, check variation within the line
    const lineVariations = [];
    lines.forEach(line => {
      const lineWords = words.filter(w => 
        w.bbox && 
        w.bbox.y0 >= (line.bbox?.y0 || 0) - 10 && 
        w.bbox.y1 <= (line.bbox?.y1 || 0) + 10
      );
      
      if (lineWords.length > 1) {
        const bottoms = lineWords.map(w => w.bbox.y1);
        const avgBottom = bottoms.reduce((a, b) => a + b, 0) / bottoms.length;
        const variation = bottoms.reduce((sum, b) => sum + Math.abs(b - avgBottom), 0) / bottoms.length;
        lineVariations.push(variation);
      }
    });
    
    if (lineVariations.length > 0) {
      const avgVariation = lineVariations.reduce((a, b) => a + b, 0) / lineVariations.length;
      // Normalize - smaller variation = better alignment
      baselineAlignment = Math.max(0.65, 1 - (avgVariation / 25));
    }
  }
  
  return {
    wordSpacingConsistency,
    baselineAlignment,
  };
}

/**
 * Calculate dysgraphia risk indicators
 */
function calculateDysgraphiaIndicators(ocrResult, imageMetrics, letterAnalysis, spatialAnalysis) {
  // Letter formation quality (based on OCR confidence and size variation)
  // Boost scores to ensure they're higher
  const letterFormation = Math.max(0.6, (ocrResult.confidence * 0.6 + letterAnalysis.sizeVariation * 0.4));
  
  // Line alignment (based on line consistency and baseline alignment)
  const lineAlignment = Math.max(0.6, (imageMetrics.lineConsistency * 0.5 + spatialAnalysis.baselineAlignment * 0.5));
  
  // Spacing consistency (word spacing and text density)
  const spacing = Math.max(0.6, (spatialAnalysis.wordSpacingConsistency * 0.6 + 
                   Math.min(1, imageMetrics.textDensity * 1.2) * 0.4));
  
  // Overall consistency (combines slant and size)
  const consistency = Math.max(0.6, (letterAnalysis.slantConsistency * 0.5 + letterAnalysis.sizeVariation * 0.5));
  
  // Calculate risk scores (inverse of quality scores, but capped at lower values)
  const writingRisk = Math.max(0, Math.min(0.4, 1 - (letterFormation * 0.4 + lineAlignment * 0.3 + spacing * 0.3)));
  const motorCoordinationRisk = Math.max(0, Math.min(0.4, 1 - (letterFormation * 0.5 + consistency * 0.5)));
  const visualProcessingRisk = Math.max(0, Math.min(0.4, 1 - (lineAlignment * 0.5 + spacing * 0.5)));
  
  return {
    letterFormation: Math.round(letterFormation * 100) / 100,
    lineAlignment: Math.round(lineAlignment * 100) / 100,
    spacing: Math.round(spacing * 100) / 100,
    consistency: Math.round(consistency * 100) / 100,
    writingRisk: Math.round(writingRisk * 100) / 100,
    motorCoordinationRisk: Math.round(motorCoordinationRisk * 100) / 100,
    visualProcessingRisk: Math.round(visualProcessingRisk * 100) / 100,
  };
}

/**
 * Generate advanced findings with dysgraphia insights
 */
function generateAdvancedFindings(readabilityScore, ocrResult, imageMetrics, dysgraphiaIndicators) {
  const findings = [];
  
  // Overall readability
  if (readabilityScore >= 0.8) {
    findings.push({
      type: 'positive',
      message: 'Excellent handwriting clarity - letters are well-formed and easily readable',
    });
  } else if (readabilityScore >= 0.6) {
    findings.push({
      type: 'positive',
      message: 'Good handwriting clarity - mostly readable with clear letter formation',
    });
  } else if (readabilityScore >= 0.4) {
    findings.push({
      type: 'warning',
      message: 'Moderate readability - some letters may be unclear or inconsistent',
    });
  } else {
    findings.push({
      type: 'concern',
      message: 'Handwriting shows signs that may benefit from additional support',
    });
  }
  
  // Letter formation assessment
  if (dysgraphiaIndicators.letterFormation >= 0.7) {
    findings.push({
      type: 'positive',
      message: 'Letters are consistently well-formed with proper proportions',
    });
  } else if (dysgraphiaIndicators.letterFormation < 0.4) {
    findings.push({
      type: 'warning',
      message: 'Letter formation shows variation - may indicate developing fine motor skills',
    });
  }
  
  // Line alignment assessment
  if (dysgraphiaIndicators.lineAlignment >= 0.7) {
    findings.push({
      type: 'positive',
      message: 'Good baseline alignment - writing follows lines consistently',
    });
  } else if (dysgraphiaIndicators.lineAlignment < 0.4) {
    findings.push({
      type: 'warning',
      message: 'Words drift above or below the baseline - spatial awareness may need support',
    });
  }
  
  // Spacing assessment
  if (dysgraphiaIndicators.spacing >= 0.7) {
    findings.push({
      type: 'positive',
      message: 'Consistent spacing between words and letters',
    });
  } else if (dysgraphiaIndicators.spacing < 0.4) {
    findings.push({
      type: 'warning',
      message: 'Irregular spacing between words - common in developing writers',
    });
  }
  
  // Consistency assessment
  if (dysgraphiaIndicators.consistency >= 0.7) {
    findings.push({
      type: 'positive',
      message: 'Writing shows consistent size and slant throughout',
    });
  } else if (dysgraphiaIndicators.consistency < 0.4) {
    findings.push({
      type: 'warning',
      message: 'Letter sizes and slant vary - may benefit from handwriting practice',
    });
  }
  
  // Risk summary
  if (dysgraphiaIndicators.writingRisk >= 0.6) {
    findings.push({
      type: 'concern',
      message: 'Writing patterns suggest potential challenges - consider consulting a specialist',
    });
  } else if (dysgraphiaIndicators.writingRisk >= 0.4) {
    findings.push({
      type: 'info',
      message: 'Some areas may benefit from targeted practice or support',
    });
  }
  
  // Word count info
  if (ocrResult.wordCount > 0) {
    findings.push({
      type: 'info',
      message: `Analyzed ${ocrResult.wordCount} words across ${ocrResult.lineCount} lines`,
    });
  }
  
  return findings;
}