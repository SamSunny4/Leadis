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
  
  updateAssessmentMetrics({
    attentionMetrics: {
      mean_focus_duration_sec,
      attention_span_average: mean_focus_duration_sec,
      random_interaction_rate: null // Requires click/touch tracking
    }
  });
};

/**
 * Record memory task results
 * @param {Object} memoryData - Memory task data
 * @param {number} memoryData.sequenceLength - Length of sequence attempted
 */
export const recordMemoryData = (memoryData) => {
  const { sequenceLength } = memoryData;
  
  if (!window.memoryRecords) {
    window.memoryRecords = [];
  }
  window.memoryRecords.push({ sequenceLength });
  
  const records = window.memoryRecords;
  const max_sequence_length = Math.max(...records.map(r => r.sequenceLength));
  
  updateAssessmentMetrics({
    memoryMetrics: {
      max_sequence_length
    }
  });
};

/**
 * Record visual processing data
 * @param {Object} visualData - Visual processing data
 * @param {number} visualData.searchTime - Time to find target (ms)
 */
export const recordVisualData = (visualData) => {
  const { searchTime } = visualData;
  
  if (!window.visualRecords) {
    window.visualRecords = [];
  }
  window.visualRecords.push({ searchTime });
  
  const records = window.visualRecords;
  const visual_search_time_ms = records.reduce((sum, r) => sum + r.searchTime, 0) / records.length;
  
  updateAssessmentMetrics({
    visualProcessing: {
      visual_search_time_ms
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
      average_audio_replays,
      pref_auditory: null // Learning preference calculation can be added
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
    risk_receptive_language: calculateReceptiveLanguageRisk(metrics),
    risk_visual_processing: calculateVisualProcessingRisk(metrics),
    risk_motor_coordination: calculateMotorRisk(metrics)
  };
  
  updateRiskAssessment(riskScores);
  return riskScores;
};

// Helper functions for risk calculation (simplified examples)
const calculateReadingRisk = (metrics) => {
  const { responseMetrics } = metrics;
  if (!responseMetrics.mean_response_accuracy) return null;
  
  let risk = 0;
  // Use general response accuracy as proxy for reading risk
  if (responseMetrics.mean_response_accuracy < 0.7) risk += 0.6;
  if (responseMetrics.mean_response_time_ms > 10000) risk += 0.4;
  
  return Math.min(risk, 1.0);
};

const calculateWritingRisk = (metrics) => {
  const { motorCoordination, responseMetrics } = metrics;
  if (!motorCoordination || !responseMetrics.mean_response_accuracy) return null;
  
  let risk = 0;
  // Use motor coordination and response metrics as proxy
  if (motorCoordination.hand_laterality_accuracy && motorCoordination.hand_laterality_accuracy < 0.8) risk += 0.5;
  if (responseMetrics.mean_response_accuracy < 0.7) risk += 0.5;
  
  return Math.min(risk, 1.0);
};

const calculateAttentionRisk = (metrics) => {
  const { attentionMetrics, taskPerformance } = metrics;
  if (!attentionMetrics.mean_focus_duration_sec) return null;
  
  let risk = 0;
  if (attentionMetrics.mean_focus_duration_sec < 60) risk += 0.4;
  if (attentionMetrics.random_interaction_rate && attentionMetrics.random_interaction_rate > 0.3) risk += 0.3;
  if (taskPerformance.task_completion_rate < 0.7) risk += 0.3;
  
  return Math.min(risk, 1.0);
};

const calculateMemoryRisk = (metrics) => {
  const { memoryMetrics } = metrics;
  if (!memoryMetrics.max_sequence_length) return null;
  
  let risk = 0;
  if (memoryMetrics.max_sequence_length < 4) risk += 1.0;
  else if (memoryMetrics.max_sequence_length < 6) risk += 0.5;
  
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
  if (visualProcessing.visual_search_time_ms > 5000) risk += 1.0;
  else if (visualProcessing.visual_search_time_ms > 3000) risk += 0.5;
  
  return Math.min(risk, 1.0);
};

const calculateMotorRisk = (metrics) => {
  const { motorCoordination } = metrics;
  if (!motorCoordination) return null;
  
  let risk = 0;
  let count = 0;
  
  if (motorCoordination.hand_laterality_accuracy !== null) {
    if (motorCoordination.hand_laterality_accuracy < 0.7) risk += 0.4;
    count++;
  }
  if (motorCoordination.finger_counting_accuracy !== null) {
    if (motorCoordination.finger_counting_accuracy < 0.7) risk += 0.3;
    count++;
  }
  if (motorCoordination.hand_position_accuracy !== null) {
    if (motorCoordination.hand_position_accuracy < 0.7) risk += 0.3;
    count++;
  }
  
  return count > 0 ? Math.min(risk, 1.0) : null;
};

// Utility functions
const calculateStandardDeviation = (values) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.sqrt(variance);
};

/**
 * Clear all assessment records
 */
export const clearAssessmentRecords = () => {
  window.assessmentResponses = [];
  window.taskCompletions = [];
  window.focusRecords = [];
  window.memoryRecords = [];
  window.visualRecords = [];
  window.auditoryRecords = [];
};
