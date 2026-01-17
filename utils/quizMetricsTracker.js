/**
 * Quiz Metrics Tracker
 * Tracks detailed metrics during quiz sessions and updates leadis_user_data in localStorage
 */

import { getUserData, saveUserData, initializeUserData } from './userDataManager';

// Session storage for real-time tracking
let quizSession = {
  startTime: null,
  questionStartTime: null,
  questionResponses: [],
  minigameResults: [],
  apdResults: [],
  interactiveResults: [],
  totalQuestions: 0,
  completedQuestions: 0,
  skippedQuestions: 0,
};

/**
 * Start a new quiz session
 */
export const startQuizSession = () => {
  quizSession = {
    startTime: Date.now(),
    questionStartTime: null,
    questionResponses: [],
    minigameResults: [],
    apdResults: [],
    interactiveResults: [],
    totalQuestions: 0,
    completedQuestions: 0,
    skippedQuestions: 0,
  };
  console.log('Quiz session started at:', new Date(quizSession.startTime).toISOString());
};

/**
 * Start timing for a new question
 * @param {Object} question - The current question object
 */
export const startQuestionTimer = (question) => {
  quizSession.questionStartTime = Date.now();
  quizSession.totalQuestions++;
};

/**
 * Record a question response
 * @param {Object} question - The question object
 * @param {any} answer - The user's answer
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} audioReplays - Number of times audio was replayed (optional)
 */
export const recordQuestionResponse = (question, answer, isCorrect, audioReplays = 0) => {
  const responseTime = quizSession.questionStartTime 
    ? Date.now() - quizSession.questionStartTime 
    : 0;
  
  const response = {
    questionId: question.id,
    questionType: question.type || 'text',
    category: question.category || 'general',
    difficulty: question.difficulty || 'medium',
    responseTimeMs: responseTime,
    isCorrect,
    audioReplays: audioReplays || 0, // Track audio replays for audio questions
    timestamp: Date.now(),
    answer: typeof answer === 'object' ? 'complex_data' : answer,
  };
  
  quizSession.questionResponses.push(response);
  quizSession.completedQuestions++;
  
  console.log('Question response recorded:', response);
  
  // Update localStorage in real-time
  updateUserDataMetrics();
};

/**
 * Record a minigame result
 * @param {Object} result - Minigame result data
 */
export const recordMinigameResult = (result) => {
  const minigameData = {
    gameType: result.gameType || 'unknown',
    score: result.score || 0,
    maxScore: result.maxScore || 0,
    accuracy: result.accuracy || 0,
    completionTimeMs: result.completionTime || 0,
    sequenceLength: result.sequenceLength || null,
    errors: result.errors || 0,
    level: result.level || 1,
    clickCount: result.clickCount || 0,
    searchTimeMs: result.searchTime || result.completionTime || 0,
    timestamp: Date.now(),
  };
  
  quizSession.minigameResults.push(minigameData);
  console.log('Minigame result recorded:', minigameData);
  
  updateUserDataMetrics();
};

/**
 * Record APD (Auditory Processing Disorder) test result
 * @param {Object} result - APD test result data
 */
export const recordAPDResult = (result) => {
  const apdData = {
    testType: result.testType || 'unknown',
    score: result.score || 0,
    accuracy: result.accuracy || 0,
    audioReplays: result.audioReplays || 0,
    responseTimeMs: result.responseTime || 0,
    wordsCorrect: result.wordsCorrect || 0,
    wordsTotal: result.wordsTotal || 0,
    timestamp: Date.now(),
  };
  
  quizSession.apdResults.push(apdData);
  console.log('APD result recorded:', apdData);
  
  updateUserDataMetrics();
};

/**
 * Record interactive assessment result (hand motor, etc.)
 * @param {Object} result - Interactive assessment result data
 */
export const recordInteractiveResult = (result) => {
  const interactiveData = {
    section: result.section || 'unknown',
    duration: result.duration || 0,
    completionRate: result.completionRate || 0,
    averageAccuracy: result.averageAccuracy || 0,
    fingerCountingAccuracy: result.fingerCountingAccuracy || null,
    handLateralityAccuracy: result.handLateralityAccuracy || null,
    handPositionAccuracy: result.handPositionAccuracy || null,
    taskResults: result.taskResults || [],
    timestamp: Date.now(),
  };
  
  quizSession.interactiveResults.push(interactiveData);
  console.log('Interactive result recorded:', interactiveData);
  
  updateUserDataMetrics();
};

/**
 * Record a skipped question
 */
export const recordSkippedQuestion = () => {
  quizSession.skippedQuestions++;
  updateUserDataMetrics();
};

/**
 * Create standardized minigame result object for Find Character game
 * @param {Object} gameData - Game completion data
 * @returns {Object} Formatted result for recordMinigameResult
 */
export const createFindCharacterResult = (gameData) => {
  return {
    gameType: 'find-character',
    score: gameData.score || 0,
    maxScore: gameData.targetScore || 5,
    accuracy: gameData.score / (gameData.targetScore || 5),
    completionTime: gameData.completionTime || 0,
    searchTime: gameData.averageSearchTime || 0,
    clickCount: gameData.totalClicks || 0,
    errors: gameData.incorrectClicks || 0,
  };
};

/**
 * Create standardized minigame result object for Sequence Memory game
 * @param {Object} gameData - Game completion data
 * @returns {Object} Formatted result for recordMinigameResult
 */
export const createSequenceMemoryResult = (gameData) => {
  return {
    gameType: 'sequence-memory',
    score: gameData.level || 1,
    maxScore: gameData.level || 1,
    accuracy: 1.0, // Reached this level successfully
    completionTime: gameData.completionTime || 0,
    sequenceLength: gameData.level || 1,
    level: gameData.level || 1,
    errors: 0,
  };
};

/**
 * Calculate aggregate metrics from session data
 * @returns {Object} Aggregated metrics
 */
const calculateAggregateMetrics = () => {
  const responses = quizSession.questionResponses;
  
  // Response metrics
  const correctResponses = responses.filter(r => r.isCorrect);
  const responseTimes = responses.map(r => r.responseTimeMs).filter(t => t > 0);
  
  const meanResponseAccuracy = responses.length > 0 
    ? correctResponses.length / responses.length 
    : null;
  
  const meanResponseTimeMs = responseTimes.length > 0 
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
    : null;
  
  const responseTimeStd = responseTimes.length > 1 
    ? Math.sqrt(responseTimes.reduce((sum, t) => sum + Math.pow(t - meanResponseTimeMs, 2), 0) / responseTimes.length)
    : null;
  
  const accuracies = responses.map(r => r.isCorrect ? 1 : 0);
  const responseAccuracyStd = accuracies.length > 1
    ? Math.sqrt(accuracies.reduce((sum, a) => sum + Math.pow(a - meanResponseAccuracy, 2), 0) / accuracies.length)
    : null;
  
  // Task performance
  const taskCompletionRate = quizSession.totalQuestions > 0 
    ? quizSession.completedQuestions / quizSession.totalQuestions 
    : null;
  
  // Category-specific accuracy
  const getCategoryAccuracy = (category) => {
    const categoryResponses = responses.filter(r => r.category === category);
    if (categoryResponses.length === 0) return null;
    return categoryResponses.filter(r => r.isCorrect).length / categoryResponses.length;
  };
  
  // Question type-specific metrics
  const getTypeMetrics = (type) => {
    const typeResponses = responses.filter(r => r.questionType === type);
    if (typeResponses.length === 0) return { accuracy: null, avgTime: null, count: 0 };
    
    const correct = typeResponses.filter(r => r.isCorrect).length;
    const times = typeResponses.map(r => r.responseTimeMs).filter(t => t > 0);
    
    return {
      accuracy: correct / typeResponses.length,
      avgTime: times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null,
      count: typeResponses.length,
    };
  };
  
  // Memory metrics from sequence games
  const sequenceGames = quizSession.minigameResults.filter(m => 
    m.gameType === 'sequence' || m.gameType === 'sequence-memory'
  );
  const maxSequenceLength = sequenceGames.length > 0 
    ? Math.max(...sequenceGames.map(s => s.sequenceLength || 0))
    : null;
  
  // APD metrics - combine APD tests and audio questions
  const apdResults = quizSession.apdResults;
  const audioQuestionResponses = responses.filter(r => r.questionType === 'audio');
  
  // Combine accuracy from APD tests and audio questions
  const allAuditoryData = [
    ...apdResults.map(r => ({ accuracy: r.accuracy, audioReplays: r.audioReplays || 0 })),
    ...audioQuestionResponses.map(r => ({ accuracy: r.isCorrect ? 1 : 0, audioReplays: r.audioReplays || 0 }))
  ];
  
  const apdAccuracy = allAuditoryData.length > 0 
    ? allAuditoryData.reduce((sum, r) => sum + r.accuracy, 0) / allAuditoryData.length 
    : null;
    
  const totalAudioReplays = allAuditoryData.reduce((sum, r) => sum + r.audioReplays, 0);
  const avgAudioReplays = allAuditoryData.length > 0 
    ? totalAudioReplays / allAuditoryData.length 
    : 0;
  
  // Interactive/Motor metrics
  const motorResults = quizSession.interactiveResults;
  const motorMetrics = motorResults.length > 0 ? {
    fingerCountingAccuracy: motorResults
      .filter(r => r.fingerCountingAccuracy !== null)
      .reduce((sum, r, _, arr) => sum + r.fingerCountingAccuracy / arr.length, 0) || null,
    handLateralityAccuracy: motorResults
      .filter(r => r.handLateralityAccuracy !== null)
      .reduce((sum, r, _, arr) => sum + r.handLateralityAccuracy / arr.length, 0) || null,
    handPositionAccuracy: motorResults
      .filter(r => r.handPositionAccuracy !== null)
      .reduce((sum, r, _, arr) => sum + r.handPositionAccuracy / arr.length, 0) || null,
  } : {};
  
  // Visual processing metrics
  const visualResponses = responses.filter(r => r.questionType === 'visual');
  const visualMinigames = quizSession.minigameResults.filter(m => 
    m.gameType === 'find-character' || m.gameType === 'visual-search'
  );
  
  // Combine visual question response times and visual minigame search times
  const allVisualTimes = [
    ...visualResponses.map(r => r.responseTimeMs),
    ...visualMinigames.map(m => m.searchTimeMs || m.completionTimeMs)
  ].filter(t => t > 0);
  
  const visualSearchTime = allVisualTimes.length > 0 
    ? allVisualTimes.reduce((sum, t) => sum + t, 0) / allVisualTimes.length 
    : null;
  
  // Total session time
  const totalSessionTimeMs = quizSession.startTime 
    ? Date.now() - quizSession.startTime 
    : 0;
  
  // Attention metrics - estimate based on response patterns
  const attentionSpanAverage = responseTimes.length > 0 
    ? totalSessionTimeMs / (quizSession.completedQuestions || 1) / 1000 
    : null;
  
  return {
    responseMetrics: {
      mean_response_accuracy: meanResponseAccuracy,
      response_accuracy_std: responseAccuracyStd,
      mean_response_time_ms: meanResponseTimeMs ? Math.round(meanResponseTimeMs) : null,
      response_time_std_ms: responseTimeStd ? Math.round(responseTimeStd) : null,
    },
    taskPerformance: {
      task_completion_rate: taskCompletionRate,
      task_abandonment_count: quizSession.skippedQuestions,
      instruction_follow_accuracy: meanResponseAccuracy,
    },
    attentionMetrics: {
      mean_focus_duration_sec: attentionSpanAverage,
      attention_span_average: attentionSpanAverage,
      random_interaction_rate: null, // Would need touch/click tracking
    },
    memoryMetrics: {
      max_sequence_length: maxSequenceLength,
    },
    visualProcessing: {
      visual_search_time_ms: visualSearchTime ? Math.round(visualSearchTime) : null,
    },
    auditoryProcessing: {
      auditory_processing_accuracy: apdAccuracy,
      average_audio_replays: Math.round(avgAudioReplays * 10) / 10,
      pref_auditory: null, // Learning preference - could be calculated from performance comparison
    },
    motorCoordination: {
      hand_laterality_accuracy: motorMetrics.handLateralityAccuracy || null,
      finger_counting_accuracy: motorMetrics.fingerCountingAccuracy || null,
      hand_position_accuracy: motorMetrics.handPositionAccuracy || null,
    },
    // Additional session data for detailed tracking
    sessionData: {
      totalSessionTimeMs,
      totalQuestions: quizSession.totalQuestions,
      completedQuestions: quizSession.completedQuestions,
      skippedQuestions: quizSession.skippedQuestions,
      questionTypeMetrics: {
        text: getTypeMetrics('text'),
        audio: getTypeMetrics('audio'),
        visual: getTypeMetrics('visual'),
        minigame: getTypeMetrics('minigame'),
        apd: getTypeMetrics('apd-test'),
        interactive: getTypeMetrics('interactive-assessment'),
      },
      categoryAccuracy: {
        reading: getCategoryAccuracy('reading'),
        writing: getCategoryAccuracy('writing'),
        math: getCategoryAccuracy('math'),
        attention: getCategoryAccuracy('attention'),
        memory: getCategoryAccuracy('memory'),
        language: getCategoryAccuracy('language'),
      },
    },
  };
};

/**
 * Update user data in localStorage with current metrics
 */
const updateUserDataMetrics = () => {
  try {
    const userData = getUserData() || initializeUserData();
    const metrics = calculateAggregateMetrics();
    
    // Update assessment metrics
    userData.assessmentMetrics.responseMetrics = {
      ...userData.assessmentMetrics.responseMetrics,
      ...metrics.responseMetrics,
    };
    
    userData.assessmentMetrics.taskPerformance = {
      ...userData.assessmentMetrics.taskPerformance,
      ...metrics.taskPerformance,
    };
    
    userData.assessmentMetrics.attentionMetrics = {
      ...userData.assessmentMetrics.attentionMetrics,
      ...metrics.attentionMetrics,
    };
    
    userData.assessmentMetrics.memoryMetrics = {
      ...userData.assessmentMetrics.memoryMetrics,
      ...metrics.memoryMetrics,
    };
    
    userData.assessmentMetrics.visualProcessing = {
      ...userData.assessmentMetrics.visualProcessing,
      ...metrics.visualProcessing,
    };
    
    userData.assessmentMetrics.auditoryProcessing = {
      ...userData.assessmentMetrics.auditoryProcessing,
      ...metrics.auditoryProcessing,
    };
    
    // Add motor coordination if not present
    if (!userData.assessmentMetrics.motorCoordination) {
      userData.assessmentMetrics.motorCoordination = {};
    }
    userData.assessmentMetrics.motorCoordination = {
      ...userData.assessmentMetrics.motorCoordination,
      ...metrics.motorCoordination,
    };
    
    // Store session data for detailed analysis
    userData.quizSessionData = {
      lastSessionTimestamp: new Date().toISOString(),
      ...metrics.sessionData,
    };
    
    saveUserData(userData);
    console.log('User data updated with quiz metrics');
  } catch (error) {
    console.error('Error updating user data metrics:', error);
  }
};

/**
 * End quiz session and finalize all metrics
 * @returns {Object} Final session metrics
 */
export const endQuizSession = () => {
  const metrics = calculateAggregateMetrics();
  updateUserDataMetrics();
  
  console.log('Quiz session ended. Final metrics:', metrics);
  
  // Reset session
  const finalSession = { ...quizSession };
  quizSession = {
    startTime: null,
    questionStartTime: null,
    questionResponses: [],
    minigameResults: [],
    apdResults: [],
    interactiveResults: [],
    totalQuestions: 0,
    completedQuestions: 0,
    skippedQuestions: 0,
  };
  
  return {
    session: finalSession,
    metrics,
  };
};

/**
 * Get current session statistics
 * @returns {Object} Current session stats
 */
export const getSessionStats = () => {
  return {
    questionsAnswered: quizSession.questionResponses.length,
    correctAnswers: quizSession.questionResponses.filter(r => r.isCorrect).length,
    minigamesPlayed: quizSession.minigameResults.length,
    apdTestsTaken: quizSession.apdResults.length,
    interactiveCompleted: quizSession.interactiveResults.length,
    sessionDuration: quizSession.startTime ? Date.now() - quizSession.startTime : 0,
  };
};

export default {
  startQuizSession,
  startQuestionTimer,
  recordQuestionResponse,
  recordMinigameResult,
  recordAPDResult,
  recordInteractiveResult,
  recordSkippedQuestion,
  endQuizSession,
  getSessionStats,
};
