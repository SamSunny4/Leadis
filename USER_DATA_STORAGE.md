# User Data Storage System

This system provides a structured way to store user assessment data in localStorage according to the `user-schema.json` specification.

## Files Created

1. **user-schema.json** - JSON Schema defining the data structure
2. **utils/userDataManager.js** - Core utility for managing user data in localStorage
3. **utils/assessmentDataCollector.js** - Helper functions for collecting assessment metrics

## Usage

### 1. Storing Form Data (Already Integrated in Screening Form)

The screening form automatically saves data to both legacy format and the new user-schema format:

```javascript
import { mapScreeningFormToUserData, saveUserData } from '@/utils/userDataManager';

// When form is submitted or changed
const userData = mapScreeningFormToUserData(formData);
saveUserData(userData);
```

### 2. Recording Assessment Metrics During Tests

Use the assessment data collector functions during interactive assessments:

```javascript
import { 
  recordResponse,
  recordTaskCompletion,
  recordFocusData,
  recordMemoryData,
  recordVisualData,
  recordAuditoryData,
  calculateRiskScores
} from '@/utils/assessmentDataCollector';

// Example: Record a user's response
recordResponse({
  isCorrect: true,
  responseTime: 1250 // milliseconds
});

// Example: Record task completion
recordTaskCompletion({
  completed: true,
  accuracy: 0.85
});

// Example: Record memory task
recordMemoryData({
  sequenceLength: 5
});

// Example: Record visual processing
recordVisualData({
  searchTime: 2500 // milliseconds
});

// Example: Record auditory processing
recordAuditoryData({
  accuracy: 0.88,
  replays: 1
});

// At the end of assessment, calculate risk scores
const riskScores = calculateRiskScores();
```

### 3. Retrieving User Data

```javascript
import { getUserData, getUserDataSummary } from '@/utils/userDataManager';

// Get full user data
const userData = getUserData();
console.log(userData);

// Get summary
const summary = getUserDataSummary();
console.log(summary);
// Output: { userId, lastUpdated, age_months, gender, hasAssessmentData, hasRiskScores }
```

### 4. Exporting Data

```javascript
import { exportUserData } from '@/utils/userDataManager';

// Export as JSON string
const jsonData = exportUserData();

// Download as file
const blob = new Blob([jsonData], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'user-assessment-data.json';
a.click();
```

### 5. Clearing Data

```javascript
import { clearUserData } from '@/utils/userDataManager';
import { clearAssessmentRecords } from '@/utils/assessmentDataCollector';

// Clear localStorage
clearUserData();

// Clear in-memory assessment records
clearAssessmentRecords();
```

## Data Structure

The user data is stored in localStorage under the key `leadis_user_data` with this structure:

```json
{
  "userId": "user_1234567890_abc123",
  "timestamp": "2026-01-16T10:30:00.000Z",
  "demographicInfo": {
    "primary_language": "english",
    "schooling_type": "school",
    "gender": "female",
    "age_months": 96
  },
  "developmentalHistory": {
    "multilingualExposure": "Minimal",
    "multilingual_exposure": 1,
    "birthHistory": "full-term",
    "age_first_word_months": 12,
    "age_first_sentence_months": 24,
    "history_speech_therapy": 0,
    "history_motor_delay": 0
  },
  "sensoryHealth": {
    "hearingStatus": "normal",
    "hearing_concerns": 0,
    "visionStatus": "glasses",
    "vision_concerns": 0
  },
  "familyHistory": {
    "family_learning_difficulty": 0,
    "family_adhd": "no-history"
  },
  "assessmentMetrics": {
    "responseMetrics": {
      "mean_response_accuracy": 0.87,
      "response_accuracy_std": 0.12,
      "mean_response_time_ms": 1450,
      "response_time_std_ms": 320
    },
    "taskPerformance": { ... },
    "attentionMetrics": { ... },
    "memoryMetrics": { ... },
    "visualProcessing": { ... },
    "auditoryProcessing": { ... },
    "speechMetrics": { ... },
    "readingMetrics": { ... }
  },
  "riskAssessment": {
    "risk_reading": 0.23,
    "risk_writing": 0.15,
    "risk_attention": 0.45,
    "risk_working_memory": 0.32,
    "risk_expressive_language": 0.18,
    "risk_receptive_language": 0.12,
    "risk_visual_processing": 0.28,
    "risk_motor_coordination": 0.0
  }
}
```

## Example: Integrating with Assessment Component

```javascript
'use client';

import { useState, useEffect } from 'react';
import { recordResponse, calculateRiskScores } from '@/utils/assessmentDataCollector';
import { getUserData } from '@/utils/userDataManager';

export default function ReadingAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const handleAnswer = (isCorrect) => {
    const responseTime = Date.now() - startTime;
    
    // Record the response
    recordResponse({
      isCorrect,
      responseTime
    });
    
    // Move to next question
    setCurrentQuestion(prev => prev + 1);
    setStartTime(Date.now());
  };

  const finishAssessment = () => {
    // Calculate final risk scores
    const riskScores = calculateRiskScores();
    console.log('Assessment complete. Risk scores:', riskScores);
    
    // Navigate to results page
    // router.push('/results');
  };

  return (
    <div>
      {/* Your assessment UI */}
      <button onClick={() => handleAnswer(true)}>Correct</button>
      <button onClick={() => handleAnswer(false)}>Incorrect</button>
      <button onClick={finishAssessment}>Finish</button>
    </div>
  );
}
```

## LocalStorage Keys

- `leadis_user_data` - Main user data (user-schema format)
- `leadis_screening_form` - Legacy screening form data (for backward compatibility)

## Notes

- Data is automatically saved to localStorage on every change
- The system maintains both legacy format and new user-schema format during transition
- Assessment metrics are calculated incrementally as tests are completed
- Risk scores are calculated at the end of all assessments
- All numeric values follow the ranges specified in field-mapping.json
