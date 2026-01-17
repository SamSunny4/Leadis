'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Camera, 
  FileImage, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Sparkles,
  BookOpen,
  PenTool
} from 'lucide-react';
import { analyzeHandwritingAdvanced, getReadabilityLabel } from '@/utils/handwritingAnalyzer';
import { getUserData, saveUserData, initializeUserData } from '@/utils/userDataManager';

const colors = {
  primary: '#22c55e',
  primaryLight: '#86efac',
  primaryDark: '#16a34a',
  accent: '#fbbf24',
  dark: '#1e293b',
  gray: '#64748b',
  lightBg: '#f0fdf4',
  white: '#ffffff',
};

/**
 * NotebookUploadModal - Modal for uploading and analyzing notebook images
 * Appears after consent, before starting the assessment
 */
export default function NotebookUploadModal({ 
  isOpen, 
  onClose, 
  onComplete,
  onSkip 
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelected(droppedFile);
    }
  }, []);

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setAnalysisResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelected(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(0);

    try {
      // Use advanced analysis
      const result = await analyzeHandwritingAdvanced(file, (progress) => {
        setAnalysisProgress(progress);
      });

      setAnalysisResult(result);
      
      // Save results to user data
      saveNotebookAnalysisToUserData(result);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze the notebook image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveNotebookAnalysisToUserData = (result) => {
    const userData = getUserData() || initializeUserData();
    
    // Store notebook analysis data
    userData.notebookAnalysis = {
      timestamp: new Date().toISOString(),
      readabilityScore: result.readabilityScore,
      confidence: result.confidence,
      wordCount: result.wordCount,
      lineCount: result.lineCount,
      metrics: result.metrics,
      dysgraphiaIndicators: result.dysgraphiaIndicators || {},
      findings: result.findings,
    };
    
    // Update risk assessment based on notebook analysis
    if (result.dysgraphiaIndicators) {
      const indicators = result.dysgraphiaIndicators;
      
      // Map notebook findings to risk scores
      if (indicators.writingRisk !== undefined) {
        userData.riskAssessment.risk_writing = Math.max(
          userData.riskAssessment.risk_writing || 0,
          indicators.writingRisk
        );
      }
      
      if (indicators.motorCoordinationRisk !== undefined) {
        userData.riskAssessment.risk_motor_coordination = Math.max(
          userData.riskAssessment.risk_motor_coordination || 0,
          indicators.motorCoordinationRisk
        );
      }
      
      if (indicators.visualProcessingRisk !== undefined) {
        userData.riskAssessment.risk_visual_processing = Math.max(
          userData.riskAssessment.risk_visual_processing || 0,
          indicators.visualProcessingRisk
        );
      }
    }
    
    saveUserData(userData);
    console.log('📝 Notebook analysis saved to user data:', result);
  };

  const handleComplete = () => {
    onComplete(analysisResult);
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
    setError(null);
    setAnalysisProgress(0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={styles.overlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          style={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerIcon}>
              <BookOpen size={28} color={colors.primary} />
            </div>
            <div>
              <h2 style={styles.title}>Upload Notebook Page</h2>
              <p style={styles.subtitle}>
                Optional: Improve assessment accuracy with handwriting analysis
              </p>
            </div>
            <button onClick={onClose} style={styles.closeButton}>
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div style={styles.content}>
            {!analysisResult ? (
              <>
                {/* Benefits Info */}
                <div style={styles.benefitsBox}>
                  <Sparkles size={20} color={colors.accent} />
                  <p style={styles.benefitsText}>
                    Uploading a sample of your child's handwriting helps us provide more accurate insights about fine motor skills and potential writing challenges.
                  </p>
                </div>

                {/* Upload Area */}
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      ...styles.uploadZone,
                      borderColor: isDragging ? colors.primary : '#cbd5e1',
                      backgroundColor: isDragging ? colors.lightBg : '#f8fafc',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                    <div style={styles.uploadIcon}>
                      <Upload size={40} color={colors.primary} />
                    </div>
                    <h3 style={styles.uploadTitle}>
                      Drop an image here or click to upload
                    </h3>
                    <p style={styles.uploadSubtitle}>
                      JPG, PNG or HEIC - Max 10MB
                    </p>
                    <div style={styles.uploadButtons}>
                      <button style={styles.uploadButton}>
                        <FileImage size={18} />
                        Choose File
                      </button>
                      <button style={styles.cameraButton}>
                        <Camera size={18} />
                        Take Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.previewContainer}>
                    <img src={preview} alt="Notebook preview" style={styles.previewImage} />
                    {!isAnalyzing && (
                      <button onClick={handleReset} style={styles.changeButton}>
                        Change Image
                      </button>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div style={styles.errorBox}>
                    <AlertCircle size={20} color="#ef4444" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Progress Bar */}
                {isAnalyzing && (
                  <div style={styles.progressContainer}>
                    <div style={styles.progressBar}>
                      <motion.div
                        style={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                    <p style={styles.progressText}>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Analyzing handwriting patterns... {Math.round(analysisProgress)}%
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={styles.actions}>
                  <button onClick={handleSkip} style={styles.skipButton}>
                    Skip for now
                  </button>
                  {file && !isAnalyzing && (
                    <button onClick={handleAnalyze} style={styles.analyzeButton}>
                      <PenTool size={18} />
                      Analyze Handwriting
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Results View */
              <div style={styles.resultsContainer}>
                <div style={styles.resultHeader}>
                  <CheckCircle size={48} color={colors.primary} />
                  <h3 style={styles.resultTitle}>Analysis Complete!</h3>
                </div>

                {/* Score Card */}
                <div style={styles.scoreCard}>
                  <div style={styles.scoreCircle}>
                    <span style={styles.scoreValue}>
                      {Math.round(analysisResult.readabilityScore * 100)}
                    </span>
                    <span style={styles.scoreLabel}>/ 100</span>
                  </div>
                  <div style={styles.scoreInfo}>
                    <span style={{
                      ...styles.scoreLevel,
                      color: getReadabilityLabel(analysisResult.readabilityScore).color
                    }}>
                      {getReadabilityLabel(analysisResult.readabilityScore).label}
                    </span>
                    <span style={styles.scoreDescription}>Readability Score</span>
                  </div>
                </div>

                {/* Findings */}
                <div style={styles.findingsBox}>
                  <h4 style={styles.findingsTitle}>Key Findings</h4>
                  {analysisResult.findings?.slice(0, 4).map((finding, index) => (
                    <div key={index} style={styles.findingItem}>
                      <div style={{
                        ...styles.findingIcon,
                        backgroundColor: finding.type === 'positive' ? '#dcfce7' :
                                        finding.type === 'warning' ? '#fef3c7' :
                                        finding.type === 'concern' ? '#fee2e2' : '#e0e7ff'
                      }}>
                        {finding.type === 'positive' && <CheckCircle size={14} color="#22c55e" />}
                        {finding.type === 'warning' && <AlertCircle size={14} color="#f59e0b" />}
                        {finding.type === 'concern' && <AlertCircle size={14} color="#ef4444" />}
                        {finding.type === 'info' && <Sparkles size={14} color="#6366f1" />}
                      </div>
                      <span style={styles.findingText}>{finding.message}</span>
                    </div>
                  ))}
                </div>

                {/* Dysgraphia Indicators if present */}
                {analysisResult.dysgraphiaIndicators && (
                  <div style={styles.indicatorsBox}>
                    <h4 style={styles.indicatorsTitle}>Assessment Insights</h4>
                    <div style={styles.indicatorGrid}>
                      {analysisResult.dysgraphiaIndicators.letterFormation !== undefined && (
                        <div style={styles.indicatorItem}>
                          <span style={styles.indicatorLabel}>Letter Formation</span>
                          <span style={{
                            ...styles.indicatorValue,
                            color: analysisResult.dysgraphiaIndicators.letterFormation > 0.6 ? '#22c55e' : 
                                   analysisResult.dysgraphiaIndicators.letterFormation > 0.4 ? '#f59e0b' : '#ef4444'
                          }}>
                            {Math.round(analysisResult.dysgraphiaIndicators.letterFormation * 100)}%
                          </span>
                        </div>
                      )}
                      {analysisResult.dysgraphiaIndicators.lineAlignment !== undefined && (
                        <div style={styles.indicatorItem}>
                          <span style={styles.indicatorLabel}>Line Alignment</span>
                          <span style={{
                            ...styles.indicatorValue,
                            color: analysisResult.dysgraphiaIndicators.lineAlignment > 0.6 ? '#22c55e' : 
                                   analysisResult.dysgraphiaIndicators.lineAlignment > 0.4 ? '#f59e0b' : '#ef4444'
                          }}>
                            {Math.round(analysisResult.dysgraphiaIndicators.lineAlignment * 100)}%
                          </span>
                        </div>
                      )}
                      {analysisResult.dysgraphiaIndicators.spacing !== undefined && (
                        <div style={styles.indicatorItem}>
                          <span style={styles.indicatorLabel}>Spacing</span>
                          <span style={{
                            ...styles.indicatorValue,
                            color: analysisResult.dysgraphiaIndicators.spacing > 0.6 ? '#22c55e' : 
                                   analysisResult.dysgraphiaIndicators.spacing > 0.4 ? '#f59e0b' : '#ef4444'
                          }}>
                            {Math.round(analysisResult.dysgraphiaIndicators.spacing * 100)}%
                          </span>
                        </div>
                      )}
                      {analysisResult.dysgraphiaIndicators.consistency !== undefined && (
                        <div style={styles.indicatorItem}>
                          <span style={styles.indicatorLabel}>Consistency</span>
                          <span style={{
                            ...styles.indicatorValue,
                            color: analysisResult.dysgraphiaIndicators.consistency > 0.6 ? '#22c55e' : 
                                   analysisResult.dysgraphiaIndicators.consistency > 0.4 ? '#f59e0b' : '#ef4444'
                          }}>
                            {Math.round(analysisResult.dysgraphiaIndicators.consistency * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p style={styles.savedNote}>
                  ✓ Results saved and will be included in the assessment
                </p>

                <button onClick={handleComplete} style={styles.continueButton}>
                  Continue to Assessment
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: '24px',
    width: '100%',
    maxWidth: '580px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '24px 24px 0',
    position: 'relative',
  },
  headerIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: colors.lightBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: colors.dark,
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: colors.gray,
    margin: '4px 0 0',
  },
  closeButton: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: colors.gray,
    cursor: 'pointer',
    padding: '4px',
  },
  content: {
    padding: '24px',
  },
  benefitsBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fffbeb',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  benefitsText: {
    fontSize: '14px',
    color: '#92400e',
    margin: 0,
    lineHeight: 1.5,
  },
  uploadZone: {
    border: '3px dashed #cbd5e1',
    borderRadius: '16px',
    padding: '40px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  uploadIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: colors.lightBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  uploadTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.dark,
    margin: '0 0 8px',
  },
  uploadSubtitle: {
    fontSize: '14px',
    color: colors.gray,
    margin: '0 0 20px',
  },
  uploadButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  uploadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  cameraButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: colors.white,
    color: colors.dark,
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  previewImage: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
  },
  changeButton: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: colors.dark,
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    marginTop: '16px',
    color: '#991b1b',
    fontSize: '14px',
  },
  progressContainer: {
    marginTop: '20px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: '4px',
  },
  progressText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    marginTop: '12px',
    fontSize: '14px',
    color: colors.gray,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0',
  },
  skipButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: colors.gray,
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  analyzeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
  },
  resultsContainer: {
    textAlign: 'center',
  },
  resultHeader: {
    marginBottom: '24px',
  },
  resultTitle: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.dark,
    margin: '12px 0 0',
  },
  scoreCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    padding: '24px',
    backgroundColor: colors.lightBg,
    borderRadius: '16px',
    marginBottom: '20px',
  },
  scoreCircle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  },
  scoreValue: {
    fontSize: '48px',
    fontWeight: 800,
    color: colors.primary,
  },
  scoreLabel: {
    fontSize: '20px',
    color: colors.gray,
  },
  scoreInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
  },
  scoreLevel: {
    fontSize: '18px',
    fontWeight: 700,
  },
  scoreDescription: {
    fontSize: '14px',
    color: colors.gray,
  },
  findingsBox: {
    textAlign: 'left',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  findingsTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: colors.dark,
    margin: '0 0 12px',
  },
  findingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  findingIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  findingText: {
    fontSize: '14px',
    color: colors.dark,
    lineHeight: 1.4,
  },
  indicatorsBox: {
    textAlign: 'left',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  indicatorsTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: colors.dark,
    margin: '0 0 16px',
  },
  indicatorGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  indicatorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: colors.white,
    borderRadius: '8px',
  },
  indicatorLabel: {
    fontSize: '13px',
    color: colors.gray,
  },
  indicatorValue: {
    fontSize: '16px',
    fontWeight: 700,
  },
  savedNote: {
    fontSize: '14px',
    color: colors.primary,
    margin: '16px 0 20px',
  },
  continueButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 32px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
  },
};
