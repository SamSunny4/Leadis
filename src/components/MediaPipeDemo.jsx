import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveAssessment from './InteractiveAssessment';
import MediaPipePoseEstimation from './MediaPipePoseEstimation';
import MediaPipeFaceMesh from './MediaPipeFaceMesh';
import MediaPipeHandTracking from './MediaPipeHandTracking';
import { Camera, Activity, Hand, Eye, CheckCircle, XCircle } from 'lucide-react';

/**
 * MediaPipe Demo Page
 * 
 * Demonstrates all MediaPipe capabilities integrated into the Leadis platform:
 * - Pose estimation for instruction-following
 * - Face mesh for attention tracking
 * - Hand tracking for motor coordination
 * - Complete interactive assessment
 */
const MediaPipeDemo = () => {
  const [activeDemo, setActiveDemo] = useState(null);
  const [assessmentResults, setAssessmentResults] = useState(null);

  const handleAssessmentComplete = (results) => {
    setAssessmentResults(results);
    console.log('Assessment completed:', results);
    
    // Generate developmental risk profile
    const profile = generateRiskProfile(results);
    console.log('Risk profile:', profile);
  };

  const generateRiskProfile = (results) => {
    // Analyze collected data to generate risk indicators
    const profile = {
      domains: {
        motorCoordination: analyzeMotorData(results.motorCoordination),
        attention: analyzeAttentionData(results.attentionMetrics),
        instructionFollowing: analyzeInstructionData(results.instructionFollowing)
      },
      overallRisk: 'low', // low, moderate, high
      recommendations: [],
      strengths: [],
      concerns: []
    };

    // Calculate overall risk level
    const riskScores = Object.values(profile.domains).map(d => d.riskLevel);
    const highRiskCount = riskScores.filter(r => r === 'high').length;
    const moderateRiskCount = riskScores.filter(r => r === 'moderate').length;

    if (highRiskCount >= 2) {
      profile.overallRisk = 'high';
      profile.recommendations.push('Professional evaluation recommended');
    } else if (highRiskCount >= 1 || moderateRiskCount >= 2) {
      profile.overallRisk = 'moderate';
      profile.recommendations.push('Follow-up screening in 3 months');
    } else {
      profile.overallRisk = 'low';
      profile.recommendations.push('Continue age-appropriate activities');
    }

    return profile;
  };

  const analyzeMotorData = (data) => {
    if (!data || data.length === 0) {
      return { riskLevel: 'unknown', score: 0, notes: 'Insufficient data' };
    }

    const avgStability = data.reduce((sum, d) => sum + (d.stability || 0), 0) / data.length;
    const avgCoordination = data.reduce((sum, d) => sum + (d.coordination || 0), 0) / data.length;

    let riskLevel = 'low';
    if (avgStability < 50 || avgCoordination < 50) {
      riskLevel = 'high';
    } else if (avgStability < 70 || avgCoordination < 70) {
      riskLevel = 'moderate';
    }

    return {
      riskLevel,
      score: Math.round((avgStability + avgCoordination) / 2),
      notes: `Average stability: ${Math.round(avgStability)}%, coordination: ${Math.round(avgCoordination)}%`
    };
  };

  const analyzeAttentionData = (data) => {
    if (!data || data.length === 0) {
      return { riskLevel: 'unknown', score: 0, notes: 'Insufficient data' };
    }

    const avgAttentionScore = data.reduce((sum, d) => sum + (d.attentionScore || 0), 0) / data.length;
    const lowEngagementRatio = data.filter(d => d.engagementLevel === 'low').length / data.length;

    let riskLevel = 'low';
    if (avgAttentionScore < 40 || lowEngagementRatio > 0.5) {
      riskLevel = 'high';
    } else if (avgAttentionScore < 60 || lowEngagementRatio > 0.3) {
      riskLevel = 'moderate';
    }

    return {
      riskLevel,
      score: Math.round(avgAttentionScore),
      notes: `Average attention: ${Math.round(avgAttentionScore)}%, low engagement: ${Math.round(lowEngagementRatio * 100)}%`
    };
  };

  const analyzeInstructionData = (data) => {
    if (!data || data.length === 0) {
      return { riskLevel: 'unknown', score: 0, notes: 'Insufficient data' };
    }

    const successRate = data.filter(d => d.matched).length / data.length;
    const avgConfidence = data.reduce((sum, d) => sum + (d.confidence || 0), 0) / data.length;

    let riskLevel = 'low';
    if (successRate < 0.4 || avgConfidence < 0.5) {
      riskLevel = 'high';
    } else if (successRate < 0.6 || avgConfidence < 0.7) {
      riskLevel = 'moderate';
    }

    return {
      riskLevel,
      score: Math.round(successRate * 100),
      notes: `Success rate: ${Math.round(successRate * 100)}%, avg confidence: ${Math.round(avgConfidence * 100)}%`
    };
  };

  const demoOptions = [
    {
      id: 'pose',
      title: 'Pose Estimation',
      description: 'Track body movements and evaluate instruction-following',
      icon: <Activity size={32} />,
      color: '#6366f1'
    },
    {
      id: 'face',
      title: 'Attention Tracking',
      description: 'Monitor gaze direction and engagement levels',
      icon: <Eye size={32} />,
      color: '#8b5cf6'
    },
    {
      id: 'hand',
      title: 'Motor Coordination',
      description: 'Assess fine motor skills and hand-eye coordination',
      icon: <Hand size={32} />,
      color: '#ec4899'
    },
    {
      id: 'assessment',
      title: 'Full Assessment',
      description: 'Complete multimodal developmental screening',
      icon: <CheckCircle size={32} />,
      color: '#10b981'
    }
  ];

  if (activeDemo === 'assessment') {
    return (
      <div style={styles.container}>
        <button 
          onClick={() => setActiveDemo(null)} 
          style={styles.backButton}
        >
          ← Back to Demos
        </button>
        <InteractiveAssessment
          onAssessmentComplete={handleAssessmentComplete}
          ageGroup="5-7"
        />
        {assessmentResults && (
          <div style={styles.resultsPanel}>
            <h3 style={styles.resultsTitle}>Assessment Complete!</h3>
            <p>Duration: {Math.round(assessmentResults.duration / 1000)} seconds</p>
            <p>Completion: {Math.round(assessmentResults.completionRate)}%</p>
          </div>
        )}
      </div>
    );
  }

  if (activeDemo === 'pose') {
    return (
      <div style={styles.container}>
        <button 
          onClick={() => setActiveDemo(null)} 
          style={styles.backButton}
        >
          ← Back to Demos
        </button>
        <div style={styles.demoContent}>
          <h2 style={styles.demoTitle}>Pose Estimation Demo</h2>
          <p style={styles.demoDescription}>
            Follow the instruction shown on screen. The system will track your body movements.
          </p>
          <MediaPipePoseEstimation
            instruction={{ type: 'raise_hands', text: 'Raise both hands above your head' }}
            onPoseDetected={(data) => console.log('Pose detected:', data)}
            isActive={true}
            showVideo={true}
          />
        </div>
      </div>
    );
  }

  if (activeDemo === 'face') {
    return (
      <div style={styles.container}>
        <button 
          onClick={() => setActiveDemo(null)} 
          style={styles.backButton}
        >
          ← Back to Demos
        </button>
        <div style={styles.demoContent}>
          <h2 style={styles.demoTitle}>Attention Tracking Demo</h2>
          <p style={styles.demoDescription}>
            Look at the camera. The system will track your gaze and attention levels.
          </p>
          <MediaPipeFaceMesh
            onFaceDetected={(data) => console.log('Face detected:', data)}
            isActive={true}
            trackAttention={true}
            showVideo={true}
          />
        </div>
      </div>
    );
  }

  if (activeDemo === 'hand') {
    return (
      <div style={styles.container}>
        <button 
          onClick={() => setActiveDemo(null)} 
          style={styles.backButton}
        >
          ← Back to Demos
        </button>
        <div style={styles.demoContent}>
          <h2 style={styles.demoTitle}>Hand Tracking Demo</h2>
          <p style={styles.demoDescription}>
            Show your hand to the camera and try different gestures.
          </p>
          <MediaPipeHandTracking
            task={{ description: 'Make different hand gestures' }}
            onHandDetected={(data) => console.log('Hand detected:', data)}
            isActive={true}
            showVideo={true}
            detectGestures={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Camera size={48} color="#6366f1" />
        <h1 style={styles.title}>MediaPipe Integration</h1>
        <p style={styles.subtitle}>
          Advanced AI-powered motion tracking and behavioral analysis for developmental screening
        </p>
      </div>

      <div style={styles.demoGrid}>
        {demoOptions.map((option) => (
          <motion.div
            key={option.id}
            whileHover={{ scale: 1.02, translateY: -4 }}
            whileTap={{ scale: 0.98 }}
            style={{
              ...styles.demoCard,
              borderTop: `4px solid ${option.color}`
            }}
            onClick={() => setActiveDemo(option.id)}
          >
            <div style={{ ...styles.iconContainer, backgroundColor: `${option.color}15` }}>
              <div style={{ color: option.color }}>
                {option.icon}
              </div>
            </div>
            <h3 style={styles.cardTitle}>{option.title}</h3>
            <p style={styles.cardDescription}>{option.description}</p>
            <button 
              style={{
                ...styles.tryButton,
                backgroundColor: option.color
              }}
            >
              Try Demo
            </button>
          </motion.div>
        ))}
      </div>

      <div style={styles.infoSection}>
        <h2 style={styles.infoTitle}>How MediaPipe Enhances Leadis</h2>
        <div style={styles.featureList}>
          <div style={styles.featureItem}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <strong>Camera-based Pose Estimation:</strong> Evaluates comprehension and motor planning through instruction-following tasks
            </div>
          </div>
          <div style={styles.featureItem}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <strong>Attention Monitoring:</strong> Tracks gaze direction, blink rate, and engagement levels during assessments
            </div>
          </div>
          <div style={styles.featureItem}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <strong>Motor Coordination Analysis:</strong> Assesses fine motor skills through hand tracking and gesture recognition
            </div>
          </div>
          <div style={styles.featureItem}>
            <CheckCircle size={24} color="#10b981" />
            <div>
              <strong>Multimodal Data Collection:</strong> Combines behavioral signals for comprehensive developmental profiling
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '40px 20px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  title: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#1e293b',
    marginTop: '20px',
    marginBottom: '12px'
  },
  subtitle: {
    fontSize: '18px',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto'
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1200px',
    margin: '0 auto 60px'
  },
  demoCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px'
  },
  cardDescription: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '24px',
    flex: 1
  },
  tryButton: {
    padding: '12px 32px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.3s ease'
  },
  backButton: {
    backgroundColor: '#64748b',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '24px'
  },
  demoContent: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  demoTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
    textAlign: 'center'
  },
  demoDescription: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '32px',
    textAlign: 'center'
  },
  resultsPanel: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  resultsTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#10b981',
    marginBottom: '16px'
  },
  infoSection: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  infoTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '32px',
    textAlign: 'center'
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  featureItem: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
    fontSize: '16px',
    color: '#475569',
    lineHeight: '1.6'
  }
};

export default MediaPipeDemo;
