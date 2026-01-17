/**
 * Quiz Test Utilities
 * Functions for testing the quiz and Flask integration
 */

import { populateTestDataInLocalStorage } from './dataTransformer';
import { transformUserDataForFlask } from './dataTransformer';
import { sendPredictionRequest, getUserCredential, checkFlaskHealth } from './flaskApiService';
import { updateRiskAssessment, getUserData } from './userDataManager';

/**
 * Skip quiz and populate with random test data
 * Then send to Flask for prediction
 * @returns {Promise<Object>} Test result with prediction
 */
export const skipQuizAndTest = async () => {
  try {
    console.log('🧪 Starting skip quiz test...');
    
    // Step 1: Check Flask server health
    console.log('1. Checking Flask server health...');
    const healthCheck = await checkFlaskHealth();
    if (!healthCheck.success) {
      throw new Error('Flask server is not available. Make sure it\'s running on http://localhost:5000');
    }
    console.log('✓ Flask server is healthy:', healthCheck.data);
    
    // Step 2: Populate test data in localStorage
    console.log('2. Populating random test data...');
    const testUserData = populateTestDataInLocalStorage();
    console.log('✓ Test data populated');
    
    // Step 3: Transform data for Flask
    console.log('3. Transforming data for Flask API...');
    const flaskData = transformUserDataForFlask(testUserData);
    console.log('✓ Data transformed');
    
    // Step 4: Get user credential
    const credential = getUserCredential();
    console.log('4. Using credential:', credential);
    
    // Step 5: Send to Flask for prediction
    console.log('5. Sending prediction request to Flask...');
    const predictionResult = await sendPredictionRequest(flaskData, credential);
    
    if (!predictionResult.success) {
      throw new Error(predictionResult.error || 'Prediction failed');
    }
    
    console.log('✓ Prediction received:', predictionResult.data);
    
    // Step 6: Store risk scores in localStorage
    if (predictionResult.data.prediction) {
      console.log('6. Storing risk scores in localStorage...');
      const riskScores = predictionResult.data.prediction;
      updateRiskAssessment(riskScores);
      console.log('✓ Risk scores stored:', riskScores);
    }
    
    console.log('🎉 Skip quiz test completed successfully!');
    
    return {
      success: true,
      testData: flaskData,
      prediction: predictionResult.data.prediction,
      credential,
    };
    
  } catch (error) {
    console.error('❌ Skip quiz test failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Test Flask connection only (without populating data)
 * @returns {Promise<Object>} Connection test result
 */
export const testFlaskConnection = async () => {
  try {
    console.log('Testing Flask connection...');
    const healthCheck = await checkFlaskHealth();
    
    if (healthCheck.success) {
      console.log('✓ Flask server is running and healthy');
      return {
        success: true,
        message: 'Flask server is running and healthy',
        data: healthCheck.data,
      };
    } else {
      return {
        success: false,
        error: 'Flask server is not responding',
      };
    }
  } catch (error) {
    console.error('Flask connection test error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send current user data to Flask for prediction
 * (without generating random data)
 * @returns {Promise<Object>} Prediction result
 */
export const sendCurrentDataToFlask = async () => {
  try {
    console.log('📤 Sending current user data to Flask...');
    
    // Get current user data
    const userData = getUserData();
    if (!userData) {
      throw new Error('No user data found in localStorage');
    }
    
    // Transform for Flask
    const flaskData = transformUserDataForFlask(userData);
    
    // Get credential
    const credential = getUserCredential();
    
    // Send prediction request
    const predictionResult = await sendPredictionRequest(flaskData, credential);
    
    if (!predictionResult.success) {
      throw new Error(predictionResult.error || 'Prediction failed');
    }
    
    // Store risk scores
    if (predictionResult.data.prediction) {
      updateRiskAssessment(predictionResult.data.prediction);
      console.log('✓ Risk scores stored:', predictionResult.data.prediction);
    }
    
    return {
      success: true,
      prediction: predictionResult.data.prediction,
      credential,
    };
    
  } catch (error) {
    console.error('❌ Send data to Flask failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Display test results in console
 * @param {Object} result - Test result object
 */
export const displayTestResults = (result) => {
  console.log('\n' + '='.repeat(60));
  console.log('QUIZ TEST RESULTS');
  console.log('='.repeat(60));
  
  if (result.success) {
    console.log('✅ Status: SUCCESS');
    console.log('\n📊 Risk Assessment Scores:');
    console.log(JSON.stringify(result.prediction, null, 2));
    console.log('\n🔑 User Credential:', result.credential);
  } else {
    console.log('❌ Status: FAILED');
    console.log('Error:', result.error);
  }
  
  console.log('='.repeat(60) + '\n');
};

export default {
  skipQuizAndTest,
  testFlaskConnection,
  sendCurrentDataToFlask,
  displayTestResults,
};
