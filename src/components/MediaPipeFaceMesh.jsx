import React, { useRef, useEffect, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * MediaPipe Face Mesh Component
 * 
 * Used for attention and engagement tracking:
 * - Eye gaze direction (attention focus)
 * - Blink rate (attention consistency)
 * - Head pose (engagement level)
 * - Facial expressions (emotional state)
 * 
 * Supports behavioral signal monitoring as mentioned in the abstract
 */
const MediaPipeFaceMesh = ({ 
  onFaceDetected, 
  isActive = false,
  trackAttention = true,
  showVideo = true 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [attentionMetrics, setAttentionMetrics] = useState({
    gazeDirection: 'center',
    blinkCount: 0,
    attentionScore: 100,
    engagementLevel: 'high'
  });
  const animationFrameId = useRef(null);
  const lastBlinkTime = useRef(0);
  const blinkCounter = useRef(0);
  const gazeHistory = useRef([]);

  // Initialize MediaPipe Face Landmarker
  useEffect(() => {
    const initializeFaceLandmarker = async () => {
      try {
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
      } catch (err) {
        console.error("Error initializing face landmarker:", err);
        setError("Failed to initialize face tracking. Please check your camera permissions.");
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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
            if (isActive && faceLandmarker) {
              detectFace();
            }
          });
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Unable to access camera. Please grant camera permissions.");
      }
    };

    if (isActive && isInitialized) {
      initializeWebcam();
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive, isInitialized]);

  // Face detection loop
  const detectFace = () => {
    if (!videoRef.current || !canvasRef.current || !faceLandmarker || !isActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const startTimeMs = performance.now();
    const results = faceLandmarker.detectForVideo(video, startTimeMs);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      const landmarks = results.faceLandmarks[0];
      const blendshapes = results.faceBlendshapes?.[0]?.categories || [];

      if (trackAttention) {
        const metrics = analyzeAttention(landmarks, blendshapes);
        setAttentionMetrics(metrics);

        if (onFaceDetected) {
          onFaceDetected({
            timestamp: Date.now(),
            landmarks,
            blendshapes,
            attentionMetrics: metrics
          });
        }
      }

      drawFaceMesh(ctx, landmarks, canvas.width, canvas.height);
    }

    animationFrameId.current = requestAnimationFrame(detectFace);
  };

  // Analyze attention and engagement
  const analyzeAttention = (landmarks, blendshapes) => {
    const metrics = {
      gazeDirection: 'center',
      blinkCount: blinkCounter.current,
      attentionScore: 100,
      engagementLevel: 'high',
      headPose: 'forward',
      lookingAway: false
    };

    // Detect blinks using eye aspect ratio or blendshapes
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
    const leftEye = landmarks[468]; // Left eye center
    const rightEye = landmarks[473]; // Right eye center
    const noseTip = landmarks[1];
    
    // Calculate gaze direction
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

    // Track gaze history for attention consistency
    gazeHistory.current.push({
      direction: metrics.gazeDirection,
      timestamp: Date.now()
    });

    // Keep only last 30 seconds of gaze data
    gazeHistory.current = gazeHistory.current.filter(
      g => Date.now() - g.timestamp < 30000
    );

    // Calculate attention score based on gaze consistency
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

    // Detect head pose using landmarks
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

    return metrics;
  };

  // Draw face mesh on canvas
  const drawFaceMesh = (ctx, landmarks, width, height) => {
    // Draw face oval
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 1;
    
    const faceOvalIndices = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
      172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ];

    ctx.beginPath();
    faceOvalIndices.forEach((index, i) => {
      const point = landmarks[index];
      if (i === 0) {
        ctx.moveTo(point.x * width, point.y * height);
      } else {
        ctx.lineTo(point.x * width, point.y * height);
      }
    });
    ctx.closePath();
    ctx.stroke();

    // Draw eyes
    ctx.fillStyle = '#ff0000';
    const eyeIndices = [468, 473]; // Eye centers
    eyeIndices.forEach(index => {
      const point = landmarks[index];
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw nose tip
    const noseTip = landmarks[1];
    ctx.fillStyle = '#0000ff';
    ctx.beginPath();
    ctx.arc(noseTip.x * width, noseTip.y * height, 4, 0, 2 * Math.PI);
    ctx.fill();
  };

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.error}>{error}</div>
      )}

      <div style={styles.videoContainer}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            ...styles.video,
            display: showVideo ? 'block' : 'none'
          }}
        />
        <canvas
          ref={canvasRef}
          style={styles.canvas}
        />
      </div>

      {trackAttention && (
        <div style={styles.metricsPanel}>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Attention Score:</span>
            <span style={{
              ...styles.metricValue,
              color: attentionMetrics.attentionScore > 70 ? '#10b981' : 
                     attentionMetrics.attentionScore > 40 ? '#f59e0b' : '#ef4444'
            }}>
              {attentionMetrics.attentionScore}%
            </span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Engagement:</span>
            <span style={styles.metricValue}>{attentionMetrics.engagementLevel}</span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Gaze:</span>
            <span style={styles.metricValue}>{attentionMetrics.gazeDirection}</span>
          </div>
          <div style={styles.metricRow}>
            <span style={styles.metricLabel}>Blinks:</span>
            <span style={styles.metricValue}>{attentionMetrics.blinkCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
    borderRadius: '12px',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa'
  },
  error: {
    padding: '16px',
    backgroundColor: '#fee',
    color: '#c00',
    borderRadius: '8px',
    margin: '16px',
    textAlign: 'center'
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    paddingBottom: '75%',
    backgroundColor: '#000'
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  metricsPanel: {
    padding: '16px',
    backgroundColor: '#fff',
    borderTop: '2px solid #e2e8f0'
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  metricLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b'
  }
};

export default MediaPipeFaceMesh;
