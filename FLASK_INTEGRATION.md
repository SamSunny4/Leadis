# Leadis Flask Integration

## Overview

The Leadis UI is now connected to the leadis-predictor Flask server. When a user completes the quiz, their assessment data is automatically sent to the Flask API for risk prediction, and the results are stored in local storage and displayed to the user.

## Features Implemented

### 1. **Flask API Service** (`utils/flaskApiService.js`)
- Health check endpoint
- Session creation
- Prediction requests
- Session retrieval
- User credential management

### 2. **Data Transformer** (`utils/dataTransformer.js`)
- Transforms user data from localStorage format to Flask API format
- Maps categorical values to numerical encodings
- Generates random test data for testing
- Populates localStorage with test data

### 3. **Quiz Test Utilities** (`utils/quizTestUtils.js`)
- Skip quiz and test Flask integration
- Test Flask connection only
- Send current user data to Flask
- Display test results

### 4. **Quiz Integration** (`app/quiz/page.jsx`)
- Automatically sends quiz data to Flask upon completion
- Displays AI risk assessment results
- "Test Flask" button to skip quiz and test with random data
- Error handling and loading states

## How to Use

### Starting the Servers

#### 1. Start the Flask Server (leadis-predictor)

```bash
cd leadis-predictor
python server.py
```

The Flask server should start on `http://localhost:5000`

#### 2. Start the Leadis UI

```bash
cd Leadis
npm run dev
# or
pnpm dev
```

The UI should start on `http://localhost:3000`

### Testing the Integration

#### Option 1: Complete the Quiz Normally
1. Navigate to the quiz page
2. Complete all questions
3. Upon completion, data is automatically sent to Flask
4. View the AI Risk Assessment results on the completion screen

#### Option 2: Use the "Test Flask" Button (Quick Testing)
1. Navigate to the quiz page
2. Click the yellow **"Test Flask"** button in the header
3. Confirm the action
4. Random test data is generated and sent to Flask
5. Results are displayed immediately

### What Happens Behind the Scenes

1. **Quiz Completion**:
   - Quiz metrics are tracked in real-time using `quizMetricsTracker.js`
   - Data is stored in localStorage in the user data format

2. **Data Transformation**:
   - User data is transformed from localStorage format to Flask API format
   - Categorical values are mapped to numerical encodings based on `field-mapping.json`

3. **Flask Prediction**:
   - Data is sent to `POST /predict` endpoint
   - Flask processes the data through the ML model
   - Prediction results (risk scores) are returned

4. **Result Storage**:
   - Risk scores are stored in localStorage under `riskAssessment`
   - Results are displayed on the completion screen
   - User credential is saved for session retrieval

## Data Flow

```
Quiz Questions
    ↓
User Responses → quizMetricsTracker
    ↓
localStorage (user_data)
    ↓
dataTransformer → Flask Format
    ↓
Flask API (/predict)
    ↓
ML Model Prediction
    ↓
Risk Scores → localStorage
    ↓
UI Display
```

## API Endpoints Used

### 1. Health Check
```
GET http://localhost:5000/health
```

### 2. Create Session
```
POST http://localhost:5000/session/create
Body: { "credential": "user_credential" }
```

### 3. Predict
```
POST http://localhost:5000/predict
Body: {
  "credential": "user_credential",
  ...user_data_in_flask_format
}
```

### 4. Get Session
```
GET http://localhost:5000/session/<credential>
```

## Data Structure

### Input to Flask (Transformed Data)
```javascript
{
  // Demographic
  age_months: 72,
  primary_language: 0,
  schooling_type: 2,
  gender: 0,
  
  // Developmental
  multilingual_exposure: 1,
  age_first_word_months: 12,
  age_first_sentence_months: 24,
  history_speech_therapy: 0,
  history_motor_delay: 0,
  
  // Assessment Metrics
  mean_response_accuracy: 0.85,
  mean_response_time_ms: 3500,
  task_completion_rate: 0.95,
  max_sequence_length: 5,
  visual_search_time_ms: 4200,
  auditory_processing_accuracy: 0.78,
  hand_laterality_accuracy: 0.92,
  // ... etc
}
```

### Output from Flask (Prediction)
```javascript
{
  risk_reading: 0.23,
  risk_writing: 0.15,
  risk_attention: 0.42,
  risk_working_memory: 0.31,
  risk_receptive_language: 0.18,
  risk_visual_processing: 0.25,
  risk_motor_coordination: 0.12
}
```

## Testing Functions

### Console Testing

You can also test the integration from the browser console:

```javascript
// Test Flask connection
const { testFlaskConnection } = await import('/utils/quizTestUtils.js');
await testFlaskConnection();

// Skip quiz and test
const { skipQuizAndTest } = await import('/utils/quizTestUtils.js');
const result = await skipQuizAndTest();

// Send current user data
const { sendCurrentDataToFlask } = await import('/utils/quizTestUtils.js');
await sendCurrentDataToFlask();
```

## Troubleshooting

### Flask Server Not Running
**Error**: "Flask server is not available"
**Solution**: Make sure the Flask server is running on port 5000

```bash
cd leadis-predictor
python server.py
```

### CORS Issues
The Flask server has CORS enabled. If you still encounter CORS issues, check that `flask-cors` is installed:

```bash
pip install flask-cors
```

### Model Not Loaded
**Error**: "Model not loaded"
**Solution**: Train the model first

```bash
cd leadis-predictor
python train.py
```

This will create the `model.pkl` file that the server loads.

### No User Data
**Error**: "No user data found in localStorage"
**Solution**: Either:
1. Complete the screening form first
2. Use the "Test Flask" button to generate random data

## Files Modified/Created

### New Files
- `Leadis/utils/flaskApiService.js` - Flask API communication
- `Leadis/utils/dataTransformer.js` - Data transformation and test data generation
- `Leadis/utils/quizTestUtils.js` - Testing utilities

### Modified Files
- `Leadis/app/quiz/page.jsx` - Added Flask integration and test button

## Features

✅ Automatic data submission to Flask upon quiz completion
✅ Real-time risk assessment display
✅ Test button for quick Flask integration testing
✅ Random test data generation
✅ Error handling and user feedback
✅ Loading states during prediction
✅ Results stored in localStorage
✅ User credential management for session retrieval

## Next Steps

1. **Train the Model**: Make sure you have a trained model in `leadis-predictor/model.pkl`
2. **Test the Integration**: Use the "Test Flask" button to verify everything works
3. **Complete a Quiz**: Try completing the full quiz to see the end-to-end flow
4. **View Results**: Check the completion screen for AI risk assessment results

## Notes

- User credentials are automatically generated and stored in localStorage
- All data transformations follow the `field-mapping.json` specification
- Risk scores range from 0.0 to 1.0 (0% to 100%)
- The Flask server saves predictions to the database for future reference
