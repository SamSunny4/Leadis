# MediaPipe Integration for Leadis

## Overview

This integration adds advanced AI-powered motion tracking and behavioral analysis capabilities to the Leadis developmental screening platform using Google's MediaPipe framework. The implementation aligns with the objectives outlined in the main abstract, providing multimodal assessment capabilities for early identification of learning and developmental difficulties.

## Features

### 1. **Pose Estimation** (`MediaPipePoseEstimation.jsx`)
- Tracks full-body movements and skeleton landmarks
- Evaluates instruction-following capabilities
- Assesses motor planning and coordination
- Measures response time and accuracy
- Supports various instruction types:
  - Raise hands
  - Touch nose
  - Stand on one leg
  - Cross arms
  - Jumping movements

### 2. **Face Mesh & Attention Tracking** (`MediaPipeFaceMesh.jsx`)
- Monitors 468 facial landmarks in real-time
- Tracks eye gaze direction and focus
- Measures blink rate and patterns
- Analyzes head pose and orientation
- Calculates attention score and engagement level
- Detects when child is looking away from task

### 3. **Hand Tracking** (`MediaPipeHandTracking.jsx`)
- Detects and tracks 21 hand landmarks per hand
- Recognizes common gestures (pointing, peace sign, fist, pinch, etc.)
- Assesses fine motor skills:
  - Hand stability
  - Movement speed
  - Finger precision
  - Hand-eye coordination
- Analyzes motor patterns for developmental indicators

### 4. **Interactive Assessment** (`InteractiveAssessment.jsx`)
- Age-adaptive assessment paths (3-5, 5-7, 7-12 years)
- Combines all MediaPipe capabilities
- Sequences tasks based on developmental domains
- Collects multimodal behavioral data
- Generates comprehensive developmental risk profiles

### 5. **Demo Interface** (`MediaPipeDemo.jsx`)
- Interactive demonstration of all MediaPipe features
- Individual component testing
- Full assessment workflow
- Risk profile generation and analysis

## Installation

MediaPipe dependencies are already added to `package.json`:

```json
{
  "@mediapipe/tasks-vision": "^0.10.8",
  "@mediapipe/drawing_utils": "^0.3.1620248257"
}
```

Install dependencies:
```bash
npm install
```

## Usage

### Basic Component Usage

#### Pose Estimation
```jsx
import MediaPipePoseEstimation from './components/MediaPipePoseEstimation';

<MediaPipePoseEstimation
  instruction={{ 
    type: 'raise_hands', 
    text: 'Raise both hands above your head' 
  }}
  onPoseDetected={(data) => console.log('Pose:', data)}
  isActive={true}
  showVideo={true}
/>
```

#### Face Mesh / Attention Tracking
```jsx
import MediaPipeFaceMesh from './components/MediaPipeFaceMesh';

<MediaPipeFaceMesh
  onFaceDetected={(data) => console.log('Attention:', data.attentionMetrics)}
  isActive={true}
  trackAttention={true}
  showVideo={true}
/>
```

#### Hand Tracking
```jsx
import MediaPipeHandTracking from './components/MediaPipeHandTracking';

<MediaPipeHandTracking
  task={{ description: 'Make a pointing gesture' }}
  onHandDetected={(data) => console.log('Motor metrics:', data.motorMetrics)}
  isActive={true}
  showVideo={true}
  detectGestures={true}
/>
```

#### Full Assessment
```jsx
import InteractiveAssessment from './components/InteractiveAssessment';

<InteractiveAssessment
  ageGroup="5-7"
  onAssessmentComplete={(results) => {
    console.log('Assessment results:', results);
  }}
/>
```

### Demo Page
```jsx
import MediaPipeDemo from './components/MediaPipeDemo';

function App() {
  return <MediaPipeDemo />;
}
```

## Data Collection & Analysis

### Behavioral Signals Monitored

1. **Motor Coordination**
   - Hand stability (tremor detection)
   - Movement speed and fluency
   - Precision of finger positioning
   - Overall coordination score

2. **Attention & Engagement**
   - Gaze direction and consistency
   - Attention score (0-100%)
   - Engagement level (low/medium/high)
   - Blink rate patterns

3. **Instruction Following**
   - Response accuracy
   - Response time
   - Confidence scores
   - Task completion rates

### Risk Profile Generation

The system generates domain-based risk profiles:

```javascript
{
  domains: {
    motorCoordination: { riskLevel: 'low', score: 85 },
    attention: { riskLevel: 'moderate', score: 62 },
    instructionFollowing: { riskLevel: 'low', score: 78 }
  },
  overallRisk: 'low', // low, moderate, high
  recommendations: [],
  strengths: [],
  concerns: []
}
```

## Camera Requirements

- **Resolution**: Minimum 640x480 (VGA)
- **Lighting**: Good ambient lighting required
- **Position**: Child should be visible from head to waist for pose estimation
- **Distance**: 1-2 meters from camera optimal
- **Permissions**: Browser camera access required

## Browser Compatibility

- Chrome/Edge: ✅ Full support (recommended)
- Firefox: ✅ Full support
- Safari: ⚠️ Limited support (WebGL required)
- Mobile browsers: ⚠️ Performance may vary

## Performance Considerations

- GPU acceleration recommended
- Real-time processing at ~30 FPS
- Model files loaded from CDN (~2-10 MB per model)
- First load may take 3-5 seconds for model initialization

## Privacy & Ethics

As emphasized in the abstract:

- ✅ All processing happens locally in the browser
- ✅ No video data is stored or transmitted
- ✅ Only extracted metrics are saved (no raw images)
- ✅ Camera can be disabled after assessment
- ✅ Results emphasize risk profiling, not diagnosis
- ✅ Parent-friendly, transparent reporting

## Alignment with Abstract

This MediaPipe integration directly implements the abstract's requirements:

| Abstract Requirement | Implementation |
|---------------------|----------------|
| "Camera-based pose estimation to evaluate comprehension, motor planning, and coordination" | ✅ MediaPipePoseEstimation.jsx |
| "Passive behavioral monitoring" | ✅ MediaPipeFaceMesh.jsx (attention tracking) |
| "Assessment of motor coordination" | ✅ MediaPipeHandTracking.jsx |
| "Adaptive interaction and behavioral analysis" | ✅ InteractiveAssessment.jsx |
| "Multimodal data processing" | ✅ Combined analysis across all components |
| "Domain-based developmental risk profile" | ✅ Risk profile generation in MediaPipeDemo.jsx |

## File Structure

```
src/
├── components/
│   ├── MediaPipePoseEstimation.jsx    # Pose tracking
│   ├── MediaPipeFaceMesh.jsx          # Attention tracking
│   ├── MediaPipeHandTracking.jsx      # Motor coordination
│   ├── InteractiveAssessment.jsx      # Full assessment
│   └── MediaPipeDemo.jsx              # Demo interface
└── App.jsx                             # Main app (integration point)
```

## Next Steps

1. **Integrate with Parent Input**: Combine MediaPipe data with parent questionnaire responses
2. **Add Speech-to-Text**: Implement expressive language analysis
3. **Reading Analysis**: Add document upload and reading pattern tracking
4. **Mini-Games**: Create visual processing and memory games
5. **Report Generation**: Build parent-friendly PDF reports
6. **Professional Dashboard**: Create interface for healthcare providers

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS or localhost (required for camera access)
- Try different browser

### Performance Issues
- Close other tabs using camera/GPU
- Reduce video quality in component settings
- Ensure good lighting (helps tracking accuracy)

### Models Not Loading
- Check internet connection (models load from CDN)
- Clear browser cache
- Check browser console for errors

## Resources

- [MediaPipe Documentation](https://developers.google.com/mediapipe)
- [MediaPipe Tasks Vision API](https://developers.google.com/mediapipe/solutions/vision/pose_landmarker)
- [Leadis Main Abstract](../main_abstract.md)

## License

This integration is part of the Leadis platform. See main project license.
