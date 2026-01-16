'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Camera, Activity, Hand, CheckCircle, ArrowLeft, Brain, Play, Trophy, Star, AlertCircle } from 'lucide-react';
import MediaPipeHandTracking from '../../src/components/MediaPipeHandTracking';
import { updateAssessmentMetrics } from '@/utils/assessmentDataCollector';

/**
 * Simple Hand Motor Assessment
 * Tests 3 motor coordination metrics: finger counting, hand laterality, hand positioning
 */
export default function DemoPage() {
  const [testState, setTestState] = useState('intro');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState([]);
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [overallStartTime, setOverallStartTime] = useState(null);
  const [finalResults, setFinalResults] = useState(null);

  const testTasks = [
    { id: 1, title: 'Show 3 Fingers', instruction: 'Show 3 fingers', fingerCount: 3, category: 'finger-counting', color: '#6366f1' },
    { id: 2, title: 'Show 5 Fingers', instruction: 'Show 5 fingers', fingerCount: 5, category: 'finger-counting', color: '#8b5cf6' },
    { id: 3, title: 'Left Hand', instruction: 'Raise your LEFT hand', handTarget: 'left', category: 'hand-laterality', color: '#ec4899' },
    { id: 4, title: 'Right Hand', instruction: 'Raise your RIGHT hand', handTarget: 'right', category: 'hand-laterality', color: '#10b981' },
    { id: 5, title: 'Hand Above Head', instruction: 'Hold hand above your head', position: 'above-head', category: 'hand-position', color: '#f59e0b' },
    { id: 6, title: 'Hand In Front', instruction: 'Hold hand in front of your face', position: 'in-front', category: 'hand-position', color: '#06b6d4' }
  ];

  const currentTask = testTasks[currentTaskIndex];

  const startTest = () => {
    setTestState('testing');
    setOverallStartTime(Date.now());
    setTaskStartTime(Date.now());
    setCurrentTaskIndex(0);
    setTaskResults([]);
  };

  const handleTaskComplete = (taskData) => {
    const result = {
      taskId: currentTask.id,
      title: currentTask.title,
      duration: Date.now() - taskStartTime,
      success: taskData.success || false,
      accuracy: taskData.accuracy || 0,
      rawData: taskData
    };

    const newResults = [...taskResults, result];
    setTaskResults(newResults);

    if (currentTaskIndex < testTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setTaskStartTime(Date.now());
    } else {
      finishTest(newResults);
    }
  };

  const finishTest = (allResults) => {
    const totalDuration = Date.now() - overallStartTime;
    const completedTasks = allResults.filter(r => r.success).length;
    
    const fingerTasks = allResults.filter(r => r.rawData?.taskCategory === 'finger-counting');
    const lateralityTasks = allResults.filter(r => r.rawData?.taskCategory === 'hand-laterality');
    const positionTasks = allResults.filter(r => r.rawData?.taskCategory === 'hand-position');
    
    const metrics = {
      totalDuration: Math.round(totalDuration / 1000),
      completionRate: completedTasks / testTasks.length,
      averageAccuracy: allResults.reduce((sum, r) => sum + r.accuracy, 0) / allResults.length,
      taskBreakdown: allResults,
      fingerCountingAccuracy: fingerTasks.reduce((sum, r) => sum + r.accuracy, 0) / fingerTasks.length || 0,
      handLateralityAccuracy: lateralityTasks.reduce((sum, r) => sum + r.accuracy, 0) / lateralityTasks.length || 0,
      handPositionAccuracy: positionTasks.reduce((sum, r) => sum + r.accuracy, 0) / positionTasks.length || 0
    };
    
    updateAssessmentMetrics({
      taskPerformance: {
        task_completion_rate: metrics.completionRate,
        task_abandonment_count: testTasks.length - completedTasks,
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

  const handleHandDetected = (data) => {
    let success = false;
    let accuracy = 0;
    
    if (currentTask.category === 'finger-counting') {
      success = (data.fingerCount || 0) === currentTask.fingerCount;
      accuracy = success ? 1.0 : 0.3;
    } else if (currentTask.category === 'hand-laterality') {
      success = data.handedness === currentTask.handTarget;
      accuracy = success ? 1.0 : 0.2;
    } else if (currentTask.category === 'hand-position') {
      success = data.position === currentTask.position;
      accuracy = success ? 1.0 : 0.4;
    }
    
    if (success && (data.confidence || 0) > 0.6) {
      setTimeout(() => {
        handleTaskComplete({ success, accuracy, confidence: data.confidence, taskCategory: currentTask.category });
      }, 2000);
    }
  };

  if (testState === 'intro') {
    return (
      <div style={styles.container}>
        <div style={styles.nav}>
          <Link href="/" style={styles.navLogo}><Brain size={32} color="#22c55e" /><span style={styles.logoText}>Leadis</span></Link>
          <Link href="/" style={styles.homeLink}><ArrowLeft size={20} />Back to Home</Link>
        </div>
        <div style={styles.introContainer}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Hand size={64} color="#22c55e" />
            <h1 style={styles.introTitle}>Hand Motor Skills Assessment</h1>
            <p style={styles.introSubtitle}>Complete 6 simple hand tasks</p>
            <div style={styles.taskPreview}>
              <h3 style={styles.previewTitle}>Tasks:</h3>
              <div style={styles.taskGrid}>
                {testTasks.map(task => (
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
      </div>
    );
  }

  if (testState === 'testing') {
    return (
      <div style={styles.container}>
        <div style={styles.nav}>
          <Link href="/" style={styles.navLogo}><Brain size={32} color="#22c55e" /><span style={styles.logoText}>Leadis</span></Link>
          <div style={styles.progressInfo}>Task {currentTaskIndex + 1} of {testTasks.length}</div>
        </div>
        <div style={styles.testingContainer}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${((currentTaskIndex + 1) / testTasks.length) * 100}%` }} />
          </div>
          <motion.div key={currentTask.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.taskCard}>
            <div style={{ ...styles.taskCardHeader, backgroundColor: currentTask.color }}>
              <Hand size={24} />
              <h2 style={styles.taskCardTitle}>{currentTask.title}</h2>
            </div>
            <p style={styles.taskCardInstruction}>{currentTask.instruction}</p>
          </motion.div>
          <div style={styles.cameraContainer}>
            <MediaPipeHandTracking
              task={{ description: currentTask.instruction, handTarget: currentTask.handTarget, fingerCount: currentTask.fingerCount, position: currentTask.position, category: currentTask.category }}
              onHandDetected={handleHandDetected}
              isActive={true}
              showVideo={true}
              detectFingers={currentTask.category === 'finger-counting'}
              detectPosition={currentTask.category === 'hand-position'}
            />
          </div>
          <button style={styles.skipButton} onClick={() => handleTaskComplete({ success: false, accuracy: 0 })}>Skip</button>
        </div>
      </div>
    );
  }

  if (testState === 'results' && finalResults) {
    const scorePercentage = Math.round(finalResults.completionRate * 100);
    return (
      <div style={styles.container}>
        <div style={styles.nav}>
          <Link href="/" style={styles.navLogo}><Brain size={32} color="#22c55e" /><span style={styles.logoText}>Leadis</span></Link>
          <Link href="/" style={styles.homeLink}><ArrowLeft size={20} />Back to Home</Link>
        </div>
        <div style={styles.resultsContainer}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={styles.resultsHeader}>
              <Trophy size={64} color="#f59e0b" />
              <h1 style={styles.resultsTitle}>Assessment Complete!</h1>
            </div>
            <div style={styles.scoreCard}>
              <div style={styles.scoreCircle}>
                <div style={styles.scoreNumber}>{scorePercentage}%</div>
              </div>
              <div style={styles.scoreStats}>
                <div style={styles.scoreStat}><CheckCircle size={20} color="#10b981" /><span>{Math.round(finalResults.completionRate * testTasks.length)} / {testTasks.length} Tasks</span></div>
                <div style={styles.scoreStat}><Star size={20} color="#f59e0b" /><span>{Math.round(finalResults.averageAccuracy * 100)}% Accuracy</span></div>
              </div>
            </div>
            <div style={styles.breakdownCard}>
              <h3 style={styles.breakdownTitle}>Task Performance</h3>
              {finalResults.taskBreakdown.map((task, i) => (
                <div key={i} style={styles.taskResult}>
                  <div style={styles.taskResultHeader}>
                    <span>{task.title}</span>
                    {task.success ? <CheckCircle size={20} color="#10b981" /> : <AlertCircle size={20} color="#ef4444" />}
                  </div>
                  <div style={styles.taskResultBar}>
                    <div style={{ ...styles.taskResultFill, width: `${task.accuracy * 100}%`, backgroundColor: task.success ? '#10b981' : '#ef4444' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.actionButtons}>
              <motion.button style={styles.retakeButton} onClick={() => { setTestState('intro'); setTaskResults([]); setCurrentTaskIndex(0); }} whileHover={{ scale: 1.05 }}>Retake</motion.button>
              <Link href="/" style={styles.homeButton}>Home</Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f0fdf4', paddingBottom: '60px' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', backgroundColor: '#fff', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 },
  navLogo: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' },
  logoText: { fontSize: '24px', fontWeight: '700', color: '#1e293b', fontFamily: "'Fredoka', sans-serif" },
  homeLink: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontSize: '16px', fontWeight: '600' },
  introContainer: { maxWidth: '900px', margin: '0 auto', padding: '60px 40px', textAlign: 'center' },
  introTitle: { fontSize: '42px', fontWeight: '700', color: '#1e293b', marginTop: '20px', fontFamily: "'Fredoka', sans-serif" },
  introSubtitle: { fontSize: '20px', color: '#64748b', marginBottom: '40px' },
  taskPreview: { backgroundColor: '#fff', borderRadius: '20px', padding: '32px', marginBottom: '32px' },
  previewTitle: { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', fontFamily: "'Fredoka', sans-serif" },
  taskGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' },
  taskPreviewCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' },
  taskIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  taskPreviewTitle: { fontSize: '14px', fontWeight: '600', color: '#1e293b', textAlign: 'center' },
  startTestButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '18px 48px', borderRadius: '50px', fontSize: '20px', fontWeight: '700', cursor: 'pointer', margin: '0 auto' },
  testingContainer: { maxWidth: '1000px', margin: '0 auto', padding: '20px 40px' },
  progressInfo: { fontSize: '16px', fontWeight: '600', color: '#1e293b', backgroundColor: '#e0f2fe', padding: '8px 20px', borderRadius: '20px' },
  progressBar: { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '32px' },
  progressFill: { height: '100%', backgroundColor: '#22c55e', transition: 'width 0.3s ease', borderRadius: '4px' },
  taskCard: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px' },
  taskCardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', color: '#fff' },
  taskCardTitle: { fontSize: '28px', fontWeight: '700', margin: 0, fontFamily: "'Fredoka', sans-serif" },
  taskCardInstruction: { fontSize: '20px', color: '#1e293b', padding: '24px', textAlign: 'center', fontWeight: '600' },
  cameraContainer: { backgroundColor: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '24px' },
  skipButton: { backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'block', margin: '0 auto' },
  resultsContainer: { maxWidth: '900px', margin: '0 auto', padding: '60px 40px' },
  resultsHeader: { textAlign: 'center', marginBottom: '48px' },
  resultsTitle: { fontSize: '42px', fontWeight: '700', color: '#1e293b', marginTop: '24px', fontFamily: "'Fredoka', sans-serif" },
  scoreCard: { backgroundColor: '#fff', borderRadius: '24px', padding: '40px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '40px' },
  scoreCircle: { width: '180px', height: '180px', borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 },
  scoreNumber: { fontSize: '48px', fontWeight: '700', fontFamily: "'Fredoka', sans-serif" },
  scoreStats: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  scoreStat: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', color: '#1e293b', fontWeight: '600' },
  breakdownCard: { backgroundColor: '#fff', borderRadius: '20px', padding: '32px', marginBottom: '24px' },
  breakdownTitle: { fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px', fontFamily: "'Fredoka', sans-serif" },
  taskResult: { marginBottom: '20px' },
  taskResultHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  taskResultBar: { width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' },
  taskResultFill: { height: '100%', transition: 'width 0.3s ease', borderRadius: '5px' },
  actionButtons: { display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '48px' },
  retakeButton: { backgroundColor: '#22c55e', color: '#fff', border: 'none', padding: '16px 40px', borderRadius: '50px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' },
  homeButton: { backgroundColor: '#fff', color: '#1e293b', border: '2px solid #22c55e', padding: '16px 40px', borderRadius: '50px', fontSize: '18px', fontWeight: '700', textDecoration: 'none', display: 'inline-block' }
};
