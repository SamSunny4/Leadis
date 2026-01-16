import React, { useState, useEffect } from 'react';
import MediaPipePoseEstimation from './MediaPipePoseEstimation';
import MediaPipeFaceMesh from './MediaPipeFaceMesh';
import MediaPipeHandTracking from './MediaPipeHandTracking';

/**
 * Interactive Assessment Module
 * 
 * Combines all MediaPipe capabilities for comprehensive developmental screening:
 * - Instruction-following tasks (pose estimation)
 * - Attention and engagement monitoring (face mesh)
 * - Fine motor coordination (hand tracking)
 * 
 * Based on the abstract's multimodal assessment approach
 */
const InteractiveAssessment = ({ 
  onAssessmentComplete,
  ageGroup = '5-7',
  assessmentType = 'full'
}) => {
  const [currentTask, setCurrentTask] = useState(null);
  const [taskIndex, setTaskIndex] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    motorCoordination: [],
    attentionMetrics: [],
    instructionFollowing: [],
    startTime: Date.now(),
    ageGroup
  });
  const [isAssessmentActive, setIsAssessmentActive] = useState(false);

  // Age-appropriate assessment tasks based on the abstract
  const assessmentTasks = {
    '3-5': [
      {
        id: 1,
        type: 'pose',
        instruction: { type: 'raise_hands', text: 'Raise both hands up high!' },
        duration: 5000,
        domain: 'motor_coordination'
      },
      {
        id: 2,
        type: 'hand',
        task: { description: 'Show me your open hand' },
        duration: 5000,
        domain: 'fine_motor'
      },
      {
        id: 3,
        type: 'attention',
        duration: 10000,
        domain: 'attention_regulation'
      },
      {
        id: 4,
        type: 'pose',
        instruction: { type: 'touch_nose', text: 'Touch your nose with your finger' },
        duration: 5000,
        domain: 'motor_planning'
      }
    ],
    '5-7': [
      {
        id: 1,
        type: 'pose',
        instruction: { type: 'raise_hands', text: 'Raise both hands above your head' },
        duration: 5000,
        domain: 'motor_coordination'
      },
      {
        id: 2,
        type: 'hand',
        task: { description: 'Make a pointing gesture' },
        duration: 5000,
        domain: 'fine_motor'
      },
      {
        id: 3,
        type: 'attention',
        duration: 15000,
        domain: 'attention_regulation'
      },
      {
        id: 4,
        type: 'pose',
        instruction: { type: 'stand_on_one_leg', text: 'Stand on one leg' },
        duration: 8000,
        domain: 'balance_coordination'
      },
      {
        id: 5,
        type: 'hand',
        task: { description: 'Make a peace sign with your fingers' },
        duration: 5000,
        domain: 'fine_motor'
      },
      {
        id: 6,
        type: 'pose',
        instruction: { type: 'arms_crossed', text: 'Cross your arms in front of you' },
        duration: 5000,
        domain: 'motor_planning'
      }
    ],
    '7-12': [
      {
        id: 1,
        type: 'pose',
        instruction: { type: 'jumping', text: 'Jump up and down 3 times' },
        duration: 10000,
        domain: 'gross_motor'
      },
      {
        id: 2,
        type: 'hand',
        task: { description: 'Make a pinching gesture with your thumb and index finger' },
        duration: 5000,
        domain: 'fine_motor'
      },
      {
        id: 3,
        type: 'attention',
        duration: 20000,
        domain: 'sustained_attention'
      },
      {
        id: 4,
        type: 'pose',
        instruction: { type: 'stand_on_one_leg', text: 'Stand on your right leg for 5 seconds' },
        duration: 8000,
        domain: 'balance_coordination'
      },
      {
        id: 5,
        type: 'hand',
        task: { description: 'Show me different hand gestures: fist, open palm, pointing' },
        duration: 10000,
        domain: 'fine_motor_sequencing'
      },
      {
        id: 6,
        type: 'pose',
        instruction: { type: 'touch_nose', text: 'Touch your nose, then touch your ears' },
        duration: 8000,
        domain: 'sequential_motor_planning'
      }
    ]
  };

  const tasks = assessmentTasks[ageGroup] || assessmentTasks['5-7'];

  useEffect(() => {
    if (isAssessmentActive && taskIndex < tasks.length) {
      setCurrentTask(tasks[taskIndex]);
      
      const timer = setTimeout(() => {
        moveToNextTask();
      }, tasks[taskIndex].duration);

      return () => clearTimeout(timer);
    } else if (taskIndex >= tasks.length && isAssessmentActive) {
      completeAssessment();
    }
  }, [taskIndex, isAssessmentActive]);

  const startAssessment = () => {
    setIsAssessmentActive(true);
    setTaskIndex(0);
    setAssessmentData({
      motorCoordination: [],
      attentionMetrics: [],
      instructionFollowing: [],
      startTime: Date.now(),
      ageGroup
    });
  };

  const moveToNextTask = () => {
    setTaskIndex(prev => prev + 1);
  };

  const completeAssessment = () => {
    setIsAssessmentActive(false);
    
    const finalData = {
      ...assessmentData,
      endTime: Date.now(),
      duration: Date.now() - assessmentData.startTime,
      completionRate: (taskIndex / tasks.length) * 100
    };

    if (onAssessmentComplete) {
      onAssessmentComplete(finalData);
    }
  };

  const handlePoseDetected = (poseAnalysis) => {
    setAssessmentData(prev => ({
      ...prev,
      instructionFollowing: [...prev.instructionFollowing, {
        ...poseAnalysis,
        taskId: currentTask.id,
        domain: currentTask.domain
      }]
    }));
  };

  const handleFaceDetected = (faceData) => {
    setAssessmentData(prev => ({
      ...prev,
      attentionMetrics: [...prev.attentionMetrics, {
        ...faceData.attentionMetrics,
        taskId: currentTask?.id,
        timestamp: faceData.timestamp
      }]
    }));
  };

  const handleHandDetected = (handData) => {
    setAssessmentData(prev => ({
      ...prev,
      motorCoordination: [...prev.motorCoordination, {
        ...handData.motorMetrics,
        gesture: handData.gesture,
        handedness: handData.handedness,
        taskId: currentTask.id,
        domain: currentTask.domain,
        timestamp: handData.timestamp
      }]
    }));
  };

  if (!isAssessmentActive) {
    return (
      <div style={styles.startScreen}>
        <h2 style={styles.title}>Interactive Developmental Assessment</h2>
        <p style={styles.description}>
          This assessment will evaluate motor coordination, attention patterns, 
          and instruction-following abilities through fun, interactive tasks.
        </p>
        <div style={styles.infoBox}>
          <p><strong>Age Group:</strong> {ageGroup} years</p>
          <p><strong>Duration:</strong> ~{Math.round(tasks.reduce((sum, t) => sum + t.duration, 0) / 1000)} seconds</p>
          <p><strong>Tasks:</strong> {tasks.length} activities</p>
        </div>
        <button onClick={startAssessment} style={styles.startButton}>
          Start Assessment
        </button>
        <p style={styles.note}>
          Please ensure good lighting and that the child is visible to the camera.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.taskCounter}>
          Task {taskIndex + 1} of {tasks.length}
        </h3>
        <div style={styles.progressBarContainer}>
          <div 
            style={{
              ...styles.progressBar,
              width: `${((taskIndex + 1) / tasks.length) * 100}%`
            }}
          />
        </div>
      </div>

      <div style={styles.assessmentArea}>
        {currentTask?.type === 'pose' && (
          <MediaPipePoseEstimation
            instruction={currentTask.instruction}
            onPoseDetected={handlePoseDetected}
            isActive={true}
            showVideo={true}
          />
        )}

        {currentTask?.type === 'attention' && (
          <MediaPipeFaceMesh
            onFaceDetected={handleFaceDetected}
            isActive={true}
            trackAttention={true}
            showVideo={true}
          />
        )}

        {currentTask?.type === 'hand' && (
          <MediaPipeHandTracking
            task={currentTask.task}
            onHandDetected={handleHandDetected}
            isActive={true}
            showVideo={true}
            detectGestures={true}
          />
        )}
      </div>

      <div style={styles.controls}>
        <button onClick={moveToNextTask} style={styles.skipButton}>
          Skip Task
        </button>
        <button onClick={completeAssessment} style={styles.endButton}>
          End Assessment
        </button>
      </div>
    </div>
  );
};

const styles = {
  startScreen: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px'
  },
  description: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '24px'
  },
  infoBox: {
    backgroundColor: '#f8fafc',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'left'
  },
  startButton: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '16px'
  },
  note: {
    fontSize: '14px',
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    backgroundColor: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  header: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0'
  },
  taskCounter: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px'
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    transition: 'width 0.5s ease'
  },
  assessmentArea: {
    padding: '20px'
  },
  controls: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderTop: '2px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px'
  },
  skipButton: {
    backgroundColor: '#94a3b8',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  endButton: {
    backgroundColor: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default InteractiveAssessment;
