'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  recordFaceDetection,
  recordNoFaceDetected,
  startFaceTrackingSession,
  stopFaceTrackingSession,
  getCurrentAttentionMetrics,
} from '@/utils/faceTrackingService';

/**
 * FaceTrackingOverlay Component
 * 
 * Provides always-on face tracking during quiz and mini games
 * Runs in the background and updates user data with attention metrics
 */
const FaceTrackingOverlay = ({
  isActive = true,
  showPreview = false,
  showMetrics = false,
  onAttentionChange = null,
  minimized = true,
  position = 'top-right',
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('pending');
  const [currentMetrics, setCurrentMetrics] = useState(null);
  const animationFrameId = useRef(null);
  const lastBlinkTime = useRef(0);
  const blinkCounter = useRef(0);
  const gazeHistory = useRef([]);
  const streamRef = useRef(null);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
        console.log('🎯 Initializing Face Landmarker...');
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true
        });

        setFaceLandmarker(landmarker);
        setIsInitialized(true);
        console.log('✅ Face Landmarker initialized');
      } catch (err) {
        console.error("❌ Error initializing face landmarker:", err);
        setError("Failed to initialize face tracking");
      }
    };

    initializeFaceLandmarker();

    return () => {
      if (faceLandmarker) {
        faceLandmarker.close();
      }
    };
  }, []);

  // Initialize webcam
  useEffect(() => {
    const initializeWebcam = async () => {
      try {
        console.log('📷 Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          }
        });
        
        streamRef.current = stream;
        setCameraPermission('granted');
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
            console.log('📹 Camera stream loaded');
            if (isActive && faceLandmarker) {
              // Start face tracking session
              startFaceTrackingSession();
              detectFace();
            }
          });
        }
      } catch (err) {
        console.error("❌ Error accessing webcam:", err);
        setCameraPermission('denied');
        setError("Camera access denied. Face tracking disabled.");
      }
    };

    if (isActive && isInitialized) {
      initializeWebcam();
    }

    return () => {
      // Cleanup
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopFaceTrackingSession();
    };
  }, [isActive, isInitialized]);

  // Analyze attention from face landmarks
  const analyzeAttention = useCallback((landmarks, blendshapes) => {
    const metrics = {
      gazeDirection: 'center',
      blinkCount: blinkCounter.current,
      attentionScore: 100,
      engagementLevel: 'high',
      headPose: 'forward',
      lookingAway: false
    };

    // Detect blinks using blendshapes
    const eyeBlinkLeft = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft')?.score || 0;
    const eyeBlinkRight = blendshapes.find(b => b.categoryName === 'eyeBlinkRight')?.score || 0;
    
    if (eyeBlinkLeft > 0.6 && eyeBlinkRight > 0.6) {
      const now = Date.now();
      if (now - lastBlinkTime.current > 300) {
        blinkCounter.current++;
        lastBlinkTime.current = now;
      }
    }

    // Detect gaze direction using eye landmarks
    if (landmarks.length > 473) {
      const leftEye = landmarks[468];
      const rightEye = landmarks[473];
      const noseTip = landmarks[1];
      
      const eyeCenterX = (leftEye.x + rightEye.x) / 2;
      const gazeOffset = eyeCenterX - noseTip.x;
      
      if (Math.abs(gazeOffset) < 0.02) {
        metrics.gazeDirection = 'center';
      } else if (gazeOffset > 0.02) {
        metrics.gazeDirection = 'right';
        metrics.lookingAway = true;
      } else {
        metrics.gazeDirection = 'left';
        metrics.lookingAway = true;
      }
    }

    // Track gaze history for attention consistency
    gazeHistory.current.push({
      direction: metrics.gazeDirection,
      timestamp: Date.now()
    });

    // Keep only last 30 seconds
    gazeHistory.current = gazeHistory.current.filter(
      g => Date.now() - g.timestamp < 30000
    );

    // Calculate attention score
    const centerGazeRatio = gazeHistory.current.filter(
      g => g.direction === 'center'
    ).length / Math.max(gazeHistory.current.length, 1);

    metrics.attentionScore = Math.round(centerGazeRatio * 100);

    // Determine engagement level
    if (metrics.attentionScore > 70) {
      metrics.engagementLevel = 'high';
    } else if (metrics.attentionScore > 40) {
      metrics.engagementLevel = 'medium';
    } else {
      metrics.engagementLevel = 'low';
    }

    // Detect head pose
    if (landmarks.length > 152) {
      const foreheadY = landmarks[10].y;
      const chinY = landmarks[152].y;
      const faceHeight = chinY - foreheadY;
      
      if (faceHeight < 0.15) {
        metrics.headPose = 'looking down';
      } else if (faceHeight > 0.25) {
        metrics.headPose = 'looking up';
      } else {
        metrics.headPose = 'forward';
      }
    }

    metrics.blinkCount = blinkCounter.current;
    return metrics;
  }, []);

  // Face detection loop
  const detectFace = useCallback(() => {
    if (!videoRef.current || !faceLandmarker || !isActive) {
      return;
    }

    const video = videoRef.current;

    if (video.readyState >= 2) {
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];
        const blendshapes = results.faceBlendshapes?.[0]?.categories || [];

        const metrics = analyzeAttention(landmarks, blendshapes);
        setCurrentMetrics(metrics);

        // Record to face tracking service
        recordFaceDetection({
          timestamp: Date.now(),
          landmarks,
          blendshapes,
          attentionMetrics: metrics
        });

        // Notify parent component if callback provided
        if (onAttentionChange) {
          onAttentionChange(metrics);
        }

        // Draw on canvas if preview is enabled
        if (showPreview && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawFaceIndicator(ctx, landmarks, canvas.width, canvas.height, metrics);
        }
      } else {
        // No face detected
        recordNoFaceDetected();
        setCurrentMetrics({
          gazeDirection: 'unknown',
          attentionScore: 0,
          engagementLevel: 'low',
          lookingAway: true,
          blinkCount: blinkCounter.current
        });
      }
    }

    animationFrameId.current = requestAnimationFrame(detectFace);
  }, [isActive, faceLandmarker, showPreview, onAttentionChange, analyzeAttention]);

  // Draw face indicator on canvas
  const drawFaceIndicator = (ctx, landmarks, width, height, metrics) => {
    // Draw attention indicator
    const color = metrics.attentionScore > 70 ? '#22c55e' : 
                  metrics.attentionScore > 40 ? '#f59e0b' : '#ef4444';
    
    // Draw face oval outline
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    const faceOvalIndices = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
      172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ];

    ctx.beginPath();
    faceOvalIndices.forEach((index, i) => {
      if (index < landmarks.length) {
        const point = landmarks[index];
        if (i === 0) {
          ctx.moveTo(point.x * width, point.y * height);
        } else {
          ctx.lineTo(point.x * width, point.y * height);
        }
      }
    });
    ctx.closePath();
    ctx.stroke();
  };

  // Position styles
  const getPositionStyle = () => {
    const positions = {
      'top-right': { top: '80px', right: '16px' },
      'top-left': { top: '80px', left: '16px' },
      'bottom-right': { bottom: '16px', right: '16px' },
      'bottom-left': { bottom: '16px', left: '16px' },
    };
    return positions[position] || positions['top-right'];
  };

  // Don't render if camera permission denied
  if (cameraPermission === 'denied' || error) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      ...getPositionStyle(),
      zIndex: 1000,
      transition: 'all 0.3s ease',
    }}>
      {/* Camera preview (hidden or minimized) */}
      <div style={{
        position: 'relative',
        width: minimized ? '60px' : '160px',
        height: minimized ? '60px' : '120px',
        borderRadius: minimized ? '50%' : '12px',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: currentMetrics ? 
          `3px solid ${currentMetrics.attentionScore > 70 ? '#22c55e' : currentMetrics.attentionScore > 40 ? '#f59e0b' : '#ef4444'}` :
          '3px solid #6366f1',
        transition: 'all 0.3s ease',
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)', // Mirror the video
            opacity: showPreview ? 1 : 0.7,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'scaleX(-1)',
          }}
        />
        
        {/* Status indicator */}
        <div style={{
          position: 'absolute',
          bottom: minimized ? '2px' : '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: isInitialized && cameraPermission === 'granted' ? '#22c55e' : '#f59e0b',
          width: minimized ? '8px' : '10px',
          height: minimized ? '8px' : '10px',
          borderRadius: '50%',
          animation: 'pulse 2s infinite',
        }} />
      </div>

      {/* Metrics display */}
      {showMetrics && currentMetrics && !minimized && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '11px',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '4px' 
          }}>
            <span style={{ color: '#64748b' }}>Attention</span>
            <span style={{ 
              fontWeight: 700, 
              color: currentMetrics.attentionScore > 70 ? '#22c55e' : 
                     currentMetrics.attentionScore > 40 ? '#f59e0b' : '#ef4444'
            }}>
              {currentMetrics.attentionScore}%
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{ color: '#64748b' }}>Focus</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>
              {currentMetrics.engagementLevel}
            </span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between' 
          }}>
            <span style={{ color: '#64748b' }}>Gaze</span>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>
              {currentMetrics.gazeDirection}
            </span>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default FaceTrackingOverlay;
