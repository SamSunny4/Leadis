'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, CheckCircle, Play, Trophy, Star, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import MediaPipeHandTracking from './MediaPipeHandTracking';
import { colors } from '../../styles/quizStyles';

const TASKS = [
  { id: 1, title: 'Show 3 Fingers', instruction: 'Show 3 fingers', fingerCount: 3, category: 'finger-counting', color: colors.primary, timeLimit: 10 },
  { id: 2, title: 'Show 5 Fingers', instruction: 'Show 5 fingers', fingerCount: 5, category: 'finger-counting', color: colors.primaryDark, timeLimit: 10 },
  { id: 3, title: 'Left Hand', instruction: 'Raise your LEFT hand', handTarget: 'left', category: 'hand-laterality', color: colors.pink, timeLimit: 8 },
  { id: 4, title: 'Right Hand', instruction: 'Raise your RIGHT hand', handTarget: 'right', category: 'hand-laterality', color: colors.blue, timeLimit: 8 }
];

const HandMotorAssessment = ({ onComplete }) => {
  const [testState, setTestState] = useState('intro'); // 'intro', 'testing', 'results'
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [visualFeedback, setVisualFeedback] = useState(null);
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [overallStartTime, setOverallStartTime] = useState(null);
  const [aggregatedResults, setAggregatedResults] = useState(null);
  
  const [trackerStatus, setTrackerStatus] = useState({ 
    fingers: null, 
    position: null, 
    hand: null 
  });

  const currentTask = TASKS[currentTaskIndex];

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

  const handleTimeout = () => {
    if (taskCompleted) return;
    setTaskCompleted(true);
    setVisualFeedback('timeout');
    
    setTimeout(() => {
      completeTask({ success: false, accuracy: 0, timeout: true });
    }, 1500);
  };

  const handleHandDetected = useCallback((data) => {
    setTrackerStatus({
      fingers: data.fingerCount,
      position: data.position,
      hand: data.handedness
    });

    if (taskCompleted) return;

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
      accuracy = success ? 1.0 : 0.4;
    }

    if (success && (data.confidence || 0) > 0.6) {
      setTaskCompleted(true);
      setVisualFeedback('success');
      
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

    if (currentTaskIndex < TASKS.length - 1) {
      startTask(currentTaskIndex + 1);
    } else {
      finishSection(newResults);
    }
  };

  const finishSection = (allResults) => {
    const totalDuration = Date.now() - overallStartTime;
    const completedTasks = allResults.filter(r => r.success).length;
    
    const getCategoryAccuracy = (cat) => {
      const tasks = allResults.filter(r => TASKS.find(t => t.id === r.taskId)?.category === cat);
      if (tasks.length === 0) return 0;
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

    setAggregatedResults(aggregatedData);
    setTestState('results');
  };

  const handleContinue = () => {
    console.log('Continue button clicked!');
    console.log('onComplete exists:', !!onComplete);
    console.log('aggregatedResults:', aggregatedResults);
    
    if (typeof onComplete === 'function') {
      console.log('Calling onComplete with data...');
      onComplete(aggregatedResults);
    } else {
      console.error('onComplete is not a function:', onComplete);
    }
  };

  const renderIntro = () => (
    <div style={styles.introContainer}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{width: '100%'}}>
        <div style={styles.iconWrapper}>
          <Hand size={28} color={colors.primary} />
        </div>
        <h2 style={styles.introTitle}>Fine Motor Skills</h2>
        <p style={styles.introSubtitle}>Let's play some hand games!</p>
        
        <div style={styles.taskPreview}>
          <div style={styles.taskGrid}>
            {TASKS.map(task => (
              <div key={task.id} style={styles.taskPreviewCard}>
                <div style={{ ...styles.taskIcon, backgroundColor: `${task.color}20`, color: task.color }}>
                  <Hand size={14} />
                </div>
                <span style={styles.taskPreviewTitle}>{task.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        <motion.button 
          style={styles.startButton} 
          onClick={startTest} 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play size={16} /> Start
        </motion.button>
      </motion.div>
    </div>
  );

  const renderTesting = () => (
    <div style={styles.testingContainer}>
      <div style={styles.progressHeader}>
        <div style={styles.progressInfo}>Activity {currentTaskIndex + 1} of {TASKS.length}</div>
        <div style={styles.timerContainer}>
          <Clock size={14} color={timeLeft <= 3 ? colors.red : colors.primary} />
          <span style={{ ...styles.timerText, color: timeLeft <= 3 ? colors.red : colors.primary }}>{timeLeft}s</span>
        </div>
      </div>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${((currentTaskIndex + 1) / TASKS.length) * 100}%` }} />
      </div>

      <motion.div 
        key={currentTask.id} 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        exit={{ opacity: 0, x: -20 }}
        style={styles.taskCard}
      >
        <div style={{ ...styles.taskCardHeader, backgroundColor: currentTask.color }}>
          <Hand size={18} />
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

      <AnimatePresence>
        {visualFeedback === 'timeout' && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={styles.messageTimeout}>
            <AlertCircle size={14} /> Time's up!
          </motion.div>
        )}
        {visualFeedback === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={styles.messageSuccess}>
            <CheckCircle size={18} /> Good!
          </motion.div>
        )}
      </AnimatePresence>

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

  const renderResults = () => {
    const successCount = taskResults.filter(r => r.success).length;
    const avgAccuracy = Math.round(aggregatedResults?.averageAccuracy * 100 || 0);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        style={styles.resultsContainer}
      >
        <div style={styles.resultsHeader}>
          <Trophy size={32} color={colors.yellow} />
          <h2 style={styles.resultsTitle}>Great Job!</h2>
          <p style={styles.resultsSubtitle}>You completed the hand assessment</p>
        </div>

        <div style={styles.scoreCard}>
          <div style={styles.scoreItem}>
            <Star size={18} color={colors.primary} />
            <span style={styles.scoreValue}>{successCount}/{TASKS.length}</span>
            <span style={styles.scoreLabel}>Tasks Completed</span>
          </div>
          <div style={styles.scoreDivider} />
          <div style={styles.scoreItem}>
            <CheckCircle size={18} color={colors.primary} />
            <span style={styles.scoreValue}>{avgAccuracy}%</span>
            <span style={styles.scoreLabel}>Accuracy</span>
          </div>
        </div>

        <div style={styles.taskResultsList}>
          {taskResults.map((result, idx) => (
            <div key={idx} style={styles.taskResultItem}>
              <span style={styles.taskResultName}>{result.title}</span>
              <span style={{
                ...styles.taskResultBadge,
                backgroundColor: result.success ? colors.primaryLight : '#fef2f2',
                color: result.success ? colors.primaryDark : '#dc2626',
              }}>
                {result.success ? '✓ Pass' : result.timeout ? '⏱ Timeout' : '✗ Missed'}
              </span>
            </div>
          ))}
        </div>

        <motion.button 
          style={styles.continueButton} 
          onClick={handleContinue}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    );
  };

  return (
    <div style={styles.container}>
      {testState === 'intro' && renderIntro()}
      {testState === 'testing' && renderTesting()}
      {testState === 'results' && renderResults()}
    </div>
  );
};

const styles = {
  container: { 
    width: '100%', 
    height: '100%', 
    fontFamily: 'var(--font-nunito), sans-serif',
  },
  
  // Intro styles
  introContainer: { 
    width: '100%', 
    textAlign: 'center', 
    padding: '10px 0',
  },
  iconWrapper: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: colors.primaryLight,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px',
  },
  introTitle: { 
    fontSize: '18px', 
    fontWeight: 800, 
    color: colors.dark, 
    marginTop: '6px', 
    marginBottom: '4px',
  },
  introSubtitle: { 
    fontSize: '13px', 
    color: colors.gray, 
    marginBottom: '12px',
  },
  taskPreview: { 
    marginBottom: '12px', 
    backgroundColor: colors.lightBg, 
    padding: '12px', 
    borderRadius: '12px',
    border: `2px solid ${colors.primaryLight}`,
  },
  taskGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: '8px',
  },
  taskPreviewCard: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '4px', 
    padding: '8px', 
    backgroundColor: colors.white, 
    borderRadius: '10px', 
    border: `2px solid ${colors.primaryLight}`,
  },
  taskIcon: { 
    width: '28px', 
    height: '28px', 
    borderRadius: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  taskPreviewTitle: { 
    fontSize: '10px', 
    fontWeight: 700, 
    color: colors.dark, 
    textAlign: 'center',
  },
  startButton: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '6px', 
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    color: colors.white, 
    border: 'none', 
    padding: '10px 28px', 
    borderRadius: '50px', 
    fontSize: '14px', 
    fontWeight: 700, 
    cursor: 'pointer', 
    margin: '0 auto',
    boxShadow: `0 6px 18px rgba(34, 197, 94, 0.35)`,
  },

  // Testing styles
  testingContainer: { 
    width: '100%',
  },
  progressHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginBottom: '6px',
  },
  progressInfo: { 
    fontWeight: 700, 
    color: colors.dark, 
    fontSize: '12px',
  },
  progressBar: { 
    width: '100%', 
    height: '6px', 
    backgroundColor: colors.primaryLight, 
    borderRadius: '3px', 
    marginBottom: '12px', 
    overflow: 'hidden',
  },
  progressFill: { 
    height: '100%', 
    backgroundColor: colors.primary, 
    transition: 'width 0.4s ease',
  },
  timerContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '3px', 
    fontWeight: 700,
  },
  timerText: { 
    fontSize: '12px', 
    minWidth: '20px',
  },

  taskCard: { 
    backgroundColor: colors.white, 
    borderRadius: '12px', 
    overflow: 'hidden', 
    marginBottom: '12px', 
    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
    border: `2px solid ${colors.primaryLight}`,
  },
  taskCardHeader: { 
    padding: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px', 
    color: colors.white,
  },
  taskCardTitle: { 
    margin: 0, 
    fontSize: '14px', 
    fontWeight: 700,
  },
  taskInstructions: { 
    padding: '10px', 
    textAlign: 'center',
  },
  taskCardInstruction: { 
    fontSize: '14px', 
    fontWeight: 600, 
    color: colors.dark, 
    marginBottom: '8px',
  },
  feedbackBadge: { 
    display: 'inline-block', 
    padding: '5px 12px', 
    backgroundColor: colors.lightBg, 
    borderRadius: '16px', 
    color: colors.gray, 
    fontWeight: 600, 
    fontSize: '11px',
    border: `1px solid ${colors.primaryLight}`,
  },

  cameraFrame: { 
    borderRadius: '12px', 
    overflow: 'hidden', 
    marginBottom: '12px', 
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  messageTimeout: { 
    position: 'absolute', 
    top: '10px', 
    left: '50%', 
    transform: 'translateX(-50%)', 
    backgroundColor: '#fef2f2', 
    color: colors.red, 
    padding: '6px 14px', 
    borderRadius: '16px', 
    fontWeight: 700, 
    border: '2px solid #fecaca', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    zIndex: 10, 
    fontSize: '12px',
  },
  messageSuccess: { 
    position: 'absolute', 
    top: '50%', 
    left: '50%', 
    transform: 'translate(-50%, -50%)', 
    backgroundColor: colors.lightBg, 
    color: colors.primary, 
    padding: '12px 20px', 
    borderRadius: '16px', 
    fontWeight: 800, 
    fontSize: '16px', 
    border: `2px solid ${colors.primary}`, 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    zIndex: 10,
  },

  skipButton: { 
    display: 'block', 
    margin: '0 auto', 
    backgroundColor: 'transparent', 
    border: `1px solid ${colors.gray}`, 
    color: colors.gray, 
    padding: '6px 20px', 
    borderRadius: '50px', 
    fontWeight: 600, 
    cursor: 'pointer', 
    fontSize: '12px',
  },

  // Results styles
  resultsContainer: {
    width: '100%',
    textAlign: 'center',
    padding: '10px 0',
  },
  resultsHeader: {
    marginBottom: '16px',
  },
  resultsTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: colors.dark,
    marginTop: '8px',
    marginBottom: '2px',
  },
  resultsSubtitle: {
    fontSize: '13px',
    color: colors.gray,
  },
  scoreCard: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: colors.lightBg,
    borderRadius: '14px',
    marginBottom: '16px',
    border: `2px solid ${colors.primaryLight}`,
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  scoreValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: colors.gray,
  },
  scoreDivider: {
    width: '2px',
    height: '40px',
    backgroundColor: colors.primaryLight,
  },
  taskResultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
  },
  taskResultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    backgroundColor: colors.white,
    borderRadius: '10px',
    border: `1px solid ${colors.primaryLight}`,
  },
  taskResultName: {
    fontSize: '12px',
    fontWeight: 600,
    color: colors.dark,
  },
  taskResultBadge: {
    padding: '3px 10px',
    borderRadius: '14px',
    fontSize: '10px',
    fontWeight: 700,
  },
  continueButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    color: colors.white,
    border: 'none',
    padding: '12px 32px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: `0 6px 18px rgba(34, 197, 94, 0.35)`,
  },
};

export default HandMotorAssessment;
