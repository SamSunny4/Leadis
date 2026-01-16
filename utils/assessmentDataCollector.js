/**
 * Assessment Data Collector
 * Helper functions to collect and store assessment metrics during tests
 */

import { 
  updateAssessmentMetrics, 
  updateRiskAssessment,
  getUserData 
} from './userDataManager';

/**
 * Record a response during an assessment
 * @param {Object} response - Response data
 * @param {boolean} response.isCorrect - Whether the response was correct
 * @param {number} response.responseTime - Response time in milliseconds
 */
export const recordResponse = (response) => {
  const { isCorrect, responseTime } = response;
  
  // Get current metrics
  const userData = getUserData();
  if (!userData) return;
  
  // Calculate running averages (simplified - you may want more sophisticated stats)
  const currentMetrics = userData.assessmentMetrics.responseMetrics;
  
  // Store individual responses for later calculation
  if (!window.assessmentResponses) {
    window.assessmentResponses = [];
  }
  window.assessmentResponses.push({ isCorrect, responseTime });
  
  // Calculate metrics
  const responses = window.assessmentResponses;
  const accuracies = responses.map(r => r.isCorrect ? 1 : 0);
  const times = responses.map(r => r.responseTime);
  
  const mean_response_accuracy = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  const mean_response_time_ms = times.reduce((a, b) => a + b, 0) / times.length;
  
  // Calculate standard deviations
  const response_accuracy_std = calculateStandardDeviation(accuracies);
  const response_time_std_ms = calculateStandardDeviation(times);
  
  updateAssessmentMetrics({
    responseMetrics: {
      mean_response_accuracy,
      response_accuracy_std,
      mean_response_time_ms,
      response_time_std_ms
    }
  });
};

/**
 * Record task completion
 * @param {Object} taskData - Task completion data
 * @param {boolean} taskData.completed - Whether task was completed
 * @param {number} taskData.accuracy - Task accuracy (0-1)
 */
export const recordTaskCompletion = (taskData) => {
  const { completed, accuracy } = taskData;
  
  if (!window.taskCompletions) {
    window.taskCompletions = [];
  }
  window.taskCompletions.push({ completed, accuracy });
  
  const tasks = window.taskCompletions;
  const completionRate = tasks.filter(t => t.completed).length / tasks.length;
  const abandonmentCount = tasks.filter(t => !t.completed).length;
  const avgAccuracy = tasks
    .filter(t => t.accuracy !== null)
    .reduce((sum, t) => sum + t.accuracy, 0) / tasks.length;
  
  updateAssessmentMetrics({
    taskPerformance: {
      task_completion_rate: completionRate,
      task_abandonment_count: abandonmentCount,
      instruction_follow_accuracy: avgAccuracy
    }
  });
};

/**
 * Record attention/focus data
 * @param {Object} focusData - Focus tracking data
 * @param {number} focusData.focusDuration - How long user stayed focused (seconds)
 * @param {number} focusData.totalDuration - Total duration of task (seconds)
 */
export const recordFocusData = (focusData) => {
  const { focusDuration, totalDuration } = focusData;
  
  if (!window.focusRecords) {
    window.focusRecords = [];
  }
  window.focusRecords.push({ focusDuration, totalDuration });
  
  const records = window.focusRecords;
  const mean_focus_duration_sec = records.reduce((sum, r) => sum + r.focusDuration, 0) / records.length;
  
  // Calculate attention dropoff (negative slope means decreasing attention)
  const attention_dropoff_slope = calculateSlope(records.map(r => r.focusDuration));
  
  updateAssessmentMetrics({
    attentionMetrics: {
      mean_focus_duration_sec,
      attention_dropoff_slope,
      attention_span_average: mean_focus_duration_sec
    }
  });
};

/**
 * Record memory task results
 * @param {Object} memoryData - Memory task data
 * @param {number} memoryData.sequenceLength - Length of sequence attempted
 * @param {number} memoryData.errors - Number of order errors
 */
export const recordMemoryData = (memoryData) => {
  const { sequenceLength, errors } = memoryData;
  
  if (!window.memoryRecords) {
    window.memoryRecords = [];
  }
  window.memoryRecords.push({ sequenceLength, errors });
  
  const records = window.memoryRecords;
  const max_sequence_length = Math.max(...records.map(r => r.sequenceLength));
  const totalAttempts = records.length;
  const totalErrors = records.reduce((sum, r) => sum + r.errors, 0);
  const sequence_order_error_rate = totalErrors / totalAttempts;
  
  updateAssessmentMetrics({
    memoryMetrics: {
      max_sequence_length,
      sequence_order_error_rate
    }
  });
};

/**
 * Record reading performance
 * @param {Object} readingData - Reading performance data
 * @param {number} readingData.wordsRead - Number of words read
 * @param {number} readingData.timeSeconds - Time taken in seconds
 * @param {number} readingData.accuracy - Reading accuracy (0-1)
 * @param {number} readingData.reversals - Number of letter reversals
 */
export const recordReadingData = (readingData) => {
  const { wordsRead, timeSeconds, accuracy, reversals = 0 } = readingData;
  
  const reading_speed_wpm = (wordsRead / timeSeconds) * 60;
  
  if (!window.readingRecords) {
    window.readingRecords = [];
  }
  window.readingRecords.push({ speed: reading_speed_wpm, accuracy, reversals });
  
  const records = window.readingRecords;
  const avgSpeed = records.reduce((sum, r) => sum + r.speed, 0) / records.length;
  const avgAccuracy = records.reduce((sum, r) => sum + r.accuracy, 0) / records.length;
  const totalWords = records.reduce((sum, r) => sum + (r.speed / 60), 0);
  const totalReversals = records.reduce((sum, r) => sum + r.reversals, 0);
  const letter_reversal_rate = totalReversals / totalWords;
  
  updateAssessmentMetrics({
    readingMetrics: {
      reading_speed_wpm: avgSpeed,
      reading_accuracy: avgAccuracy,
      letter_reversal_rate
    }
  });
};

/**
 * Record visual processing data
 * @param {Object} visualData - Visual processing data
 * @param {number} visualData.searchTime - Time to find target (ms)
 * @param {boolean} visualData.leftRightError - Whether there was left/right confusion
 */
export const recordVisualData = (visualData) => {
  const { searchTime, leftRightError = false } = visualData;
  
  if (!window.visualRecords) {
    window.visualRecords = [];
  }
  window.visualRecords.push({ searchTime, leftRightError });
  
  const records = window.visualRecords;
  const visual_search_time_ms = records.reduce((sum, r) => sum + r.searchTime, 0) / records.length;
  const confusions = records.filter(r => r.leftRightError).length;
  const left_right_confusion_rate = confusions / records.length;
  
  updateAssessmentMetrics({
    visualProcessing: {
      visual_search_time_ms,
      left_right_confusion_rate
    }
  });
};

/**
 * Record auditory processing data
 * @param {Object} auditoryData - Auditory processing data
 * @param {number} auditoryData.accuracy - Accuracy (0-1)
 * @param {number} auditoryData.replays - Number of audio replays needed
 */
export const recordAuditoryData = (auditoryData) => {
  const { accuracy, replays = 0 } = auditoryData;
  
  if (!window.auditoryRecords) {
    window.auditoryRecords = [];
  }
  window.auditoryRecords.push({ accuracy, replays });
  
  const records = window.auditoryRecords;
  const auditory_processing_accuracy = records.reduce((sum, r) => sum + r.accuracy, 0) / records.length;
  const average_audio_replays = records.reduce((sum, r) => sum + r.replays, 0) / records.length;
  
  updateAssessmentMetrics({
    auditoryProcessing: {
      auditory_processing_accuracy,
      average_audio_replays
    }
  });
};

/**
 * Calculate final risk scores based on collected metrics
 * This is a simplified example - you should implement proper ML model inference
 */
export const calculateRiskScores = () => {
  const userData = getUserData();
  if (!userData) return;
  
  const metrics = userData.assessmentMetrics;
  
  // Simple heuristic-based risk calculation (replace with actual ML model)
  const riskScores = {
    risk_reading: calculateReadingRisk(metrics),
    risk_writing: calculateWritingRisk(metrics),
    risk_attention: calculateAttentionRisk(metrics),
    risk_working_memory: calculateMemoryRisk(metrics),
    risk_expressive_language: calculateExpressiveLanguageRisk(metrics),
    risk_receptive_language: calculateReceptiveLanguageRisk(metrics),
    risk_visual_processing: calculateVisualProcessingRisk(metrics),
    risk_motor_coordination: 0.0 // Not yet implemented
  };
  
  updateRiskAssessment(riskScores);
  return riskScores;
};

// Helper functions for risk calculation (simplified examples)
const calculateReadingRisk = (metrics) => {
  const { readingMetrics } = metrics;
  if (!readingMetrics.reading_accuracy) return null;
  
  let risk = 0;
  if (readingMetrics.reading_accuracy < 0.7) risk += 0.4;
  if (readingMetrics.reading_speed_wpm < 80) risk += 0.3;
  if (readingMetrics.letter_reversal_rate > 0.1) risk += 0.3;
  
  return Math.min(risk, 1.0);
};

const calculateWritingRisk = (metrics) => {
  // Implement based on your metrics
  return 0.0;
};

const calculateAttentionRisk = (metrics) => {
  const { attentionMetrics } = metrics;
  if (!attentionMetrics.mean_focus_duration_sec) return null;
  
  let risk = 0;
  if (attentionMetrics.mean_focus_duration_sec < 60) risk += 0.4;
  if (attentionMetrics.attention_dropoff_slope < -0.5) risk += 0.3;
  if (attentionMetrics.random_interaction_rate > 0.3) risk += 0.3;
  
  return Math.min(risk, 1.0);
};

const calculateMemoryRisk = (metrics) => {
  const { memoryMetrics } = metrics;
  if (!memoryMetrics.max_sequence_length) return null;
  
  let risk = 0;
  if (memoryMetrics.max_sequence_length < 4) risk += 0.5;
  if (memoryMetrics.sequence_order_error_rate > 0.3) risk += 0.5;
  
  return Math.min(risk, 1.0);
};

const calculateExpressiveLanguageRisk = (metrics) => {
  const { speechMetrics } = metrics;
  if (!speechMetrics.speech_rate_wpm) return null;
  
  let risk = 0;
  if (speechMetrics.speech_rate_wpm < 60) risk += 0.5;
  if (speechMetrics.hesitation_frequency > 20) risk += 0.5;
  
  return Math.min(risk, 1.0);
};

const calculateReceptiveLanguageRisk = (metrics) => {
  const { auditoryProcessing } = metrics;
  if (!auditoryProcessing.auditory_processing_accuracy) return null;
  
  let risk = 0;
  if (auditoryProcessing.auditory_processing_accuracy < 0.7) risk += 0.6;
  if (auditoryProcessing.average_audio_replays > 3) risk += 0.4;
  
  return Math.min(risk, 1.0);
};

const calculateVisualProcessingRisk = (metrics) => {
  const { visualProcessing } = metrics;
  if (!visualProcessing.visual_search_time_ms) return null;
  
  let risk = 0;
  if (visualProcessing.visual_search_time_ms > 5000) risk += 0.5;
  if (visualProcessing.left_right_confusion_rate > 0.2) risk += 0.5;
  
  return Math.min(risk, 1.0);
};

// Utility functions
const calculateStandardDeviation = (values) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
};

const calculateSlope = (values) => {
  const n = values.length;
  const xValues = Array.from({ length: n }, (_, i) => i);
  const xMean = xValues.reduce((a, b) => a + b, 0) / n;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (values[i] - yMean);
    denominator += Math.pow(xValues[i] - xMean, 2);
  }
  
  return denominator !== 0 ? numerator / denominator : 0;
};

/**
 * Clear all assessment records
 */
export const clearAssessmentRecords = () => {
  window.assessmentResponses = [];
  window.taskCompletions = [];
  window.focusRecords = [];
  window.memoryRecords = [];
  window.readingRecords = [];
  window.visualRecords = [];
  window.auditoryRecords = [];
};
