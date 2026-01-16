'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight, Camera } from 'lucide-react';
import Link from 'next/link';
import { colors, quizStyles } from '../quiz/styles/quizStyles';

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

    const handleAnalyze = () => {
        if (!file) return;
        setAnalyzing(true);
        // Mock analysis delay
        setTimeout(() => {
            setAnalyzing(false);
            setAnalysisComplete(true);
        }, 3000);
    };

    return (
        <div style={quizStyles.container}>
            <FloatingShapes />

            {/* Header */}
            <header style={quizStyles.header}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={quizStyles.logo}>
                        <div style={quizStyles.logoIcon}>L</div>
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
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    Analyze Handwriting
                                    <ArrowRight size={24} />
                                </>
                            )}
                        </button>
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
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            backgroundColor: '#dcfce7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                        }}>
                            <CheckCircle size={60} color={colors.primary} />
                        </div>
                        <h2 style={{ fontSize: '32px', fontWeight: 800, color: colors.dark, marginBottom: '16px' }}>
                            Analysis Complete!
                        </h2>
                        <p style={{ fontSize: '18px', color: colors.gray, marginBottom: '32px' }}>
                            We've successfully processed your notebook page.
                        </p>
                        <div style={{
                            padding: '24px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '16px',
                            border: `2px solid ${colors.primaryLight}`,
                            marginBottom: '32px',
                            textAlign: 'left',
                        }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: colors.dark, marginBottom: '12px' }}>
                                Initial Findings:
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.dark }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.primary }} />
                                    Consistent letter spacing detected
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: colors.dark }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.primary }} />
                                    Good line alignment
                                </li>
                            </ul>
                        </div>
                        <button
                            onClick={() => {
                                setFile(null);
                                setAnalysisComplete(false);
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
                            }}
                        >
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
