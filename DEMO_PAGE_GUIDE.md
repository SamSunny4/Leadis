# MediaPipe Demo Page - Quick Start Guide

## ✅ Successfully Integrated!

Your Leadis app now includes a complete MediaPipe demonstration page accessible directly from the main landing page.

## How to Access the Demo

### Option 1: Navigation Bar
Click the **"MediaPipe Demo"** button (purple) in the top navigation bar

### Option 2: Hero Section
Click the **"Try MediaPipe Demo"** button in the main hero section below "Start Free Screening"

## What's Available in the Demo

The demo page includes 4 interactive modules:

### 1. **Pose Estimation Demo**
- Tracks body movements and skeleton landmarks
- Tests instruction-following with "Raise both hands above your head"
- Real-time pose detection overlay

### 2. **Attention Tracking Demo**
- Monitors gaze direction and eye focus
- Displays attention score (0-100%)
- Shows engagement level (low/medium/high)
- Tracks blink rate

### 3. **Motor Coordination Demo**
- Detects hand gestures
- Analyzes hand stability, speed, precision
- Real-time motor skills metrics

### 4. **Full Assessment**
- Complete age-adaptive screening workflow
- Combines all MediaPipe capabilities
- Generates developmental risk profiles

## Running the App

```bash
npm run dev
```

The app is now running at: **http://localhost:3001**

## Navigation

- **Back to Home**: Click the "← Back to Home" button when on the demo page
- The demo uses a simple state toggle system - no routing needed!

## Technical Details

### Files Modified
- ✅ `src/App.jsx` - Added demo navigation and state management

### New Components Created
- ✅ `src/components/MediaPipeDemo.jsx` - Main demo page
- ✅ `src/components/InteractiveAssessment.jsx` - Full assessment module
- ✅ `src/components/MediaPipePoseEstimation.jsx` - Pose tracking
- ✅ `src/components/MediaPipeFaceMesh.jsx` - Attention tracking
- ✅ `src/components/MediaPipeHandTracking.jsx` - Hand tracking

### Dependencies Installed
- ✅ `@mediapipe/tasks-vision` - Core MediaPipe library
- ✅ `@mediapipe/drawing_utils` - Visualization utilities

## Camera Permissions

When you first access any of the demos, your browser will ask for camera permissions. You must allow camera access for the MediaPipe features to work.

## Features Demonstrated

✅ Real-time pose estimation  
✅ Attention and engagement tracking  
✅ Fine motor coordination assessment  
✅ Gesture recognition  
✅ Multimodal behavioral analysis  
✅ Risk profile generation  

## Next Steps

You can now:
1. Test each individual demo
2. Try the full assessment workflow
3. Customize the assessment tasks
4. Integrate with your backend for data storage
5. Add more developmental screening modules

## Documentation

Full integration details: [MEDIAPIPE_INTEGRATION.md](./MEDIAPIPE_INTEGRATION.md)

---

**Ready to use!** Open http://localhost:3001 and click "MediaPipe Demo" to get started.
