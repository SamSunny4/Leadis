'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    BarChart3,
    Brain,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Download,
    BookOpen,
    Lightbulb,
    Target,
    Loader2,
    Sparkles,
    Star,
    Puzzle,
    Music,
    Palette,
    Home,
    RefreshCw
} from 'lucide-react';
import { colors } from '../quiz/styles/quizStyles';
import { analyzeRiskAssessment, getRiskLevelDescription } from '../../utils/geminiAnalysis';
import { getUserCredential, getFlaskSession } from '../../utils/flaskApiService';
import { getUserData } from '../../utils/userDataManager';
import { generatePDFReport } from '../../utils/reportGenerator';

// Fun accent colors matching home page
const accentColors = {
    pink: '#f472b6',
    blue: '#38bdf8',
    orange: '#fb923c',
    yellow: '#fbbf24',
};

// Floating decorative elements (matching home page)
const FloatingElements = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0
        }}>
            <motion.div
                animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '15%', left: '3%', opacity: 0.5 }}
            >
                <Puzzle size={40} color={accentColors.pink} />
            </motion.div>
            <motion.div
                animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '25%', right: '5%', opacity: 0.5 }}
            >
                <Star size={36} color={accentColors.yellow} />
            </motion.div>
            <motion.div
                animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                style={{ position: 'absolute', bottom: '30%', left: '2%', opacity: 0.5 }}
            >
                <Music size={32} color={accentColors.blue} />
            </motion.div>
            <motion.div
                animate={{ y: [0, 10, 0], rotate: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                style={{ position: 'absolute', bottom: '20%', right: '3%', opacity: 0.5 }}
            >
                <Palette size={38} color={accentColors.orange} />
            </motion.div>
        </div>
    );
};

// Mock Data for Prediction
const predictionData = {
    primaryPrediction: 'Dyslexia',
    confidence: 85,
    breakdown: [
        { name: 'Reading Skills', probability: 78, color: colors.primary },      // risk_reading
        { name: 'Writing & Spelling', probability: 65, color: colors.blue },     // risk_writing
        { name: 'Focus & Attention', probability: 82, color: colors.purple },    // risk_attention
        { name: 'Working Memory', probability: 70, color: colors.orange },       // risk_working_memory
        { name: 'Speaking & Expression', probability: 45, color: colors.pink },  // risk_expressive_language
        { name: 'Understanding Language', probability: 40, color: colors.cyan }, // risk_receptive_language
        { name: 'Visual Processing', probability: 55, color: colors.accent },    // risk_visual_processing
        { name: 'Motor Coordination', probability: 35, color: colors.red },      // risk_motor_coordination
    ],
    evaluation: `Based on the screening activities, we noticed some patterns that are often seen in children with Dyslexia. 
    
    Your child showed great creativity and problem-solving skills! However, they seemed to find phonological awareness tasks (rhyming, sound matching) a bit tricky. They also took a bit longer with rapid naming activities.
    
    Don't worry! This is just a screening, not a medical diagnosis. Many brilliant minds learn this way.`,
    recommendations: [
        "Try multi-sensory reading games (using sand, clay, or building blocks).",
        "Practice rhyming songs and nursery rhymes together.",
        "Use audiobooks to build vocabulary and love for stories.",
        "Consult with a learning specialist for a formal evaluation."
    ]
};

// Custom Progress Bar Component
const PredictionBar = ({ label, percentage, color, delay, description }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        style={styles.barContainer}
        title={description} // Show description on hover
    >
        <div style={styles.barHeader}>
            <span style={styles.barLabel}>{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...styles.barPercentage, color }}>{percentage}%</span>
                <span style={{ 
                    fontSize: '12px', 
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    backgroundColor: percentage < 30 ? '#dcfce7' : percentage < 60 ? '#fef3c7' : '#fee2e2',
                    color: percentage < 30 ? '#166534' : percentage < 60 ? '#92400e' : '#991b1b',
                }}>
                    {percentage < 30 ? 'Low' : percentage < 60 ? 'Moderate' : 'High'}
                </span>
            </div>
        </div>
        <div style={styles.barBackground}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                style={{ ...styles.barFill, backgroundColor: color }}
            />
        </div>
        {description && (
            <p style={{ 
                fontSize: '13px', 
                color: '#64748b', 
                marginTop: '6px',
                marginBottom: 0,
                lineHeight: 1.4
            }}>
                {description}
            </p>
        )}
    </motion.div>
);

export default function DashboardPage() {
    const [predictionData, setPredictionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [geminiAnalysis, setGeminiAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Handle PDF download
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await generatePDFReport({
                predictionData,
                geminiAnalysis,
                userData: getUserData()
            });
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    useEffect(() => {
        // Fetch prediction data from Flask or localStorage
        const fetchPredictionData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Get user credential
                const credential = getUserCredential();
                console.log('Fetching data for credential:', credential);
                
                // Try to fetch from Flask server first
                try {
                    const flaskResult = await getFlaskSession(credential);
                    
                    if (flaskResult.success && flaskResult.data.quiz_data?.prediction?.targets) {
                        console.log('✅ Fetched data from Flask:', flaskResult.data);
                        const prediction = flaskResult.data.quiz_data.prediction.targets;
                        processPredictionData(prediction);
                        return;
                    }
                } catch (flaskError) {
                    console.warn('Could not fetch from Flask, trying localStorage:', flaskError);
                }
                
                // Fallback to localStorage
                const userData = getUserData();
                if (userData && userData.riskAssessment) {
                    const risks = userData.riskAssessment;
                    // Check if we have any risk data
                    const hasRiskData = Object.values(risks).some(v => v !== null && v !== undefined);
                    
                    if (hasRiskData) {
                        console.log('✅ Using data from localStorage:', risks);
                        processPredictionData(risks);
                        return;
                    }
                }
                
                // No data available
                console.warn('No prediction data available');
                setPredictionData(null);
                
            } catch (err) {
                console.error('Error fetching prediction data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchPredictionData();
    }, []);
    
    // Process prediction data and format for display
    const processPredictionData = (prediction) => {
        console.log('Processing prediction data:', prediction);
        
        // Map the prediction to the breakdown format
        const breakdown = [
            { 
                name: 'Reading Skills', 
                probability: Math.round((prediction.risk_reading || 0) * 100), 
                color: colors.primary,
                description: 'Letter recognition, phonics, and reading fluency'
            },
            { 
                name: 'Writing & Spelling', 
                probability: Math.round((prediction.risk_writing || 0) * 100), 
                color: colors.blue,
                description: 'Handwriting, spelling, and written expression'
            },
            { 
                name: 'Focus & Attention', 
                probability: Math.round((prediction.risk_attention || 0) * 100), 
                color: colors.purple,
                description: 'Sustained attention and focus on tasks'
            },
            { 
                name: 'Working Memory', 
                probability: Math.round((prediction.risk_working_memory || 0) * 100), 
                color: colors.orange,
                description: 'Remembering and manipulating information'
            },
            { 
                name: 'Understanding Language', 
                probability: Math.round((prediction.risk_receptive_language || 0) * 100), 
                color: colors.cyan,
                description: 'Comprehending spoken and written language'
            },
            { 
                name: 'Visual Processing', 
                probability: Math.round((prediction.risk_visual_processing || 0) * 100), 
                color: colors.pink,
                description: 'Processing and interpreting visual information'
            },
            { 
                name: 'Motor Coordination', 
                probability: Math.round((prediction.risk_motor_coordination || 0) * 100), 
                color: colors.red,
                description: 'Fine and gross motor skills coordination'
            },
        ];

        // Calculate overall confidence (average of all risks)
        const riskValues = [
            prediction.risk_reading || 0,
            prediction.risk_writing || 0,
            prediction.risk_attention || 0,
            prediction.risk_working_memory || 0,
            prediction.risk_receptive_language || 0,
            prediction.risk_visual_processing || 0,
            prediction.risk_motor_coordination || 0,
        ].filter(v => v > 0); // Filter out zero values
        
        const avgRisk = riskValues.length > 0 
            ? riskValues.reduce((a, b) => a + b, 0) / riskValues.length 
            : 0;
        const confidence = Math.round(avgRisk * 100);

        // Determine primary prediction based on highest risk
        const riskNameMap = {
            'risk_reading': 'Dyslexia',
            'risk_writing': 'Dysgraphia',
            'risk_attention': 'ADHD',
            'risk_working_memory': 'Working Memory Difficulty',
            'risk_receptive_language': 'Language Processing Difficulty',
            'risk_visual_processing': 'Visual Processing Difficulty',
            'risk_motor_coordination': 'Dyspraxia',
        };
        
        // Find highest risk
        let highestRiskKey = 'risk_reading';
        let highestRiskValue = prediction.risk_reading || 0;
        
        Object.keys(prediction).forEach(key => {
            if (key.startsWith('risk_') && prediction[key] > highestRiskValue) {
                highestRiskKey = key;
                highestRiskValue = prediction[key];
            }
        });
        
        const primaryPrediction = riskNameMap[highestRiskKey] || 'Learning Difference';
        
        // Determine risk level
        const getRiskLevel = (confidence) => {
            if (confidence < 30) return 'Low Risk';
            if (confidence < 60) return 'Moderate Risk';
            return 'Elevated Risk';
        };
        
        const riskLevel = getRiskLevel(confidence);

        setPredictionData({
            primaryPrediction,
            confidence,
            riskLevel,
            breakdown
        });
        
        // Get AI analysis from Gemini
        getGeminiAnalysis(prediction);
    };
    
    // Get Gemini AI analysis
    const getGeminiAnalysis = async (prediction) => {
        setIsAnalyzing(true);
        try {
            const analysis = await analyzeRiskAssessment(prediction);
            if (analysis) {
                setGeminiAnalysis(analysis);
                console.log('✨ Gemini AI analysis:', analysis);
            }
        } catch (error) {
            console.error('Error getting Gemini analysis:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} color={colors.primary} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '18px', color: colors.gray, marginTop: '16px' }}>Loading your results...</p>
                    <p style={{ fontSize: '14px', color: colors.gray, marginTop: '8px' }}>Fetching data from server</p>
                </div>
                <style jsx global>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (!predictionData) {
        return (
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: colors.dark, marginBottom: '12px' }}>
                        No Assessment Data Available
                    </h2>
                    <p style={{ fontSize: '16px', color: colors.gray, marginBottom: '24px', lineHeight: 1.6 }}>
                        Complete the quiz to see your personalized learning assessment results.
                    </p>
                    <Link href="/quiz" style={styles.actionButton}>
                        Start Assessment
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '32px' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: colors.dark, marginBottom: '12px' }}>
                        Error Loading Results
                    </h2>
                    <p style={{ fontSize: '16px', color: colors.gray, marginBottom: '24px', lineHeight: 1.6 }}>
                        {error}
                    </p>
                    <Link href="/quiz" style={styles.actionButton}>
                        Retry Assessment
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
            <FloatingElements />
            
            {/* Header */}
            <header style={styles.header}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <motion.div 
                        style={styles.logo}
                        whileHover={{ scale: 1.02 }}
                    >
                        <img src="/logo.svg" alt="Leadis" style={{ width: '48px', height: '48px' }} />
                        <span style={styles.logoText}>Leadis</span>
                    </motion.div>
                </Link>
                <div style={styles.navLinks}>
                    <Link href="/" style={styles.navLink}>
                        <Home size={18} />
                        Home
                    </Link>
                    <Link href="/quiz" style={styles.navLink}>
                        <RefreshCw size={18} />
                        Retake Quiz
                    </Link>
                </div>
                <div style={styles.headerActions}>
                    <motion.button 
                        style={styles.primaryButton}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        disabled={isDownloading}
                    >
                        {isDownloading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                        {isDownloading ? 'Generating...' : 'Download Report'}
                    </motion.button>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={styles.dashboardGrid}>

                    {/* Left Column: Overview & Charts */}
                    <div style={styles.leftColumn}>

                        {/* AI Insights Overview Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ ...styles.card, background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '2px solid #60a5fa' }}
                        >
                            <div style={styles.cardHeader}>
                                <Sparkles size={28} color="#3b82f6" />
                                <h2 style={{ ...styles.cardTitle, fontSize: '24px' }}>AI-Powered Insights</h2>
                                {geminiAnalysis && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        backgroundColor: '#dbeafe',
                                        color: '#1e40af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        <Brain size={14} />
                                        AI Generated
                                    </span>
                                )}
                            </div>
                            <div style={styles.resultHighlight}>
                                <div style={{ ...styles.resultBadge, backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '15px', padding: '8px 20px' }}>
                                    🤖 AI Analysis Result
                                </div>
                                <h1 style={styles.resultTitle}>
                                    {geminiAnalysis?.primaryDiagnosis || (isAnalyzing ? 'Analyzing...' : predictionData.primaryPrediction)}
                                </h1>
                                {geminiAnalysis && (
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '10px 24px',
                                        backgroundColor: geminiAnalysis.confidence === 'High' ? '#dcfce7' : geminiAnalysis.confidence === 'Moderate' ? '#fef3c7' : '#fee2e2',
                                        color: geminiAnalysis.confidence === 'High' ? '#166534' : geminiAnalysis.confidence === 'Moderate' ? '#92400e' : '#991b1b',
                                        borderRadius: '20px',
                                        fontSize: '15px',
                                        fontWeight: 700,
                                        marginBottom: '16px',
                                    }}>
                                        ✨ {geminiAnalysis.confidence} Confidence
                                    </div>
                                )}
                                <p style={{ ...styles.resultSubtitle, fontSize: '17px', marginTop: '12px' }}>
                                    {geminiAnalysis 
                                        ? `Our advanced AI has analyzed your child's assessment and identified key patterns with ${geminiAnalysis.confidence.toLowerCase()} confidence.`
                                        : isAnalyzing 
                                        ? 'Our AI is currently analyzing your assessment data to provide personalized insights...'
                                        : 'Please wait while our AI generates insights from your assessment data.'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Detailed Breakdown Chart - kept for reference data - kept for reference data */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ ...styles.card, opacity: 0.9 }}
                        >
                            <div style={styles.cardHeader}>
                                <BarChart3 size={24} color={colors.blue} />
                                <h2 style={styles.cardTitle}>Assessment Data Reference</h2>
                                <span style={{
                                    marginLeft: 'auto',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    backgroundColor: '#f1f5f9',
                                    color: '#64748b'
                                }}>
                                    Raw Scores
                                </span>
                            </div>
                            <div style={styles.chartContainer}>
                                {predictionData.breakdown.map((item, index) => (
                                    <PredictionBar
                                        key={item.name}
                                        label={item.name}
                                        percentage={item.probability}
                                        color={item.color}
                                        delay={0.3 + (index * 0.1)}
                                        description={item.description}
                                    />
                                ))}
                            </div>
                        </motion.div>

                    </div>

                    {/* Right Column: AI Summary & Next Steps */}
                    <div style={styles.rightColumn}>

                        {/* AI Personalized Report */}
                        {geminiAnalysis ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                style={{ ...styles.card, height: 'fit-content', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '3px solid #60a5fa', boxShadow: '0 15px 50px rgba(59, 130, 246, 0.15)' }}
                            >
                                <div style={styles.cardHeader}>
                                    <Sparkles size={26} color="#3b82f6" />
                                    <h2 style={{ ...styles.cardTitle, fontSize: '22px' }}>📋 AI Personalized Report</h2>
                                </div>
                                <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '16px', border: '2px solid #e0e7ff', marginBottom: '20px' }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.dark, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Brain size={20} color="#3b82f6" />
                                            AI Diagnosis: {geminiAnalysis.primaryDiagnosis}
                                        </h3>
                                        <p style={{ fontSize: '16px', color: colors.dark, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                                            {geminiAnalysis.analysis}
                                        </p>
                                    </div>
                                    
                                    {geminiAnalysis.keyFindings && geminiAnalysis.keyFindings.length > 0 && (
                                        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 700, color: colors.dark, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Target size={16} color="#3b82f6" />
                                                Critical Insights:
                                            </h4>
                                            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {geminiAnalysis.keyFindings.map((finding, idx) => (
                                                    <li key={idx} style={{ fontSize: '15px', color: colors.dark, lineHeight: 1.7, fontWeight: 500 }}>
                                                        {finding}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    
                                    {geminiAnalysis.recommendations && geminiAnalysis.recommendations.length > 0 && (
                                        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                            <h4 style={{ fontSize: '16px', fontWeight: 700, color: colors.dark, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Lightbulb size={16} color={colors.primary} />
                                                Recommended Actions:
                                            </h4>
                                            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {geminiAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                                                    <li key={idx} style={{ fontSize: '14px', color: colors.dark, lineHeight: 1.6, fontWeight: 500 }}>
                                                        {rec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <motion.button 
                                    style={{ ...styles.actionButton, marginTop: '0' }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Find Specialists Near You
                                    <ArrowRight size={18} />
                                </motion.button>
                            </motion.div>
                        ) : isAnalyzing ? (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                style={{ ...styles.card, height: 'fit-content', background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '3px solid #60a5fa' }}
                            >
                                <div style={styles.cardHeader}>
                                    <Brain size={26} color="#3b82f6" style={{ animation: 'pulse 2s infinite' }} />
                                    <h2 style={{ ...styles.cardTitle, fontSize: '22px' }}>🤖 AI Generating Report...</h2>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <Loader2 size={28} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                                        <div>
                                            <div style={{ fontWeight: 700, color: colors.dark, fontSize: '16px' }}>Processing your assessment...</div>
                                            <div style={{ color: colors.gray, fontSize: '14px' }}>Creating personalized insights</div>
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', backgroundColor: '#fff', borderRadius: '12px', fontSize: '14px', color: colors.gray, lineHeight: 1.6 }}>
                                        Our advanced AI is analyzing patterns, strengths, and development areas to create your personalized report.
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}

                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 50%, #f8fafc 100%)',
        fontFamily: 'var(--font-nunito), sans-serif',
        position: 'relative',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid #f0fdf4',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
    },
    logoText: {
        fontSize: '26px',
        fontWeight: 700,
        color: colors.dark,
        fontFamily: 'var(--font-fredoka), sans-serif',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: colors.gray,
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: 600,
        padding: '8px 16px',
        borderRadius: '20px',
        transition: 'all 0.2s',
    },
    headerActions: {
        display: 'flex',
        gap: '12px',
    },
    primaryButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: colors.primary,
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
        fontSize: '14px',
    },
    secondaryButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'white',
        color: colors.gray,
        border: '2px solid #e2e8f0',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '14px',
    },
    mainContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        position: 'relative',
        zIndex: 10,
    },
    dashboardGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '32px',
        alignItems: 'start',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: '28px',
        padding: '32px',
        boxShadow: '0 10px 40px rgba(34, 197, 94, 0.08)',
        border: '2px solid #f0fdf4',
        transition: 'all 0.3s ease',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: 700,
        color: colors.dark,
        margin: 0,
    },
    resultHighlight: {
        textAlign: 'center',
        padding: '20px',
    },
    resultBadge: {
        display: 'inline-block',
        padding: '6px 16px',
        backgroundColor: '#e0f2fe',
        color: '#0284c7',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '16px',
    },
    resultTitle: {
        fontSize: '48px',
        fontWeight: 800,
        color: colors.dark,
        marginBottom: '16px',
        fontFamily: 'var(--font-fredoka), sans-serif',
        background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.gray} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    resultSubtitle: {
        fontSize: '18px',
        color: colors.gray,
        lineHeight: 1.6,
    },
    chartContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    barContainer: {
        width: '100%',
    },
    barHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    barLabel: {
        fontSize: '16px',
        fontWeight: 600,
        color: colors.dark,
    },
    barPercentage: {
        fontSize: '16px',
        fontWeight: 700,
    },
    barBackground: {
        width: '100%',
        height: '12px',
        backgroundColor: '#f1f5f9',
        borderRadius: '6px',
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: '6px',
    },
    reportContent: {
        backgroundColor: '#f8fafc',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
    },
    reportText: {
        fontSize: '16px',
        color: colors.dark,
        lineHeight: 1.8,
        whiteSpace: 'pre-line',
    },
    recommendationList: {
        listStyle: 'none',
        padding: 0,
        margin: '0 0 24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    recommendationItem: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        fontSize: '16px',
        color: colors.dark,
        lineHeight: 1.5,
    },
    actionButton: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        backgroundColor: colors.primary,
        color: 'white',
        border: 'none',
        padding: '18px',
        borderRadius: '50px',
        fontSize: '17px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)',
    },
};
