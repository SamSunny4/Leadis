'use client';

import React, { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { colors } from '../../styles/quizStyles';

/**
 * MediaPipe Hand Tracking Component
 * 
 * Used for fine motor coordination assessment:
 * - Hand-eye coordination
 * - Finger dexterity
 * - Gesture recognition
 * - Writing/drawing motion analysis
 */
const MediaPipeHandTracking = ({ 
  onHandDetected, 
  task = null,
  isActive = false,
  showVideo = true,
  detectGestures = true,
  detectFingers = false,
  detectPosition = false
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [handedness, setHandedness] = useState(null);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [fingerCount, setFingerCount] = useState(null);
  const [handPosition, setHandPosition] = useState(null);
  const [motorMetrics, setMotorMetrics] = useState({
    stability: 0,
    speed: 0,
    precision: 0,
    coordination: 0
  });
  const animationFrameId = useRef(null);
  const handHistory = useRef([]);

  // Use refs to keep track of latest props inside the animation loop
  const onHandDetectedRef = useRef(onHandDetected);
  const taskRef = useRef(task);
  const detectGesturesRef = useRef(detectGestures);
  const detectFingersRef = useRef(detectFingers);
  const detectPositionRef = useRef(detectPosition);

  useEffect(() => {
    onHandDetectedRef.current = onHandDetected;
    taskRef.current = task;
    detectGesturesRef.current = detectGestures;
    detectFingersRef.current = detectFingers;
    detectPositionRef.current = detectPosition;
  }, [onHandDetected, task, detectGestures, detectFingers, detectPosition]);

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

        const face = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setHandLandmarker(landmarker);
        setFaceLandmarker(face);
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
          video: { width: 640 , height: 480, facingMode: 'user' }
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

    let faceBox = null;
    if (detectPositionRef.current && faceLandmarker) {
      const faceResults = faceLandmarker.detectForVideo(video, startTimeMs);
      const faceLandmarks = faceResults?.faceLandmarks?.[0];
      if (faceLandmarks && faceLandmarks.length > 0) {
        let minX = 1, minY = 1, maxX = 0, maxY = 0;
        for (const p of faceLandmarks) {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        }
        faceBox = { minX, minY, maxX, maxY };
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.landmarks && results.landmarks.length > 0) {
      results.landmarks.forEach((landmarks, index) => {
        const handTypeRaw = results.handedness[index]?.[0]?.categoryName || 'Unknown';
        const handType = handTypeRaw.toLowerCase();
        const confidence = results.handedness[index]?.[0]?.score || 0;
        setHandedness(handType);

        let fingerCountVal = null;
        if (detectFingersRef.current) {
          fingerCountVal = countFingers(landmarks, handType);
          setFingerCount(fingerCountVal);
        }

        let position = null;
        if (detectPositionRef.current) {
          position = detectHandPosition(landmarks, faceBox);
          setHandPosition(position);
        }

        let gesture = null;
        if (detectGesturesRef.current) {
          gesture = recognizeGesture(landmarks);
          setCurrentGesture(gesture);
        }

        const metrics = analyzeMotorSkills(landmarks);
        setMotorMetrics(metrics);

        if (onHandDetectedRef.current) {
          onHandDetectedRef.current({
            timestamp: Date.now(),
            landmarks,
            handedness: handType,
            gesture,
            fingerCount: fingerCountVal,
            position,
            motorMetrics: metrics,
            confidence,
            task: taskRef.current
          });
        }

        drawHand(ctx, landmarks, canvas.width, canvas.height);
      });

      handHistory.current.push({
        timestamp: Date.now(),
        landmarks: results.landmarks[0]
      });

      handHistory.current = handHistory.current.filter(
        h => Date.now() - h.timestamp < 2000
      );
    }

    animationFrameId.current = requestAnimationFrame(detectHands);
  };

  const recognizeGesture = (landmarks) => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbExtended = thumbTip.y < landmarks[3].y;
    const indexExtended = indexTip.y < landmarks[6].y;
    const middleExtended = middleTip.y < landmarks[10].y;
    const ringExtended = ringTip.y < landmarks[14].y;
    const pinkyExtended = pinkyTip.y < landmarks[18].y;

    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'pointing';
    } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return 'peace_sign';
    } else if (indexExtended && middleExtended && ringExtended && pinkyExtended && thumbExtended) {
      return 'open_palm';
    } else if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'fist';
    } else if (thumbExtended && indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
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

  const countFingers = (landmarks, handType) => {
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexTip = landmarks[8];
    const indexPip = landmarks[6];
    const middleTip = landmarks[12];
    const middlePip = landmarks[10];
    const ringTip = landmarks[16];
    const ringPip = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPip = landmarks[18];

    const indexExtended = indexTip.y < indexPip.y;
    const middleExtended = middleTip.y < middlePip.y;
    const ringExtended = ringTip.y < ringPip.y;
    const pinkyExtended = pinkyTip.y < pinkyPip.y;

    let thumbExtended = false;
    if (handType === 'right') {
      thumbExtended = thumbTip.x > thumbIp.x;
    } else if (handType === 'left') {
      thumbExtended = thumbTip.x < thumbIp.x;
    } else {
      thumbExtended = Math.abs(thumbTip.x - landmarks[0].x) > Math.abs(thumbIp.x - landmarks[0].x);
    }

    let count = 0;
    if (thumbExtended) count++;
    if (indexExtended) count++;
    if (middleExtended) count++;
    if (ringExtended) count++;
    if (pinkyExtended) count++;

    return count;
  };

  const detectHandPosition = (landmarks, faceBox) => {
    const wrist = landmarks[0];

    if (faceBox) {
      const margin = 0.03;
      const withinFaceX = wrist.x >= (faceBox.minX - margin) && wrist.x <= (faceBox.maxX + margin);
      const withinFaceY = wrist.y >= (faceBox.minY - margin) && wrist.y <= (faceBox.maxY + margin);

      if (wrist.y < (faceBox.minY - margin)) {
        return 'above-head';
      }
      if (withinFaceX && withinFaceY) {
        return 'in-front';
      }

      return 'below';
    }

    if (wrist.y < 0.28) {
      return 'above-head';
    }
    if (wrist.y >= 0.28 && wrist.y < 0.7) {
      return 'in-front';
    }
    return 'below';
  };

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

    const recentMovement = handHistory.current.slice(-10);
    let totalMovement = 0;
    
    for (let i = 1; i < recentMovement.length; i++) {
      const prev = recentMovement[i - 1].landmarks[0];
      const curr = recentMovement[i].landmarks[0];
      const movement = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + 
        Math.pow(curr.y - prev.y, 2)
      );
      totalMovement += movement;
    }

    const avgMovement = totalMovement / (recentMovement.length - 1);
    metrics.stability = Math.max(0, Math.min(100, 100 - (avgMovement * 1000)));

    if (handHistory.current.length > 1) {
      const timeDiff = (Date.now() - handHistory.current[0].timestamp) / 1000;
      metrics.speed = Math.min(100, (totalMovement / timeDiff) * 10);
    }

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
    metrics.coordination = (metrics.stability + (100 - Math.abs(metrics.speed - 50))) / 2;

    return {
      stability: Math.round(metrics.stability),
      speed: Math.round(metrics.speed),
      precision: Math.round(metrics.precision),
      coordination: Math.round(metrics.coordination)
    };
  };

  const drawHand = (ctx, landmarks, width, height) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20],
      [5, 9], [9, 13], [13, 17]
    ];

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
      ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
      ctx.stroke();
    });

    landmarks.forEach((landmark, index) => {
      ctx.fillStyle = index === 0 ? colors.primaryDark : colors.primary;
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
        {detectFingers && fingerCount !== null && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Fingers:</span>
            <span style={styles.infoValue}>{fingerCount}</span>
          </div>
        )}
        {detectPosition && handPosition && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Position:</span>
            <span style={styles.infoValue}>{handPosition.replace('-', ' ')}</span>
          </div>
        )}
        {currentGesture && !detectFingers && !detectPosition && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Gesture:</span>
            <span style={styles.infoValue}>{currentGesture.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      <div style={styles.metricsPanel}>
        <h4 style={styles.metricsTitle}>Motor Skills Analysis</h4>
        {['stability', 'speed', 'precision', 'coordination'].map((metric) => (
          <div key={metric} style={styles.metricRow}>
            <span style={styles.metricLabel}>{metric.charAt(0).toUpperCase() + metric.slice(1)}:</span>
            <div style={styles.progressBar}>
              <div style={{...styles.progressFill, width: `${motorMetrics[metric]}%`}}></div>
            </div>
            <span style={styles.metricValue}>{motorMetrics[metric]}%</span>
          </div>
        ))}
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
    backgroundColor: colors.lightBg,
    border: `2px solid ${colors.primaryLight}`,
    display: 'flex',
    flexDirection: 'column',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '8px',
    margin: '10px',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '12px',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    height: '480px',
    margin: '0 auto',
    backgroundColor: colors.lightBg,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    objectPosition: 'center center',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  infoPanel: {
    padding: '6px 10px',
    backgroundColor: colors.white,
    borderBottom: `1px solid ${colors.primaryLight}`,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '2px',
  },
  infoLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: colors.gray,
  },
  infoValue: {
    fontSize: '11px',
    fontWeight: 700,
    color: colors.dark,
    textTransform: 'capitalize',
  },
  metricsPanel: {
    padding: '8px 10px',
    backgroundColor: colors.white,
  },
  metricsTitle: {
    margin: '0 0 6px 0',
    fontSize: '12px',
    fontWeight: 700,
    color: colors.dark,
  },
  metricRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
    gap: '8px',
  },
  metricLabel: {
    fontSize: '10px',
    fontWeight: 600,
    color: colors.gray,
    minWidth: '70px',
  },
  progressBar: {
    flex: 1,
    height: '6px',
    backgroundColor: colors.primaryLight,
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    transition: 'width 0.3s ease',
  },
  metricValue: {
    fontSize: '10px',
    fontWeight: 700,
    color: colors.dark,
    minWidth: '32px',
    textAlign: 'right',
  },
};

export default MediaPipeHandTracking;
