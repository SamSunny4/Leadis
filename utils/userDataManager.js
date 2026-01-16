/**
 * User Data Manager
 * Handles storing and retrieving user assessment data according to user-schema.json
 */

const USER_DATA_KEY = 'leadis_user_data';

/**
 * Initialize user data structure
 * @returns {Object} Empty user data structure
 */
export const initializeUserData = () => {
  return {
    userId: generateUserId(),
    timestamp: new Date().toISOString(),
    demographicInfo: {
      primary_language: null,
      schooling_type: null,
      gender: null,
      age_months: null
    },
    developmentalHistory: {
      multilingualExposure: null,
      multilingual_exposure: null,
      birthHistory: null,
      age_first_word_months: null,
      age_first_sentence_months: null,
      history_speech_therapy: 0,
      history_motor_delay: 0
    },
    sensoryHealth: {
      hearingStatus: null,
      hearing_concerns: 0,
      visionStatus: null,
      vision_concerns: 0
    },
    familyHistory: {
      family_learning_difficulty: 0,
      family_adhd: null
    },
    assessmentMetrics: {
      responseMetrics: {
        mean_response_accuracy: null,
        response_accuracy_std: null,
        mean_response_time_ms: null,
        response_time_std_ms: null
      },
      taskPerformance: {
        task_completion_rate: null,
        task_abandonment_count: 0,
        instruction_follow_accuracy: null
      },
      attentionMetrics: {
        mean_focus_duration_sec: null,
        attention_dropoff_slope: null,
        attention_span_average: null,
        random_interaction_rate: null
      },
      memoryMetrics: {
        max_sequence_length: null,
        sequence_order_error_rate: null
      },
      visualProcessing: {
        visual_search_time_ms: null,
        left_right_confusion_rate: null,
        pref_visual: null
      },
      auditoryProcessing: {
        auditory_processing_accuracy: null,
        average_audio_replays: 0,
        pref_auditory: null
      },
      speechMetrics: {
        speech_rate_wpm: null,
        hesitation_frequency: 0
      },
      readingMetrics: {
        reading_speed_wpm: null,
        reading_accuracy: null,
        letter_reversal_rate: null,
        audio_text_mismatch_rate: null
      }
    },
    riskAssessment: {
      risk_reading: null,
      risk_writing: null,
      risk_attention: null,
      risk_working_memory: null,
      risk_expressive_language: null,
      risk_receptive_language: null,
      risk_visual_processing: null,
      risk_motor_coordination: null
    }
  };
};

/**
 * Generate unique user ID
 * @returns {string} Unique user ID
 */
const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get user data from local storage
 * @returns {Object|null} User data or null if not found
 */
export const getUserData = () => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user data from localStorage:', error);
    return null;
  }
};

/**
 * Save user data to local storage
 * @param {Object} userData - User data to save
 * @returns {boolean} Success status
 */
export const saveUserData = (userData) => {
  try {
    // Update timestamp
    userData.timestamp = new Date().toISOString();
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
    return false;
  }
};

/**
 * Calculate age in months from date of birth
 * @param {string} dateOfBirth - Date of birth in YYYY-MM-DD format
 * @returns {number} Age in months
 */
export const calculateAgeInMonths = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                 (today.getMonth() - birthDate.getMonth());
  return months;
};

/**
 * Map screening form data to user schema
 * @param {Object} formData - Form data from screening form
 * @returns {Object} Mapped user data
 */
export const mapScreeningFormToUserData = (formData) => {
  const userData = getUserData() || initializeUserData();
  
  // Map demographic information
  userData.demographicInfo.primary_language = formData.primaryLanguage || 'english';
  userData.demographicInfo.gender = formData.gender || null;
  userData.demographicInfo.age_months = formData.dateOfBirth ? 
    calculateAgeInMonths(formData.dateOfBirth) : null;
  userData.demographicInfo.schooling_type = mapEducationalSetting(formData.educationalSetting);
  
  // Map developmental history
  userData.developmentalHistory.multilingualExposure = mapMultilingualExposure(formData.multilingualExposure);
  userData.developmentalHistory.multilingual_exposure = formData.multilingualExposure ? 
    parseInt(formData.multilingualExposure) : null;
  userData.developmentalHistory.birthHistory = formData.birthHistory || null;
  userData.developmentalHistory.age_first_word_months = formData.ageFirstWordMonths ? 
    parseInt(formData.ageFirstWordMonths) : null;
  userData.developmentalHistory.age_first_sentence_months = formData.ageFirstSentenceMonths ? 
    parseInt(formData.ageFirstSentenceMonths) : null;
  userData.developmentalHistory.history_speech_therapy = formData.historySpeechTherapy ? 
    parseInt(formData.historySpeechTherapy) : 0;
  userData.developmentalHistory.history_motor_delay = formData.historyMotorDelay ? 
    parseInt(formData.historyMotorDelay) : 0;
  
  // Map sensory health
  userData.sensoryHealth.hearingStatus = formData.hearingStatus || null;
  userData.sensoryHealth.hearing_concerns = ['concerns', 'diagnosed', 'not-tested'].includes(formData.hearingStatus) ? 1 : 0;
  userData.sensoryHealth.visionStatus = formData.visionStatus || null;
  userData.sensoryHealth.vision_concerns = ['concerns', 'not-tested'].includes(formData.visionStatus) ? 1 : 0;
  
  // Map family history
  userData.familyHistory.family_learning_difficulty = formData.familyLearningDifficulty && 
    formData.familyLearningDifficulty.length > 0 && 
    !formData.familyLearningDifficulty.includes('no-history') ? 1 : 0;
  userData.familyHistory.family_adhd = formData.familyADHD || 'no-history';
  
  return userData;
};

/**
 * Map educational setting to schooling type
 * @param {string} educationalSetting - Educational setting from form
 * @returns {string|null} Mapped schooling type
 */
const mapEducationalSetting = (educationalSetting) => {
  const mapping = {
    'not-enrolled': 'not-enrolled',
    'daycare': 'daycare',
    'preschool-kindergarten': 'preschool-kindergarten',
    'school': 'school',
    'homeschooling': 'homeschooling',
    'other': 'other'
  };
  return mapping[educationalSetting] || null;
};

/**
 * Map multilingual exposure number to category
 * @param {string|number} exposure - Exposure level
 * @returns {string|null} Mapped exposure category
 */
const mapMultilingualExposure = (exposure) => {
  const mapping = {
    '0': 'Monolingual',
    '1': 'Minimal',
    '2': 'Moderate',
    '3': 'High',
    '4': 'Native bilingual'
  };
  return mapping[String(exposure)] || null;
};

/**
 * Update assessment metrics
 * @param {Object} metrics - Assessment metrics to update
 * @returns {boolean} Success status
 */
export const updateAssessmentMetrics = (metrics) => {
  const userData = getUserData() || initializeUserData();
  
  // Update response metrics
  if (metrics.responseMetrics) {
    userData.assessmentMetrics.responseMetrics = {
      ...userData.assessmentMetrics.responseMetrics,
      ...metrics.responseMetrics
    };
  }
  
  // Update task performance
  if (metrics.taskPerformance) {
    userData.assessmentMetrics.taskPerformance = {
      ...userData.assessmentMetrics.taskPerformance,
      ...metrics.taskPerformance
    };
  }
  
  // Update attention metrics
  if (metrics.attentionMetrics) {
    userData.assessmentMetrics.attentionMetrics = {
      ...userData.assessmentMetrics.attentionMetrics,
      ...metrics.attentionMetrics
    };
  }
  
  // Update memory metrics
  if (metrics.memoryMetrics) {
    userData.assessmentMetrics.memoryMetrics = {
      ...userData.assessmentMetrics.memoryMetrics,
      ...metrics.memoryMetrics
    };
  }
  
  // Update visual processing
  if (metrics.visualProcessing) {
    userData.assessmentMetrics.visualProcessing = {
      ...userData.assessmentMetrics.visualProcessing,
      ...metrics.visualProcessing
    };
  }
  
  // Update auditory processing
  if (metrics.auditoryProcessing) {
    userData.assessmentMetrics.auditoryProcessing = {
      ...userData.assessmentMetrics.auditoryProcessing,
      ...metrics.auditoryProcessing
    };
  }
  
  // Update speech metrics
  if (metrics.speechMetrics) {
    userData.assessmentMetrics.speechMetrics = {
      ...userData.assessmentMetrics.speechMetrics,
      ...metrics.speechMetrics
    };
  }
  
  // Update reading metrics
  if (metrics.readingMetrics) {
    userData.assessmentMetrics.readingMetrics = {
      ...userData.assessmentMetrics.readingMetrics,
      ...metrics.readingMetrics
    };
  }
  
  return saveUserData(userData);
};

/**
 * Update risk assessment scores
 * @param {Object} riskScores - Risk assessment scores
 * @returns {boolean} Success status
 */
export const updateRiskAssessment = (riskScores) => {
  const userData = getUserData() || initializeUserData();
  
  userData.riskAssessment = {
    ...userData.riskAssessment,
    ...riskScores
  };
  
  return saveUserData(userData);
};

/**
 * Clear all user data
 * @returns {boolean} Success status
 */
export const clearUserData = () => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

/**
 * Export user data as JSON
 * @returns {string} JSON string of user data
 */
export const exportUserData = () => {
  const userData = getUserData();
  return JSON.stringify(userData, null, 2);
};

/**
 * Get summary of user data for display
 * @returns {Object} Summary of user data
 */
export const getUserDataSummary = () => {
  const userData = getUserData();
  if (!userData) return null;
  
  return {
    userId: userData.userId,
    lastUpdated: userData.timestamp,
    age_months: userData.demographicInfo.age_months,
    gender: userData.demographicInfo.gender,
    hasAssessmentData: Object.values(userData.assessmentMetrics.responseMetrics).some(v => v !== null),
    hasRiskScores: Object.values(userData.riskAssessment).some(v => v !== null)
  };
};
