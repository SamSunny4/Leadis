/**
 * Flask API Service
 * Handles communication with the leadis-predictor Flask server
 */

const FLASK_API_URL = 'http://localhost:5000';

/**
 * Check if Flask server is healthy
 * @returns {Promise<Object>} Health status
 */
export const checkFlaskHealth = async () => {
  try {
    const response = await fetch(`${FLASK_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Flask health check error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to connect to Flask server'
    };
  }
};

/**
 * Create a new quiz session on Flask server
 * @param {string} credential - User credential/identifier
 * @returns {Promise<Object>} Session creation response
 */
export const createFlaskSession = async (credential) => {
  try {
    const response = await fetch(`${FLASK_API_URL}/session/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });
    
    if (!response.ok) {
      throw new Error(`Session creation failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Flask session creation error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create session'
    };
  }
};

/**
 * Send prediction request to Flask server
 * @param {Object} userData - User assessment data prepared for Flask
 * @param {string} credential - User credential/identifier
 * @returns {Promise<Object>} Prediction response with risk scores
 */
export const sendPredictionRequest = async (userData, credential) => {
  try {
    // Add credential to the data
    const requestData = {
      ...userData,
      credential,
    };
    
    console.log('Sending prediction request to Flask:', requestData);
    
    const response = await fetch(`${FLASK_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Prediction failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Flask prediction response:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Flask prediction error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to get prediction'
    };
  }
};

/**
 * Retrieve session data from Flask server
 * @param {string} credential - User credential/identifier
 * @returns {Promise<Object>} Session data
 */
export const getFlaskSession = async (credential) => {
  try {
    const response = await fetch(`${FLASK_API_URL}/session/${credential}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Session retrieval failed: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Flask session retrieval error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to retrieve session'
    };
  }
};

/**
 * Get user credential from localStorage or generate one
 * @returns {string} User credential
 */
export const getUserCredential = () => {
  const CREDENTIAL_KEY = 'leadis_user_credential';
  
  // Try to get existing credential
  let credential = localStorage.getItem(CREDENTIAL_KEY);
  
  // Generate new credential if doesn't exist
  if (!credential) {
    credential = `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(CREDENTIAL_KEY, credential);
  }
  
  return credential;
};

/**
 * Clear user credential
 */
export const clearUserCredential = () => {
  localStorage.removeItem('leadis_user_credential');
};

export default {
  checkFlaskHealth,
  createFlaskSession,
  sendPredictionRequest,
  getFlaskSession,
  getUserCredential,
  clearUserCredential,
};
