'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Camera, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import Logo from '../components/Logo';
import { colors, quizStyles } from '../quiz/styles/quizStyles';
import { analyzeHandwriting, getReadabilityLabel } from '@/utils/handwritingAnalyzer';

// Reusing FloatingShapes from quiz page for consistency
const FloatingShapes = () => (
    <div style={quizStyles.floatingElements}>
        <div style={{ ...quizStyles.floatingShape, width: 60, height: 60, backgroundColor: colors.yellow, top: '10%', left: '5%', animationDelay: '0s' }} />
        <div style={{ ...quizStyles.floatingShape, width: 40, height: 40, backgroundColor: colors.pink, top: '20%', right: '10%', animationDelay: '1s' }} />
        <div style={{ ...quizStyles.floatingShape, width: 50, height: 50, backgroundColor: colors.purple, top: '60%', left: '8%', animationDelay: '2s' }} />
        <div style={{ ...quizStyles.floatingShape, width: 35, height: 35, backgroundColor: colors.blue, top: '75%', right: '5%', animationDelay: '0.5s' }} />
    </div>
);

export default function NotebookUploadPage() {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState({ status: '', progress: 0 });
    const [analysisResult, setAnalysisResult] = useState(null);
    const [analysisError, setAnalysisError] = useState(null);

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
            setFile(droppedFile);
        }
    }, []);

    const handleFileSelect = useCallback((e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    }, []);

    const handleAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);
        setAnalysisError(null);
        setAnalysisProgress({ status: 'Preparing analysis...', progress: 0 });
        
        try {
            const result = await analyzeHandwriting(file, setAnalysisProgress);
            setAnalysisResult(result);
            setAnalyzing(false);
            setAnalysisComplete(true);
        } catch (error) {
            console.error('Analysis error:', error);
            setAnalysisError(error.message || 'Failed to analyze handwriting. Please try again.');
            setAnalyzing(false);
        }
    };

    return (
        <div style={quizStyles.container}>
            <FloatingShapes />

            {/* Header */}
            <header style={quizStyles.header}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={quizStyles.logo}>
                        <div style={quizStyles.logoIcon}>
                            <Logo size={56} />
                        </div>
                        <span style={quizStyles.logoText}>Leadis</span>
                    </div>
                </Link>
            </header>

            <main style={{
                ...quizStyles.mainContent,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: '800px',
            }}>
                <div style={{
                    textAlign: 'center',
                    marginBottom: '40px',
                    position: 'relative',
                    zIndex: 10,
                }}>
                    <h1 style={{
                        fontSize: '42px',
                        fontWeight: 800,
                        color: colors.dark,
                        marginBottom: '16px',
                        fontFamily: 'var(--font-fredoka), sans-serif',
                    }}>

                        Handwriting Analysis for Dysgraphia Detection 
                    </h1>
                    <p style={{
                        fontSize: '20px',
                        color: colors.gray,
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                    }}>
Upload a photo of your child’s notebook page. Our system gently analyzes handwriting patterns to help identify signs that may be associated with dysgraphia or writing-related learning challenges.
                    </p>
                </div>

                {!analysisComplete ? (
                    <div style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '32px',
                        padding: '40px',
                        boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.1)',
                        border: '3px solid white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '32px',
                    }}>
                        {/* Upload Zone */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            style={{
                                width: '100%',
                                minHeight: '300px',
                                border: `4px dashed ${isDragging ? colors.primary : '#cbd5e1'}`,
                                borderRadius: '24px',
                                backgroundColor: isDragging ? colors.lightBg : '#f8fafc',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                position: 'relative',
                            }}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: 'pointer',
                                }}
                            />

                            {file ? (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '20px',
                                        backgroundColor: colors.primaryLight,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                    }}>
                                        <FileText size={40} color={colors.primaryDark} />
                                    </div>
                                    <p style={{ fontSize: '18px', fontWeight: 700, color: colors.dark }}>
                                        {file.name}
                                    </p>
                                    <p style={{ fontSize: '14px', color: colors.gray }}>
                                        Click or drag to replace
                                    </p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                    }}>
                                        <Camera size={48} color={colors.gray} />
                                    </div>
                                    <p style={{ fontSize: '20px', fontWeight: 700, color: colors.dark, marginBottom: '8px' }}>
                                        Drag & Drop or Click to Upload
                                    </p>
                                    <p style={{ fontSize: '16px', color: colors.gray }}>
                                        Supports JPG, PNG
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={!file || analyzing}
                            style={{
                                padding: '20px 48px',
                                background: !file
                                    ? '#e2e8f0'
                                    : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: !file ? colors.gray : 'white',
                                border: 'none',
                                borderRadius: '50px',
                                fontSize: '20px',
                                fontWeight: 700,
                                cursor: !file || analyzing ? 'not-allowed' : 'pointer',
                                boxShadow: !file ? 'none' : '0 8px 25px rgba(34, 197, 94, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all 0.3s',
                                transform: analyzing ? 'scale(0.98)' : 'scale(1)',
                            }}
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                        <span>{analysisProgress.status || 'Analyzing...'}</span>
                                        {analysisProgress.progress > 0 && (
                                            <span style={{ fontSize: '14px', opacity: 0.8 }}>
                                                {Math.round(analysisProgress.progress)}%
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    Analyze Handwriting
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </button>

                        {/* Error Display */}
                        {analysisError && (
                            <div style={{
                                padding: '16px 24px',
                                backgroundColor: '#fef2f2',
                                border: '2px solid #fecaca',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#dc2626',
                            }}>
                                <AlertCircle size={24} />
                                <span>{analysisError}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '32px',
                        padding: '50px',
                        textAlign: 'center',
                        boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.1)',
                        animation: 'popIn 0.5s ease-out',
                    }}>
                        {/* Readability Score Display */}
                        {analysisResult && (() => {
                            const labelInfo = getReadabilityLabel(analysisResult.readabilityScore);
                            return (
                                <>
                                    <div style={{
                                        width: '140px',
                                        height: '140px',
                                        borderRadius: '50%',
                                        background: `conic-gradient(${labelInfo.color} ${analysisResult.readabilityScore * 360}deg, #e2e8f0 0deg)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px',
                                        position: 'relative',
                                    }}>
                                        <div style={{
                                            width: '110px',
                                            height: '110px',
                                            borderRadius: '50%',
                                            backgroundColor: 'white',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <span style={{ fontSize: '36px', fontWeight: 800, color: labelInfo.color }}>
                                                {(analysisResult.readabilityScore * 100).toFixed(0)}%
                                            </span>
                                            <span style={{ fontSize: '12px', color: colors.gray, fontWeight: 600 }}>
                                                READABILITY
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <h2 style={{ fontSize: '28px', fontWeight: 800, color: colors.dark, marginBottom: '8px' }}>
                                        {labelInfo.label}
                                    </h2>
                                    <p style={{ fontSize: '16px', color: colors.gray, marginBottom: '24px' }}>
                                        Confidence: {(analysisResult.confidence * 100).toFixed(0)}% • 
                                        {analysisResult.wordCount} words detected • 
                                        {analysisResult.lineCount} lines
                                    </p>
                                </>
                            );
                        })()}

                        {/* Findings Section */}
                        <div style={{
                            padding: '24px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '16px',
                            border: `2px solid ${colors.primaryLight}`,
                            marginBottom: '24px',
                            textAlign: 'left',
                        }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: colors.dark, marginBottom: '16px' }}>
                                Analysis Findings:
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {analysisResult?.findings?.map((finding, index) => (
                                    <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: colors.dark }}>
                                        <div style={{ 
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            backgroundColor: finding.type === 'positive' ? colors.primary : 
                                                           finding.type === 'concern' ? '#f59e0b' : '#94a3b8',
                                            marginTop: '6px',
                                            flexShrink: 0,
                                        }} />
                                        <span>{finding.message}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Metrics Grid */}
                        {analysisResult?.metrics && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '16px',
                                marginBottom: '32px',
                            }}>
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: colors.primary }}>
                                        {(analysisResult.metrics.ocrConfidence * 100).toFixed(0)}%
                                    </div>
                                    <div style={{ fontSize: '12px', color: colors.gray, fontWeight: 600 }}>
                                        Text Clarity
                                    </div>
                                </div>
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: colors.primary }}>
                                        {(analysisResult.metrics.lineConsistency * 100).toFixed(0)}%
                                    </div>
                                    <div style={{ fontSize: '12px', color: colors.gray, fontWeight: 600 }}>
                                        Line Alignment
                                    </div>
                                </div>
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: colors.primary }}>
                                        {(analysisResult.metrics.textDensity * 100).toFixed(0)}%
                                    </div>
                                    <div style={{ fontSize: '12px', color: colors.gray, fontWeight: 600 }}>
                                        Text Density
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setFile(null);
                                setAnalysisComplete(false);
                                setAnalysisResult(null);
                                setAnalysisError(null);
                            }}
                            style={{
                                padding: '16px 32px',
                                backgroundColor: 'white',
                                border: `3px solid ${colors.primary}`,
                                color: colors.primary,
                                borderRadius: '50px',
                                fontSize: '18px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <RotateCcw size={20} />
                            Upload Another Page
                        </button>
                    </div>
                )}
            </main>
            <style jsx global>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
}
