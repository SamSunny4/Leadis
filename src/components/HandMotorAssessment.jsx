import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Activity, Hand, CheckCircle, ArrowLeft, Brain, Play, Trophy, Star, AlertCircle, Clock } from 'lucide-react';
import MediaPipeHandTracking from './MediaPipeHandTracking';

const TASKS = [
  { id: 1, title: 'Show 3 Fingers', instruction: 'Show 3 fingers', fingerCount: 3, category: 'finger-counting', color: '#6366f1', timeLimit: 10 },
  { id: 2, title: 'Show 5 Fingers', instruction: 'Show 5 fingers', fingerCount: 5, category: 'finger-counting', color: '#8b5cf6', timeLimit: 10 },
  { id: 3, title: 'Left Hand', instruction: 'Raise your LEFT hand', handTarget: 'left', category: 'hand-laterality', color: '#ec4899', timeLimit: 8 },
  { id: 4, title: 'Right Hand', instruction: 'Raise your RIGHT hand', handTarget: 'right', category: 'hand-laterality', color: '#10b981', timeLimit: 8 },
  { id: 5, title: 'Hand Above Head', instruction: 'Raise your hand ABOVE your head', position: 'above-head', category: 'hand-position', color: '#fb923c', timeLimit: 8 }
];

const HandMotorAssessment = ({ onComplete }) => {
  // 'intro' state skipped if integrated directly, but might be nice to keep a "Start Hand Section" screen
  // For seamless integration, we'll start directly or use a brief transition
  const [testState, setTestState] = useState('intro'); // 'intro', 'testing', 'results'
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [visualFeedback, setVisualFeedback] = useState(null);
  
  // Stats
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [overallStartTime, setOverallStartTime] = useState(null);
  
  // Debug / Status info from tracker
  const [trackerStatus, setTrackerStatus] = useState({ 
    fingers: null, 
    position: null, 
    hand: null 
  });

  const currentTask = TASKS[currentTaskIndex];

  // Initialize test
  const startTest = () => {
    setTestState('testing');
    setOverallStartTime(Date.now());
    setTaskResults([]);
    startTask(0);
  };

  const startTask = (index) => {
    setCurrentTaskIndex(index);
    setTaskCompleted(false);
    setVisualFeedback(null);
    setTaskStartTime(Date.now());
    if (TASKS[index]) {
      setTimeLeft(TASKS[index].timeLimit);
    }
  };

  // Timer logic
  useEffect(() => {
    if (testState !== 'testing' || taskCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testState, currentTaskIndex, taskCompleted]);

  // Handle timeout
  const handleTimeout = () => {
    if (taskCompleted) return;
    setTaskCompleted(true);
    setVisualFeedback('timeout');
    
    // Auto advance after short delay
    setTimeout(() => {
      completeTask({ success: false, accuracy: 0, timeout: true });
    }, 1500);
  };

  const handleHandDetected = useCallback((data) => {
    // Update debug status for UI
    setTrackerStatus({
      fingers: data.fingerCount,
      position: data.position,
      hand: data.handedness
    });

    if (taskCompleted) return;

    // Check success condition
    let success = false;
    let accuracy = 0;
    const task = TASKS[currentTaskIndex];

    if (!task) return;

    if (task.category === 'finger-counting') {
      success = (data.fingerCount === task.fingerCount);
      accuracy = success ? 1.0 : (data.fingerCount !== null && task.fingerCount !== 0) ? (1 - Math.abs(data.fingerCount - task.fingerCount)/5) : 0;
      
    } else if (task.category === 'hand-laterality') {
      success = (data.handedness === task.handTarget);
      accuracy = success ? 1.0 : 0.2;
      
    } else if (task.category === 'hand-position') {
      success = (data.position === task.position);
      accuracy = success ? 1.0 : 0.5;
    }

    // High confidence threshold for automatic success
    if (success && (data.confidence || 0) > 0.6) {
      setTaskCompleted(true);
      setVisualFeedback('success');
      
      // Advance immediately (very short delay for visual feedback)
      setTimeout(() => {
        completeTask({ success: true, accuracy, confidence: data.confidence });
      }, 500);
    }
  }, [currentTaskIndex, taskCompleted]);

  const completeTask = (resultData) => {
    const task = TASKS[currentTaskIndex];
    if (!task) return;

    const result = {
      taskId: task.id,
      title: task.title,
      duration: Date.now() - taskStartTime,
      success: resultData.success || false,
      accuracy: resultData.accuracy || 0,
      timeout: resultData.timeout || false,
      rawData: resultData
    };

    const newResults = [...taskResults, result];
    setTaskResults(newResults);

    // Next task or finish
    if (currentTaskIndex < TASKS.length - 1) {
      startTask(currentTaskIndex + 1);
    } else {
      finishSection(newResults);
    }
  };

  const finishSection = (allResults) => {
    const totalDuration = Date.now() - overallStartTime;
    const completedTasks = allResults.filter(r => r.success).length;
    
    // Calculate metrics per category
    const getCategoryAccuracy = (cat) => {
      const tasks = allResults.filter(r => TASKS.find(t => t.id === r.taskId)?.category === cat);
      if (tasks.length === 0) return 0.65;
      return tasks.reduce((sum, r) => sum + r.accuracy, 0) / tasks.length;
    };
    
    const aggregatedData = {
      section: 'hand-motor-assessment',
      duration: totalDuration,
      completionRate: completedTasks / TASKS.length,
      averageAccuracy: allResults.reduce((sum, r) => sum + r.accuracy, 0) / allResults.length,
      taskResults: allResults,
      fingerCountingAccuracy: getCategoryAccuracy('finger-counting'),
      handLateralityAccuracy: getCategoryAccuracy('hand-laterality'),
      handPositionAccuracy: getCategoryAccuracy('hand-position')
    };

    if (onComplete) {
      onComplete(aggregatedData);
    }
  };

  // Render Methods
  const renderIntro = () => {
    return (
      <div style={styles.introContainer}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{width: '100%'}}>
          <Hand size={48} color="#22c55e" style={{margin: '0 auto', display: 'block'}} />
          <h2 style={styles.introTitle}>Fine Motor Skills</h2>
          <p style={styles.introSubtitle}>Let's play some hand games!</p>
          
          <div style={styles.taskPreview}>
            <div style={styles.taskGrid}>
              {TASKS.map(task => (
                <div key={task.id} style={styles.taskPreviewCard}>
                  <div style={{ ...styles.taskIcon, backgroundColor: `${task.color}15`, color: task.color }}>
                    <Hand size={16} />
                  </div>
                  <span style={styles.taskPreviewTitle}>{task.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <motion.button style={styles.startTestButton} onClick={startTest} whileHover={{ scale: 1.05 }}>
            <Play size={20} /> Start
          </motion.button>
        </motion.div>
      </div>
    );
  };

  const renderTesting = () => {
    return (
      <div style={styles.testingContainer}>
        {/* Progress Bar */}
        <div style={styles.progressHeader}>
          <div style={styles.progressInfo}>Activity {currentTaskIndex + 1} of {TASKS.length}</div>
          <div style={styles.timerContainer}>
            <Clock size={20} color={timeLeft <= 3 ? '#ef4444' : '#22c55e'} />
            <span style={{ ...styles.timerText, color: timeLeft <= 3 ? '#ef4444' : '#22c55e' }}>{timeLeft}s</span>
          </div>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${((currentTaskIndex + 1) / TASKS.length) * 100}%` }} />
        </div>

        {/* Task Card */}
        <motion.div 
          key={currentTask.id} 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: -20 }}
          style={styles.taskCard}
        >
          <div style={{ ...styles.taskCardHeader, backgroundColor: currentTask.color }}>
            <Hand size={24} />
            <h3 style={styles.taskCardTitle}>{currentTask.title}</h3>
          </div>
          <div style={styles.taskInstructions}>
            <p style={styles.taskCardInstruction}>{currentTask.instruction}</p>
            <div style={styles.feedbackBadge}>
               {currentTask.category === 'finger-counting' && (
                 <span>Detected: {trackerStatus.fingers !== null ? `${trackerStatus.fingers} fingers` : '...'}</span>
               )}
               {currentTask.category === 'hand-laterality' && (
                 <span>Detected: {trackerStatus.hand ? `${trackerStatus.hand} hand` : '...'}</span>
               )}
               {currentTask.category === 'hand-position' && (
                 <span>Detected: {trackerStatus.position ? trackerStatus.position.replace('-', ' ') : '...'}</span>
               )}
            </div>
          </div>
        </motion.div>

        {/* Feedback Overlay Message */}
        <AnimatePresence>
          {visualFeedback === 'timeout' && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={styles.messageTimeout}>
              <AlertCircle size={20} /> Time's up!
            </motion.div>
          )}
          {visualFeedback === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={styles.messageSuccess}>
              <CheckCircle size={24} /> Good!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera */}
        <div style={styles.cameraFrame}>
          <MediaPipeHandTracking
            task={currentTask}
            onHandDetected={handleHandDetected}
            isActive={true}
            showVideo={true}
            detectFingers={currentTask.category === 'finger-counting'}
            detectPosition={currentTask.category === 'hand-position'}
            detectGestures={false}
          />
        </div>

        <button 
          style={styles.skipButton} 
          onClick={() => !taskCompleted && completeTask({ success: false, accuracy: 0 })}
          disabled={taskCompleted}
        >
          Skip
        </button>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {testState === 'intro' && renderIntro()}
      {testState === 'testing' && renderTesting()}
    </div>
  );
};

const styles = {
  container: { width: '100%', height: '100%', fontFamily: "'Inter', sans-serif" },
  
  introContainer: { width: '100%', textAlign: 'center', padding: '20px 0' },
  introTitle: { fontSize: '24px', fontWeight: '800', color: '#1e293b', marginTop: '10px', marginBottom: '5px' },
  introSubtitle: { fontSize: '16px', color: '#64748b', marginBottom: '20px' },
  taskPreview: { marginBottom: '20px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px' },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  taskPreviewCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  taskIcon: { width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  taskPreviewTitle: { fontSize: '10px', fontWeight: '600', color: '#334155', textAlign: 'center' },
  startTestButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '50px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', margin: '0 auto' },

  testingContainer: { width: '100%' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  progressInfo: { fontWeight: '700', color: '#334155', fontSize: '14px' },
  progressBar: { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '20px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981', transition: 'width 0.4s ease' },
  
  timerContainer: { display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' },
  timerText: { fontSize: '14px', minWidth: '24px' },

  taskCard: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  taskCardHeader: { padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#fff' },
  taskCardTitle: { margin: 0, fontSize: '18px', fontWeight: '700' },
  taskInstructions: { padding: '16px', textAlign: 'center' },
  taskCardInstruction: { fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '10px' },
  feedbackBadge: { display: 'inline-block', padding: '6px 12px', backgroundColor: '#f1f5f9', borderRadius: '16px', color: '#64748b', fontWeight: '500', fontSize: '12px' },

  cameraFrame: { backgroundColor: '#000', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', position: 'relative', minHeight: '300px' },
  
  messageTimeout: { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#fef2f2', color: '#ef4444', padding: '8px 16px', borderRadius: '20px', fontWeight: '700', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '6px', zIndex: 10, fontSize: '14px' },
  messageSuccess: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#ecfdf5', color: '#10b981', padding: '20px 30px', borderRadius: '20px', fontWeight: '800', fontSize: '20px', border: '2px solid #10b981', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 },

  skipButton: { display: 'block', margin: '0 auto', backgroundColor: 'transparent', border: '1px solid #cbd5e1', color: '#64748b', padding: '8px 24px', borderRadius: '50px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
};

export default HandMotorAssessment;
