/**
 * Data Transformer for Flask API
 * Transforms user data from localStorage format to Flask API format
 */

import { getUserData } from './userDataManager';

/**
 * Map categorical values to numerical encodings based on field-mapping.json
 */
const CATEGORICAL_MAPPINGS = {
  primary_language: {
    'english': 0
  },
  schooling_type: {
    'not-enrolled': 0,
    'daycare': 1,
    'preschool-kindergarten': 2,
    'school': 3,
    'homeschooling': 4,
    'other': 5
  },
  gender: {
    'male': 0,
    'female': 1,
    'other': 2,
    'prefer-not-to-say': 3
  },
  multilingualExposure: {
    'Monolingual': 0,
    'Minimal': 1,
    'Moderate': 2,
    'High': 3,
    'Native bilingual': 4
  },
  birthHistory: {
    'full-term': 0,
    'preterm': 1,
    'nicu': 2,
    'complications': 3,
    'unknown': 4
  },
  hearingStatus: {
    'normal': 0,
    'tested-normal': 0,
    'concerns': 1,
    'diagnosed': 2,
    'not-tested': 3
  },
  visionStatus: {
    'normal': 0,
    'tested-normal': 0,
    'glasses': 1,
    'concerns': 2,
    'not-tested': 3
  },
  family_adhd: {
    'no-history': 0,
    'one-parent': 1,
    'both-parents': 2,
    'siblings': 3,
    'unsure': 4
  }
};

/**
 * Transform user data to Flask API format
 * @param {Object} userData - User data from localStorage
 * @returns {Object} Transformed data ready for Flask API
 */
export const transformUserDataForFlask = (userData) => {
  if (!userData) {
    throw new Error('No user data provided');
  }
  
  const transformed = {};
  
  // Demographic Info
  transformed.age_months = userData.demographicInfo?.age_months || null;
  transformed.primary_language = mapCategorical('primary_language', userData.demographicInfo?.primary_language);
  transformed.schooling_type = mapCategorical('schooling_type', userData.demographicInfo?.schooling_type);
  transformed.gender = mapCategorical('gender', userData.demographicInfo?.gender);
  
  // Developmental History
  transformed.multilingual_exposure = userData.developmentalHistory?.multilingual_exposure || 0;
  transformed.multilingualExposure = mapCategorical('multilingualExposure', userData.developmentalHistory?.multilingualExposure);
  transformed.birthHistory = mapCategorical('birthHistory', userData.developmentalHistory?.birthHistory);
  transformed.age_first_word_months = userData.developmentalHistory?.age_first_word_months || null;
  transformed.age_first_sentence_months = userData.developmentalHistory?.age_first_sentence_months || null;
  transformed.history_speech_therapy = userData.developmentalHistory?.history_speech_therapy || 0;
  transformed.history_motor_delay = userData.developmentalHistory?.history_motor_delay || 0;
  
  // Sensory Health
  transformed.hearingStatus = mapCategorical('hearingStatus', userData.sensoryHealth?.hearingStatus);
  transformed.hearing_concerns = userData.sensoryHealth?.hearing_concerns || 0;
  transformed.visionStatus = mapCategorical('visionStatus', userData.sensoryHealth?.visionStatus);
  transformed.vision_concerns = userData.sensoryHealth?.vision_concerns || 0;
  
  // Family History
  transformed.family_learning_difficulty = userData.familyHistory?.family_learning_difficulty || 0;
  transformed.family_adhd = mapCategorical('family_adhd', userData.familyHistory?.family_adhd);
  
  // Assessment Metrics - Response Metrics
  transformed.mean_response_accuracy = userData.assessmentMetrics?.responseMetrics?.mean_response_accuracy || null;
  transformed.response_accuracy_std = userData.assessmentMetrics?.responseMetrics?.response_accuracy_std || null;
  transformed.mean_response_time_ms = userData.assessmentMetrics?.responseMetrics?.mean_response_time_ms || null;
  transformed.response_time_std_ms = userData.assessmentMetrics?.responseMetrics?.response_time_std_ms || null;
  
  // Assessment Metrics - Task Performance
  transformed.task_completion_rate = userData.assessmentMetrics?.taskPerformance?.task_completion_rate || null;
  transformed.task_abandonment_count = userData.assessmentMetrics?.taskPerformance?.task_abandonment_count || 0;
  transformed.instruction_follow_accuracy = userData.assessmentMetrics?.taskPerformance?.instruction_follow_accuracy || null;
  
  // Assessment Metrics - Attention Metrics
  transformed.mean_focus_duration_sec = userData.assessmentMetrics?.attentionMetrics?.mean_focus_duration_sec || null;
  transformed.attention_span_average = userData.assessmentMetrics?.attentionMetrics?.attention_span_average || null;
  transformed.random_interaction_rate = userData.assessmentMetrics?.attentionMetrics?.random_interaction_rate || null;
  
  // Assessment Metrics - Memory Metrics
  transformed.max_sequence_length = userData.assessmentMetrics?.memoryMetrics?.max_sequence_length || null;
  
  // Assessment Metrics - Visual Processing
  transformed.visual_search_time_ms = userData.assessmentMetrics?.visualProcessing?.visual_search_time_ms || null;
  
  // Assessment Metrics - Auditory Processing
  transformed.auditory_processing_accuracy = userData.assessmentMetrics?.auditoryProcessing?.auditory_processing_accuracy || null;
  transformed.average_audio_replays = userData.assessmentMetrics?.auditoryProcessing?.average_audio_replays || 0;
  transformed.pref_auditory = userData.assessmentMetrics?.auditoryProcessing?.pref_auditory || null;
  
  // Assessment Metrics - Motor Coordination
  transformed.hand_laterality_accuracy = userData.assessmentMetrics?.motorCoordination?.hand_laterality_accuracy || null;
  transformed.finger_counting_accuracy = userData.assessmentMetrics?.motorCoordination?.finger_counting_accuracy || null;
  transformed.hand_position_accuracy = userData.assessmentMetrics?.motorCoordination?.hand_position_accuracy || null;
  
  // Remove null values (Flask will handle missing data with imputation)
  // Keep them as null for proper handling by the model
  
  console.log('Transformed data for Flask:', transformed);
  return transformed;
};

/**
 * Map categorical value to numerical encoding
 * @param {string} field - Field name
 * @param {string} value - Categorical value
 * @returns {number} Numerical encoding
 */
const mapCategorical = (field, value) => {
  if (!value || !CATEGORICAL_MAPPINGS[field]) {
    return null;
  }
  
  const mapping = CATEGORICAL_MAPPINGS[field];
  return mapping[value] !== undefined ? mapping[value] : null;
};

/**
 * Generate random test data for Flask API testing
 * This fills in all required fields with plausible random values
 * @returns {Object} Random user data in Flask format
 */
export const generateRandomTestData = () => {
  const randomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomFloat = (min, max) => Math.random() * (max - min) + min;
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  return {
    // Demographic Info
    age_months: randomInRange(36, 144), // 3-12 years
    primary_language: 0, // english
    schooling_type: randomChoice([0, 1, 2, 3, 4, 5]),
    gender: randomChoice([0, 1, 2, 3]),
    
    // Developmental History
    multilingual_exposure: randomChoice([0, 1, 2, 3, 4]),
    multilingualExposure: randomChoice([0, 1, 2, 3, 4]),
    birthHistory: randomChoice([0, 1, 2, 3, 4]),
    age_first_word_months: randomInRange(8, 24),
    age_first_sentence_months: randomInRange(18, 36),
    history_speech_therapy: randomChoice([0, 1, 2, 3]),
    history_motor_delay: randomChoice([0, 1, 2, 3, 4]),
    
    // Sensory Health
    hearingStatus: randomChoice([0, 1, 2, 3]),
    hearing_concerns: randomChoice([0, 1]),
    visionStatus: randomChoice([0, 1, 2, 3]),
    vision_concerns: randomChoice([0, 1]),
    
    // Family History
    family_learning_difficulty: randomChoice([0, 1]),
    family_adhd: randomChoice([0, 1, 2, 3, 4]),
    
    // Assessment Metrics - Response Metrics
    mean_response_accuracy: randomFloat(0.4, 1.0),
    response_accuracy_std: randomFloat(0.0, 0.3),
    mean_response_time_ms: randomFloat(1000, 15000),
    response_time_std_ms: randomFloat(500, 5000),
    
    // Assessment Metrics - Task Performance
    task_completion_rate: randomFloat(0.6, 1.0),
    task_abandonment_count: randomInRange(0, 5),
    instruction_follow_accuracy: randomFloat(0.5, 1.0),
    
    // Assessment Metrics - Attention Metrics
    mean_focus_duration_sec: randomFloat(10, 120),
    attention_span_average: randomFloat(10, 120),
    random_interaction_rate: randomFloat(0.0, 0.3),
    
    // Assessment Metrics - Memory Metrics
    max_sequence_length: randomInRange(2, 10),
    
    // Assessment Metrics - Visual Processing
    visual_search_time_ms: randomFloat(1000, 20000),
    
    // Assessment Metrics - Auditory Processing
    auditory_processing_accuracy: randomFloat(0.4, 1.0),
    average_audio_replays: randomFloat(0, 5),
    pref_auditory: randomFloat(0.0, 1.0),
    
    // Assessment Metrics - Motor Coordination
    hand_laterality_accuracy: randomFloat(0.5, 1.0),
    finger_counting_accuracy: randomFloat(0.5, 1.0),
    hand_position_accuracy: randomFloat(0.5, 1.0),
  };
};

/**
 * Populate localStorage with random test data
 * This is used for the "skip quiz" testing feature
 */
export const populateTestDataInLocalStorage = () => {
  const { initializeUserData, saveUserData } = require('./userDataManager');
  
  // Initialize base structure
  let userData = initializeUserData();
  
  // Generate random test data
  const testData = generateRandomTestData();
  
  // Map back to user data structure
  userData.demographicInfo.age_months = testData.age_months;
  userData.demographicInfo.primary_language = 'english';
  userData.demographicInfo.schooling_type = ['not-enrolled', 'daycare', 'preschool-kindergarten', 'school', 'homeschooling', 'other'][testData.schooling_type];
  userData.demographicInfo.gender = ['male', 'female', 'other', 'prefer-not-to-say'][testData.gender];
  
  userData.developmentalHistory.multilingual_exposure = testData.multilingual_exposure;
  userData.developmentalHistory.multilingualExposure = ['Monolingual', 'Minimal', 'Moderate', 'High', 'Native bilingual'][testData.multilingualExposure];
  userData.developmentalHistory.birthHistory = ['full-term', 'preterm', 'nicu', 'complications', 'unknown'][testData.birthHistory];
  userData.developmentalHistory.age_first_word_months = testData.age_first_word_months;
  userData.developmentalHistory.age_first_sentence_months = testData.age_first_sentence_months;
  userData.developmentalHistory.history_speech_therapy = testData.history_speech_therapy;
  userData.developmentalHistory.history_motor_delay = testData.history_motor_delay;
  
  userData.sensoryHealth.hearingStatus = ['normal', 'concerns', 'diagnosed', 'not-tested'][testData.hearingStatus];
  userData.sensoryHealth.hearing_concerns = testData.hearing_concerns;
  userData.sensoryHealth.visionStatus = ['normal', 'glasses', 'concerns', 'not-tested'][testData.visionStatus];
  userData.sensoryHealth.vision_concerns = testData.vision_concerns;
  
  userData.familyHistory.family_learning_difficulty = testData.family_learning_difficulty;
  userData.familyHistory.family_adhd = ['no-history', 'one-parent', 'both-parents', 'siblings', 'unsure'][testData.family_adhd];
  
  // Assessment Metrics
  userData.assessmentMetrics.responseMetrics = {
    mean_response_accuracy: testData.mean_response_accuracy,
    response_accuracy_std: testData.response_accuracy_std,
    mean_response_time_ms: testData.mean_response_time_ms,
    response_time_std_ms: testData.response_time_std_ms,
  };
  
  userData.assessmentMetrics.taskPerformance = {
    task_completion_rate: testData.task_completion_rate,
    task_abandonment_count: testData.task_abandonment_count,
    instruction_follow_accuracy: testData.instruction_follow_accuracy,
  };
  
  userData.assessmentMetrics.attentionMetrics = {
    mean_focus_duration_sec: testData.mean_focus_duration_sec,
    attention_span_average: testData.attention_span_average,
    random_interaction_rate: testData.random_interaction_rate,
  };
  
  userData.assessmentMetrics.memoryMetrics = {
    max_sequence_length: testData.max_sequence_length,
  };
  
  userData.assessmentMetrics.visualProcessing = {
    visual_search_time_ms: testData.visual_search_time_ms,
  };
  
  userData.assessmentMetrics.auditoryProcessing = {
    auditory_processing_accuracy: testData.auditory_processing_accuracy,
    average_audio_replays: testData.average_audio_replays,
    pref_auditory: testData.pref_auditory,
  };
  
  userData.assessmentMetrics.motorCoordination = {
    hand_laterality_accuracy: testData.hand_laterality_accuracy,
    finger_counting_accuracy: testData.finger_counting_accuracy,
    hand_position_accuracy: testData.hand_position_accuracy,
  };
  
  // Save to localStorage
  saveUserData(userData);
  
  console.log('✓ Test data populated in localStorage:', userData);
  return userData;
};

export default {
  transformUserDataForFlask,
  generateRandomTestData,
  populateTestDataInLocalStorage,
};
