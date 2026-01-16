import React, { useRef, useEffect, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

/**
 * MediaPipe Pose Estimation Component
 * 
 * Used for instruction-following tasks to evaluate:
 * - Motor planning and coordination
 * - Comprehension of verbal/text instructions
 * - Response time and accuracy
 * 
 * Based on the abstract's requirement for camera-based pose estimation
 */
const MediaPipePoseEstimation = ({ 
  onPoseDetected, 
  instruction = null,
  isActive = false,
  showVideo = true 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [currentPose, setCurrentPose] = useState(null);
  const animationFrameId = useRef(null);

  // Initialize MediaPipe Pose Landmarker
  useEffect(() => {
    const initializePoseLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        setPoseLandmarker(landmarker);
        setIsInitialized(true);
      } catch (err) {
        console.error("Error initializing pose landmarker:", err);
        setError("Failed to initialize pose detection. Please check your camera permissions.");
      }
    };

    initializePoseLandmarker();

    return () => {
      if (poseLandmarker) {
        poseLandmarker.close();
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
            if (isActive && poseLandmarker) {
              detectPose();
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

  // Pose detection loop
  const detectPose = () => {
    if (!videoRef.current || !canvasRef.current || !poseLandmarker || !isActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const startTimeMs = performance.now();
    const results = poseLandmarker.detectForVideo(video, startTimeMs);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pose landmarks if detected
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      setCurrentPose(landmarks);

      // Analyze pose for instruction matching
      if (onPoseDetected && instruction) {
        const poseAnalysis = analyzePoseForInstruction(landmarks, instruction);
        onPoseDetected(poseAnalysis);
      }

      // Draw landmarks on canvas
      drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
    }

    animationFrameId.current = requestAnimationFrame(detectPose);
  };

  // Analyze pose against instruction
  const analyzePoseForInstruction = (landmarks, instruction) => {
    const analysis = {
      timestamp: Date.now(),
      instruction: instruction.text,
      matched: false,
      confidence: 0,
      details: {}
    };

    // Example instruction types from the abstract
    switch (instruction.type) {
      case 'raise_hands':
        analysis.matched = checkHandsRaised(landmarks);
        analysis.confidence = analysis.matched ? 0.85 : 0.2;
        break;
      
      case 'touch_nose':
        analysis.matched = checkTouchingNose(landmarks);
        analysis.confidence = analysis.matched ? 0.9 : 0.15;
        break;
      
      case 'stand_on_one_leg':
        analysis.matched = checkStandingOnOneLeg(landmarks);
        analysis.confidence = analysis.matched ? 0.8 : 0.25;
        break;
      
      case 'arms_crossed':
        analysis.matched = checkArmsCrossed(landmarks);
        analysis.confidence = analysis.matched ? 0.85 : 0.2;
        break;

      case 'jumping':
        analysis.matched = checkJumping(landmarks);
        analysis.confidence = analysis.matched ? 0.75 : 0.3;
        break;

      default:
        analysis.matched = false;
        analysis.confidence = 0;
    }

    return analysis;
  };

  // Helper functions to check specific poses
  const checkHandsRaised = (landmarks) => {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    return leftWrist.y < leftShoulder.y && rightWrist.y < rightShoulder.y;
  };

  const checkTouchingNose = (landmarks) => {
    const nose = landmarks[0];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    
    const leftDistance = Math.sqrt(
      Math.pow(nose.x - leftWrist.x, 2) + Math.pow(nose.y - leftWrist.y, 2)
    );
    const rightDistance = Math.sqrt(
      Math.pow(nose.x - rightWrist.x, 2) + Math.pow(nose.y - rightWrist.y, 2)
    );
    
    return Math.min(leftDistance, rightDistance) < 0.1;
  };

  const checkStandingOnOneLeg = (landmarks) => {
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    
    const leftLegRaised = leftKnee.y < rightKnee.y && leftAnkle.y < rightAnkle.y;
    const rightLegRaised = rightKnee.y < leftKnee.y && rightAnkle.y < leftAnkle.y;
    
    return leftLegRaised || rightLegRaised;
  };

  const checkArmsCrossed = (landmarks) => {
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    
    return leftWrist.x > rightElbow.x && rightWrist.x < leftElbow.x;
  };

  const checkJumping = (landmarks) => {
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    
    return avgAnkleY < avgHipY - 0.15;
  };

  // Draw landmarks on canvas
  const drawLandmarks = (ctx, landmarks, width, height) => {
    // Draw connections
    const connections = [
      [11, 12], [11, 13], [13, 15], [12, 14], [14, 16], // Arms
      [11, 23], [12, 24], [23, 24], // Torso
      [23, 25], [25, 27], [24, 26], [26, 28], // Legs
      [0, 1], [1, 2], [2, 3], [3, 7], // Face
      [0, 4], [4, 5], [5, 6], [6, 8]
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      if (landmarks[start] && landmarks[end]) {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * width, landmarks[start].y * height);
        ctx.lineTo(landmarks[end].x * width, landmarks[end].y * height);
        ctx.stroke();
      }
    });

    // Draw landmarks
    ctx.fillStyle = '#ff0000';
    landmarks.forEach(landmark => {
      ctx.beginPath();
      ctx.arc(landmark.x * width, landmark.y * height, 5, 0, 2 * Math.PI);
      ctx.fill();
    });
  };

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.error}>{error}</div>
      )}
      
      {instruction && (
        <div style={styles.instructionBox}>
          <h3 style={styles.instructionTitle}>Follow this instruction:</h3>
          <p style={styles.instructionText}>{instruction.text}</p>
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

      {currentPose && (
        <div style={styles.status}>
          <span style={styles.statusDot}></span>
          Pose detected
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
  instructionBox: {
    padding: '20px',
    backgroundColor: '#fff',
    borderBottom: '2px solid #e2e8f0',
    textAlign: 'center'
  },
  instructionTitle: {
    margin: '0 0 8px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#6366f1'
  },
  instructionText: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
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
  status: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '8px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00ff00',
    animation: 'pulse 2s infinite'
  }
};

export default MediaPipePoseEstimation;
