/**
 * Face Tracking Service
 * Real-time face tracking during quiz and mini games
 * Updates user data JSON with attention and engagement metrics
 */

import { getUserData, saveUserData, initializeUserData } from './userDataManager';

// Face tracking session data
let faceTrackingSession = {
  isActive: false,
  startTime: null,
  faceDetections: [],
  attentionScores: [],
  engagementLevels: [],
  gazeDirections: [],
  blinkCount: 0,
  headPoses: [],
  lookAwayCount: 0,
  lookAwayDurationMs: 0,
  lastLookAwayStart: null,
  metricsHistory: [],
  aggregationInterval: null,
};

/**
 * Start face tracking session
 */
export const startFaceTrackingSession = () => {
  faceTrackingSession = {
    isActive: true,
    startTime: Date.now(),
    faceDetections: [],
    attentionScores: [],
    engagementLevels: [],
    gazeDirections: [],
    blinkCount: 0,
    headPoses: [],
    lookAwayCount: 0,
    lookAwayDurationMs: 0,
    lastLookAwayStart: null,
    metricsHistory: [],
    aggregationInterval: null,
  };
  
  // Set up periodic aggregation (every 5 seconds)
  faceTrackingSession.aggregationInterval = setInterval(() => {
    aggregateAndSaveMetrics();
  }, 5000);
  
  console.log('📷 Face tracking session started at:', new Date(faceTrackingSession.startTime).toISOString());
};

/**
 * Stop face tracking session
 */
export const stopFaceTrackingSession = () => {
  if (faceTrackingSession.aggregationInterval) {
    clearInterval(faceTrackingSession.aggregationInterval);
  }
  
  // Final aggregation
  aggregateAndSaveMetrics();
  
  faceTrackingSession.isActive = false;
  console.log('📷 Face tracking session stopped');
  
  return getFaceTrackingSummary();
};

/**
 * Check if face tracking is active
 * @returns {boolean}
 */
export const isFaceTrackingActive = () => {
  return faceTrackingSession.isActive;
};

/**
 * Record face detection data
 * @param {Object} faceData - Face detection data from MediaPipe
 */
export const recordFaceDetection = (faceData) => {
  if (!faceTrackingSession.isActive) return;
  
  const timestamp = Date.now();
  
  // Store detection
  faceTrackingSession.faceDetections.push({
    timestamp,
    hasFace: true,
  });
  
  // Track attention metrics if available
  if (faceData.attentionMetrics) {
    const metrics = faceData.attentionMetrics;
    
    // Record attention score
    faceTrackingSession.attentionScores.push({
      score: metrics.attentionScore,
      timestamp,
    });
    
    // Record engagement level
    faceTrackingSession.engagementLevels.push({
      level: metrics.engagementLevel,
      timestamp,
    });
    
    // Record gaze direction
    faceTrackingSession.gazeDirections.push({
      direction: metrics.gazeDirection,
      timestamp,
    });
    
    // Update blink count
    if (metrics.blinkCount > faceTrackingSession.blinkCount) {
      faceTrackingSession.blinkCount = metrics.blinkCount;
    }
    
    // Record head pose
    if (metrics.headPose) {
      faceTrackingSession.headPoses.push({
        pose: metrics.headPose,
        timestamp,
      });
    }
    
    // Track look-away events
    if (metrics.lookingAway) {
      if (!faceTrackingSession.lastLookAwayStart) {
        faceTrackingSession.lastLookAwayStart = timestamp;
        faceTrackingSession.lookAwayCount++;
      }
    } else if (faceTrackingSession.lastLookAwayStart) {
      faceTrackingSession.lookAwayDurationMs += timestamp - faceTrackingSession.lastLookAwayStart;
      faceTrackingSession.lastLookAwayStart = null;
    }
  }
  
  // Keep only recent data (last 60 seconds) to prevent memory issues
  const cutoff = timestamp - 60000;
  faceTrackingSession.faceDetections = faceTrackingSession.faceDetections.filter(d => d.timestamp > cutoff);
  faceTrackingSession.attentionScores = faceTrackingSession.attentionScores.filter(d => d.timestamp > cutoff);
  faceTrackingSession.engagementLevels = faceTrackingSession.engagementLevels.filter(d => d.timestamp > cutoff);
  faceTrackingSession.gazeDirections = faceTrackingSession.gazeDirections.filter(d => d.timestamp > cutoff);
  faceTrackingSession.headPoses = faceTrackingSession.headPoses.filter(d => d.timestamp > cutoff);
};

/**
 * Record no face detected event
 */
export const recordNoFaceDetected = () => {
  if (!faceTrackingSession.isActive) return;
  
  const timestamp = Date.now();
  faceTrackingSession.faceDetections.push({
    timestamp,
    hasFace: false,
  });
  
  // If no face, treat as looking away
  if (!faceTrackingSession.lastLookAwayStart) {
    faceTrackingSession.lastLookAwayStart = timestamp;
    faceTrackingSession.lookAwayCount++;
  }
};

/**
 * Aggregate metrics and save to user data
 */
const aggregateAndSaveMetrics = () => {
  if (!faceTrackingSession.isActive) return;
  
  const metrics = calculateFaceTrackingMetrics();
  
  // Save to history for later analysis
  faceTrackingSession.metricsHistory.push({
    timestamp: Date.now(),
    ...metrics,
  });
  
  // Update user data with attention metrics
  updateUserDataWithFaceMetrics(metrics);
};

/**
 * Calculate face tracking metrics
 * @returns {Object} Calculated metrics
 */
const calculateFaceTrackingMetrics = () => {
  const attentionScores = faceTrackingSession.attentionScores;
  const engagementLevels = faceTrackingSession.engagementLevels;
  const gazeDirections = faceTrackingSession.gazeDirections;
  const faceDetections = faceTrackingSession.faceDetections;
  
  // Mean attention score
  const meanAttentionScore = attentionScores.length > 0
    ? attentionScores.reduce((sum, s) => sum + s.score, 0) / attentionScores.length
    : null;
  
  // Attention consistency (standard deviation)
  const attentionStd = attentionScores.length > 1
    ? Math.sqrt(
        attentionScores.reduce((sum, s) => sum + Math.pow(s.score - meanAttentionScore, 2), 0) 
        / attentionScores.length
      )
    : null;
  
  // Engagement level distribution
  const engagementCounts = {
    high: engagementLevels.filter(e => e.level === 'high').length,
    medium: engagementLevels.filter(e => e.level === 'medium').length,
    low: engagementLevels.filter(e => e.level === 'low').length,
  };
  const totalEngagement = engagementLevels.length;
  
  const engagementDistribution = totalEngagement > 0 ? {
    high: engagementCounts.high / totalEngagement,
    medium: engagementCounts.medium / totalEngagement,
    low: engagementCounts.low / totalEngagement,
  } : null;
  
  // Gaze direction distribution
  const gazeCounts = {
    center: gazeDirections.filter(g => g.direction === 'center').length,
    left: gazeDirections.filter(g => g.direction === 'left').length,
    right: gazeDirections.filter(g => g.direction === 'right').length,
  };
  const totalGaze = gazeDirections.length;
  
  const gazeOnScreenRatio = totalGaze > 0
    ? gazeCounts.center / totalGaze
    : null;
  
  // Face detection rate
  const faceDetectionRate = faceDetections.length > 0
    ? faceDetections.filter(d => d.hasFace).length / faceDetections.length
    : null;
  
  // Calculate focus duration (average time between look-aways)
  const sessionDuration = Date.now() - faceTrackingSession.startTime;
  const focusEvents = faceTrackingSession.lookAwayCount + 1; // Include initial focus
  const meanFocusDuration = focusEvents > 0 
    ? (sessionDuration - faceTrackingSession.lookAwayDurationMs) / focusEvents / 1000 // in seconds
    : null;
  
  // Random interaction rate (high gaze deviation = potentially random)
  const randomInteractionRate = totalGaze > 0
    ? (gazeCounts.left + gazeCounts.right) / totalGaze
    : null;
  
  return {
    meanAttentionScore,
    attentionStd,
    engagementDistribution,
    gazeOnScreenRatio,
    faceDetectionRate,
    blinkCount: faceTrackingSession.blinkCount,
    lookAwayCount: faceTrackingSession.lookAwayCount,
    lookAwayDurationMs: faceTrackingSession.lookAwayDurationMs,
    meanFocusDurationSec: meanFocusDuration,
    randomInteractionRate,
    sessionDurationMs: sessionDuration,
  };
};

/**
 * Update user data with face tracking metrics
 * @param {Object} metrics - Calculated face metrics
 */
const updateUserDataWithFaceMetrics = (metrics) => {
  const userData = getUserData() || initializeUserData();
  
  // Update attention metrics
  if (metrics.meanFocusDurationSec !== null) {
    userData.assessmentMetrics.attentionMetrics.mean_focus_duration_sec = 
      metrics.meanFocusDurationSec;
  }
  
  if (metrics.meanAttentionScore !== null) {
    // Convert attention score (0-100) to attention span average (0-1)
    userData.assessmentMetrics.attentionMetrics.attention_span_average = 
      metrics.meanAttentionScore / 100;
  }
  
  if (metrics.randomInteractionRate !== null) {
    userData.assessmentMetrics.attentionMetrics.random_interaction_rate = 
      metrics.randomInteractionRate;
  }
  
  saveUserData(userData);
  console.log('📊 Face tracking metrics saved to user data:', metrics);
};

/**
 * Get face tracking summary
 * @returns {Object} Summary of face tracking session
 */
export const getFaceTrackingSummary = () => {
  const metrics = calculateFaceTrackingMetrics();
  
  return {
    sessionDurationMs: Date.now() - faceTrackingSession.startTime,
    totalFaceDetections: faceTrackingSession.faceDetections.length,
    ...metrics,
    metricsHistory: faceTrackingSession.metricsHistory,
  };
};

/**
 * Get current real-time attention metrics
 * @returns {Object} Current attention state
 */
export const getCurrentAttentionMetrics = () => {
  if (!faceTrackingSession.isActive) {
    return null;
  }
  
  const recentScores = faceTrackingSession.attentionScores.slice(-10);
  const recentEngagement = faceTrackingSession.engagementLevels.slice(-1);
  const recentGaze = faceTrackingSession.gazeDirections.slice(-1);
  
  return {
    currentAttentionScore: recentScores.length > 0
      ? recentScores.reduce((sum, s) => sum + s.score, 0) / recentScores.length
      : null,
    currentEngagement: recentEngagement.length > 0 
      ? recentEngagement[0].level 
      : null,
    currentGaze: recentGaze.length > 0 
      ? recentGaze[0].direction 
      : null,
    blinkCount: faceTrackingSession.blinkCount,
    lookAwayCount: faceTrackingSession.lookAwayCount,
  };
};

/**
 * Export face tracking data for analysis
 * @returns {Object} Full face tracking session data
 */
export const exportFaceTrackingData = () => {
  return {
    ...faceTrackingSession,
    summary: getFaceTrackingSummary(),
  };
};
