'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Camera, Activity, Hand, CheckCircle, ArrowLeft, Brain, Play, Trophy, Star, AlertCircle, Clock } from 'lucide-react';
import MediaPipeHandTracking from '../../src/components/MediaPipeHandTracking';
import { updateAssessmentMetrics } from '@/utils/assessmentDataCollector';

const TASKS = [
  { id: 1, title: 'Show 3 Fingers', instruction: 'Show 3 fingers', fingerCount: 3, category: 'finger-counting', color: '#6366f1', timeLimit: 10 },
  { id: 2, title: 'Show 5 Fingers', instruction: 'Show 5 fingers', fingerCount: 5, category: 'finger-counting', color: '#8b5cf6', timeLimit: 10 },
  { id: 3, title: 'Left Hand', instruction: 'Raise your LEFT hand', handTarget: 'left', category: 'hand-laterality', color: '#ec4899', timeLimit: 8 },
  { id: 4, title: 'Right Hand', instruction: 'Raise your RIGHT hand', handTarget: 'right', category: 'hand-laterality', color: '#10b981', timeLimit: 8 },
  { id: 5, title: 'Hand Above Head', instruction: 'Hold hand above your head', position: 'above-head', category: 'hand-position', color: '#f59e0b', timeLimit: 8 },
  { id: 6, title: 'Hand In Front', instruction: 'Hold hand in front of your face', position: 'in-front', category: 'hand-position', color: '#06b6d4', timeLimit: 8 }
];

export default function DemoPage() {
  const [testState, setTestState] = useState('intro'); // 'intro', 'testing', 'results'
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [visualFeedback, setVisualFeedback] = useState(null); // 'success', 'timeout', etc.
  
  // Stats
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [overallStartTime, setOverallStartTime] = useState(null);
  const [finalResults, setFinalResults] = useState(null);
  
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

  // Callback from MediaPipe
  // Use useCallback to ensure the reference is stable but updates when dependencies change
  // Note: MediaPipe component is now using refs to always call the latest version of this function
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
      // Partial credit
      accuracy = success ? 1.0 : (data.fingerCount !== null && task.fingerCount !== 0) ? (1 - Math.abs(data.fingerCount - task.fingerCount)/5) : 0;
      
    } else if (task.category === 'hand-laterality') {
      success = (data.handedness === task.handTarget);
      accuracy = success ? 1.0 : 0.2;
      
    } else if (task.category === 'hand-position') {
      success = (data.position === task.position);
      accuracy = success ? 1.0 : 0.4;
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
      finishTest(newResults);
    }
  };

  const finishTest = (allResults) => {
    const totalDuration = Date.now() - overallStartTime;
    const completedTasks = allResults.filter(r => r.success).length;
    
    // Calculate metrics per category
    const getCategoryAccuracy = (cat) => {
      const tasks = allResults.filter(r => TASKS.find(t => t.id === r.taskId)?.category === cat);
      if (tasks.length === 0) return 0;
      return tasks.reduce((sum, r) => sum + r.accuracy, 0) / tasks.length;
    };
    
    const metrics = {
      totalDuration: Math.round(totalDuration / 1000),
      completionRate: completedTasks / TASKS.length,
      averageAccuracy: allResults.reduce((sum, r) => sum + r.accuracy, 0) / allResults.length,
      taskBreakdown: allResults,
      fingerCountingAccuracy: getCategoryAccuracy('finger-counting'),
      handLateralityAccuracy: getCategoryAccuracy('hand-laterality'),
      handPositionAccuracy: getCategoryAccuracy('hand-position')
    };

    // Save to user schema
    updateAssessmentMetrics({
      taskPerformance: {
        task_completion_rate: metrics.completionRate,
        task_abandonment_count: TASKS.length - completedTasks,
        instruction_follow_accuracy: metrics.averageAccuracy
      },
      motorCoordination: {
        hand_laterality_accuracy: metrics.handLateralityAccuracy,
        finger_counting_accuracy: metrics.fingerCountingAccuracy,
        hand_position_accuracy: metrics.handPositionAccuracy
      }
    });

    setFinalResults(metrics);
    setTestState('results');
  };

  // Render Methods
  const renderIntro = () => {
    return (
      <div style={styles.introContainer}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Hand size={64} color="#22c55e" />
          <h1 style={styles.introTitle}>Hand Motor Skills Assessment</h1>
          <p style={styles.introSubtitle}>Complete 6 simple hand tasks</p>
          
          <div style={styles.taskPreview}>
            <div style={styles.taskGrid}>
              {TASKS.map(task => (
                <div key={task.id} style={styles.taskPreviewCard}>
                  <div style={{ ...styles.taskIcon, backgroundColor: `${task.color}15`, color: task.color }}>
                    <Hand size={24} />
                  </div>
                  <span style={styles.taskPreviewTitle}>{task.title}</span>
                </div>
              ))}
            </div>
          </div>
          
          <motion.button style={styles.startTestButton} onClick={startTest} whileHover={{ scale: 1.05 }}>
            <Play size={24} />Start Test
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
          <div style={styles.progressInfo}>Task {currentTaskIndex + 1} of {TASKS.length}</div>
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
            <Hand size={32} />
            <h2 style={styles.taskCardTitle}>{currentTask.title}</h2>
          </div>
          <div style={styles.taskInstructions}>
            <p style={styles.taskCardInstruction}>{currentTask.instruction}</p>
            {/* Real-time feedback badge */}
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
              <AlertCircle size={24} /> Time's up! Moving next...
            </motion.div>
          )}
          {visualFeedback === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={styles.messageSuccess}>
              <CheckCircle size={32} /> Great Job!
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
            // Pass specific flags based on current task to optimize
            detectFingers={currentTask.category === 'finger-counting'}
            detectPosition={currentTask.category === 'hand-position'}
            detectGestures={false} // Simplify processing
          />
        </div>

        <button 
          style={styles.skipButton} 
          onClick={() => !taskCompleted && completeTask({ success: false, accuracy: 0 })}
          disabled={taskCompleted}
        >
          Skip Task
        </button>
      </div>
    );
  };

  const renderResults = () => {
    if (!finalResults) return null;
    const scorePercentage = Math.round(finalResults.completionRate * 100);
    
    return (
      <div style={styles.resultsContainer}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={styles.resultsHeader}>
            <Trophy size={64} color="#f59e0b" />
            <h1 style={styles.resultsTitle}>Assessment Complete!</h1>
          </div>
          
          <div style={styles.scoreCard}>
            <div style={styles.scoreCircle}>
              <div style={styles.scoreNumber}>{scorePercentage}%</div>
              <div style={styles.scoreLabel}>Completion</div>
            </div>
            <div style={styles.scoreStats}>
              <div style={styles.scoreStat}>
                <CheckCircle size={24} color="#10b981" />
                <span>{Math.round(finalResults.completionRate * TASKS.length)} / {TASKS.length} Tasks Completed</span>
              </div>
              <div style={styles.scoreStat}>
                <Star size={24} color="#f59e0b" />
                <span>{Math.round(finalResults.averageAccuracy * 100)}% Average Accuracy</span>
              </div>
            </div>
          </div>

          <div style={styles.breakdownCard}>
            <h3 style={styles.breakdownTitle}>Task Performance</h3>
            {finalResults.taskBreakdown.map((task, i) => (
              <div key={i} style={styles.taskResult}>
                <div style={styles.taskResultHeader}>
                  <span style={styles.taskResultTitle}>{task.title}</span>
                  {task.success ? 
                    <span style={{color: '#10b981', fontWeight: 'bold'}}>Success</span> : 
                    <span style={{color: '#ef4444', fontWeight: 'bold'}}>Skipped</span>
                  }
                </div>
                <div style={styles.taskResultBar}>
                  <div style={{ 
                    ...styles.taskResultFill, 
                    width: `${task.success ? task.accuracy * 100 : 0}%`, 
                    backgroundColor: task.success ? '#10b981' : '#ef4444' 
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={styles.actionButtons}>
            <motion.button style={styles.retakeButton} onClick={() => setTestState('intro')} whileHover={{ scale: 1.05 }}>
              Retake Assessment
            </motion.button>
            <Link href="/" style={styles.homeButton}>Return Home</Link>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.nav}>
        <Link href="/" style={styles.navLogo}>
          <Brain size={32} color="#22c55e" />
          <span style={styles.logoText}>Leadis</span>
        </Link>
        <Link href="/" style={styles.homeLink}><ArrowLeft size={16} /> Exit</Link>
      </div>

      <div style={styles.mainContent}>
        {testState === 'intro' && renderIntro()}
        {testState === 'testing' && renderTesting()}
        {testState === 'results' && renderResults()}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0fdf4', fontFamily: "'Inter', sans-serif" },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' },
  logoText: { fontSize: '24px', fontWeight: '800', color: '#10b981' },
  homeLink: { display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', textDecoration: 'none', fontWeight: '600' },
  
  mainContent: { padding: '40px 20px' },

  introContainer: { maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '40px 0' },
  introTitle: { fontSize: '36px', fontWeight: '800', color: '#1e293b', marginTop: '20px', marginBottom: '10px' },
  introSubtitle: { fontSize: '18px', color: '#64748b', marginBottom: '40px' },
  taskPreview: { marginBottom: '40px', backgroundColor: '#fff', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' },
  taskPreviewCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '16px' },
  taskIcon: { width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  taskPreviewTitle: { fontSize: '14px', fontWeight: '600', color: '#334155' },
  startTestButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '16px 40px', borderRadius: '50px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', margin: '0 auto', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' },

  testingContainer: { maxWidth: '900px', margin: '0 auto' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  progressInfo: { fontWeight: '700', color: '#334155' },
  progressBar: { width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', marginBottom: '30px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981', transition: 'width 0.4s ease' },
  
  timerContainer: { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' },
  timerText: { fontSize: '18px', minWidth: '30px' },

  taskCard: { backgroundColor: '#fff', borderRadius: '24px', overflow: 'hidden', marginBottom: '30px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
  taskCardHeader: { padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', color: '#fff' },
  taskCardTitle: { margin: 0, fontSize: '24px', fontWeight: '700' },
  taskInstructions: { padding: '30px', textAlign: 'center' },
  taskCardInstruction: { fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '15px' },
  feedbackBadge: { display: 'inline-block', padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '20px', color: '#64748b', fontWeight: '500', fontSize: '14px' },

  cameraFrame: { backgroundColor: '#000', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px' },
  
  messageTimeout: { position: 'fixed', top: '100px', left: '50%', x: '-50%', backgroundColor: '#fef2f2', color: '#ef4444', padding: '16px 32px', borderRadius: '50px', fontWeight: '700', border: '2px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' },
  messageSuccess: { position: 'fixed', top: '40%', left: '50%', x: '-50%', y: '-50%', backgroundColor: '#ecfdf5', color: '#10b981', padding: '30px 50px', borderRadius: '30px', fontWeight: '800', fontSize: '24px', border: '4px solid #10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1000, boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)' },

  skipButton: { display: 'block', margin: '0 auto', backgroundColor: 'transparent', border: '2px solid #cbd5e1', color: '#64748b', padding: '12px 30px', borderRadius: '50px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },

  resultsContainer: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
  resultsHeader: { marginBottom: '40px' },
  resultsTitle: { fontSize: '32px', fontWeight: '800', color: '#1e293b', marginTop: '15px' },
  scoreCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  scoreCircle: { position: 'relative' },
  scoreNumber: { fontSize: '56px', fontWeight: '800', color: '#10b981' },
  scoreLabel: { fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },
  scoreStats: { display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' },
  scoreStat: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: '600', color: '#334155' },
  
  breakdownCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', marginBottom: '40px' },
  breakdownTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '20px', textAlign: 'left', color: '#1e293b' },
  taskResult: { marginBottom: '15px' },
  taskResultHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '14px' },
  taskResultTitle: { fontWeight: '600', color: '#475569' },
  taskResultBar: { height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  taskResultFill: { height: '100%', borderRadius: '4px' },
  
  actionButtons: { display: 'flex', gap: '20px', justifyContent: 'center' },
  retakeButton: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '15px 40px', borderRadius: '50px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  homeButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', border: '2px solid #e2e8f0', color: '#64748b', padding: '15px 40px', borderRadius: '50px', fontSize: '16px', fontWeight: '700', textDecoration: 'none' }
};
