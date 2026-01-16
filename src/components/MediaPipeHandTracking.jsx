import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * MediaPipe Hand Tracking Component
 * 
 * Used for fine motor coordination assessment:
 * - Hand-eye coordination
 * - Finger dexterity
 * - Gesture recognition
 * - Writing/drawing motion analysis
 * 
 * Supports motor coordination evaluation as mentioned in the abstract
 */
const MediaPipeHandTracking = ({ 
  onHandDetected, 
  task = null,
  isActive = false,
  showVideo = true,
  detectGestures = true
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [handedness, setHandedness] = useState(null);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [motorMetrics, setMotorMetrics] = useState({
    stability: 0,
    speed: 0,
    precision: 0,
    coordination: 0
  });
  const animationFrameId = useRef(null);
  const handHistory = useRef([]);

  // Initialize MediaPipe Hand Landmarker
  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setHandLandmarker(landmarker);
        setIsInitialized(true);
      } catch (err) {
        console.error("Error initializing hand landmarker:", err);
        setError("Failed to initialize hand tracking. Please check your camera permissions.");
      }
    };

    initializeHandLandmarker();

    return () => {
      if (handLandmarker) {
        handLandmarker.close();
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
            if (isActive && handLandmarker) {
              detectHands();
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

  // Hand detection loop
  const detectHands = () => {
    if (!videoRef.current || !canvasRef.current || !handLandmarker || !isActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const startTimeMs = performance.now();
    const results = handLandmarker.detectForVideo(video, startTimeMs);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.landmarks && results.landmarks.length > 0) {
      results.landmarks.forEach((landmarks, index) => {
        const handType = results.handedness[index]?.[0]?.categoryName || 'Unknown';
        setHandedness(handType);

        // Analyze motor skills and gestures
        if (detectGestures) {
          const gesture = recognizeGesture(landmarks);
          setCurrentGesture(gesture);
        }

        const metrics = analyzeMotorSkills(landmarks);
        setMotorMetrics(metrics);

        if (onHandDetected) {
          onHandDetected({
            timestamp: Date.now(),
            landmarks,
            handedness: handType,
            gesture: currentGesture,
            motorMetrics: metrics,
            task
          });
        }

        drawHand(ctx, landmarks, canvas.width, canvas.height);
      });

      // Store hand position history for motion analysis
      handHistory.current.push({
        timestamp: Date.now(),
        landmarks: results.landmarks[0]
      });

      // Keep only last 2 seconds of data
      handHistory.current = handHistory.current.filter(
        h => Date.now() - h.timestamp < 2000
      );
    }

    animationFrameId.current = requestAnimationFrame(detectHands);
  };

  // Recognize hand gestures
  const recognizeGesture = (landmarks) => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];

    // Calculate finger states (extended or curled)
    const thumbExtended = thumbTip.y < landmarks[3].y;
    const indexExtended = indexTip.y < landmarks[6].y;
    const middleExtended = middleTip.y < landmarks[10].y;
    const ringExtended = ringTip.y < landmarks[14].y;
    const pinkyExtended = pinkyTip.y < landmarks[18].y;

    // Recognize common gestures
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'pointing';
    } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return 'peace_sign';
    } else if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      return 'open_palm';
    } else if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'fist';
    } else if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      // Check if thumb and index are close (pinch gesture)
      const distance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) + 
        Math.pow(thumbTip.y - indexTip.y, 2)
      );
      if (distance < 0.05) {
        return 'pinch';
      }
    } else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && pinkyExtended) {
      return 'hang_loose';
    }

    return 'unknown';
  };

  // Analyze motor skills from hand movements
  const analyzeMotorSkills = (landmarks) => {
    const metrics = {
      stability: 100,
      speed: 0,
      precision: 0,
      coordination: 100
    };

    if (handHistory.current.length < 2) {
      return metrics;
    }

    // Calculate hand stability (less movement = more stable)
    const recentMovement = handHistory.current.slice(-10);
    let totalMovement = 0;
    
    for (let i = 1; i < recentMovement.length; i++) {
      const prev = recentMovement[i - 1].landmarks[0]; // Wrist
      const curr = recentMovement[i].landmarks[0];
      const movement = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + 
        Math.pow(curr.y - prev.y, 2)
      );
      totalMovement += movement;
    }

    const avgMovement = totalMovement / (recentMovement.length - 1);
    metrics.stability = Math.max(0, Math.min(100, 100 - (avgMovement * 1000)));

    // Calculate movement speed
    if (handHistory.current.length > 1) {
      const timeDiff = (Date.now() - handHistory.current[0].timestamp) / 1000;
      metrics.speed = Math.min(100, (totalMovement / timeDiff) * 10);
    }

    // Calculate precision (finger positioning accuracy)
    const fingerTips = [4, 8, 12, 16, 20].map(i => landmarks[i]);
    let fingerSpread = 0;
    
    for (let i = 0; i < fingerTips.length - 1; i++) {
      const distance = Math.sqrt(
        Math.pow(fingerTips[i].x - fingerTips[i + 1].x, 2) +
        Math.pow(fingerTips[i].y - fingerTips[i + 1].y, 2)
      );
      fingerSpread += distance;
    }
    
    metrics.precision = Math.min(100, fingerSpread * 200);

    // Coordination is based on smoothness of movement
    metrics.coordination = (metrics.stability + (100 - Math.abs(metrics.speed - 50))) / 2;

    return {
      stability: Math.round(metrics.stability),
      speed: Math.round(metrics.speed),
      precision: Math.round(metrics.precision),
      coordination: Math.round(metrics.coordination)
    };
  };

  // Draw hand landmarks on canvas
  const drawHand = (ctx, landmarks, width, height) => {
    // Define hand connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17] // Palm
    ];

    // Draw connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
      ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
      ctx.stroke();
    });

    // Draw landmarks
    landmarks.forEach((landmark, index) => {
      ctx.fillStyle = index === 0 ? '#0000ff' : '#ff0000'; // Wrist blue, others red
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {task && (
        <div style={styles.taskBox}>
          <h3 style={styles.taskTitle}>Motor Task:</h3>
          <p style={styles.taskText}>{task.description}</p>
        </div>
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

      <div style={styles.infoPanel}>
        {handedness && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Hand:</span>
            <span style={styles.infoValue}>{handedness}</span>
          </div>
        )}
        {currentGesture && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Gesture:</span>
            <span style={styles.infoValue}>{currentGesture.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <div style={styles.metricsPanel}>
        <h4 style={styles.metricsTitle}>Motor Skills Analysis</h4>
        <div style={styles.metricRow}>
          <span style={styles.metricLabel}>Stability:</span>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${motorMetrics.stability}%`}}></div>
          </div>
          <span style={styles.metricValue}>{motorMetrics.stability}%</span>
        </div>
        <div style={styles.metricRow}>
          <span style={styles.metricLabel}>Speed:</span>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${motorMetrics.speed}%`}}></div>
          </div>
          <span style={styles.metricValue}>{motorMetrics.speed}%</span>
        </div>
        <div style={styles.metricRow}>
          <span style={styles.metricLabel}>Precision:</span>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${motorMetrics.precision}%`}}></div>
          </div>
          <span style={styles.metricValue}>{motorMetrics.precision}%</span>
        </div>
        <div style={styles.metricRow}>
          <span style={styles.metricLabel}>Coordination:</span>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: `${motorMetrics.coordination}%`}}></div>
          </div>
          <span style={styles.metricValue}>{motorMetrics.coordination}%</span>
        </div>
      </div>
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
  taskBox: {
    padding: '20px',
    backgroundColor: '#fff',
    borderBottom: '2px solid #e2e8f0',
    textAlign: 'center'
  },
  taskTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#6366f1'
  },
  taskText: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b'
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
  infoPanel: {
    padding: '12px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    textTransform: 'capitalize'
  },
  metricsPanel: {
    padding: '16px',
    backgroundColor: '#fff'
  },
  metricsTitle: {
    margin: '0 0 12px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b'
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
    gap: '12px'
  },
  metricLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    minWidth: '90px'
  },
  progressBar: {
    flex: 1,
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    transition: 'width 0.3s ease'
  },
  metricValue: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1e293b',
    minWidth: '40px',
    textAlign: 'right'
  }
};

export default MediaPipeHandTracking;
