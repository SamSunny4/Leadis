'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    BarChart3,
    Brain,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Download,
    Share2,
    BookOpen,
    Lightbulb,
    Target
} from 'lucide-react';
import { colors } from '../quiz/styles/quizStyles';

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
const PredictionBar = ({ label, percentage, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay }}
        style={styles.barContainer}
    >
        <div style={styles.barHeader}>
            <span style={styles.barLabel}>{label}</span>
            <span style={{ ...styles.barPercentage, color }}>{percentage}%</span>
        </div>
        <div style={styles.barBackground}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: delay + 0.2, ease: "easeOut" }}
                style={{ ...styles.barFill, backgroundColor: color }}
            />
        </div>
    </motion.div>
);

export default function DashboardPage() {
    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>L</div>
                        <span style={styles.logoText}>Leadis</span>
                    </div>
                </Link>
                <div style={styles.headerActions}>
                    <button style={styles.secondaryButton}>
                        <Share2 size={18} />
                        Share
                    </button>
                    <button style={styles.primaryButton}>
                        <Download size={18} />
                        Download Report
                    </button>
                </div>
            </header>

            <main style={styles.mainContent}>
                <div style={styles.dashboardGrid}>

                    {/* Left Column: Overview & Charts */}
                    <div style={styles.leftColumn}>

                        {/* Result Overview Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={styles.card}
                        >
                            <div style={styles.cardHeader}>
                                <Brain size={24} color={colors.primary} />
                                <h2 style={styles.cardTitle}>Screening Result</h2>
                            </div>
                            <div style={styles.resultHighlight}>
                                <div style={styles.resultBadge}>
                                    Likely Pattern:
                                </div>
                                <h1 style={styles.resultTitle}>{predictionData.primaryPrediction}</h1>
                                <p style={styles.resultSubtitle}>
                                    Our AI model detected patterns consistent with {predictionData.primaryPrediction} with
                                    <span style={{ fontWeight: 700, color: colors.primary }}> {predictionData.confidence}% confidence</span>.
                                </p>
                            </div>
                        </motion.div>

                        {/* Detailed Breakdown Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={styles.card}
                        >
                            <div style={styles.cardHeader}>
                                <BarChart3 size={24} color={colors.blue} />
                                <h2 style={styles.cardTitle}>Skill Breakdown</h2>
                            </div>
                            <div style={styles.chartContainer}>
                                {predictionData.breakdown.map((item, index) => (
                                    <PredictionBar
                                        key={item.name}
                                        label={item.name}
                                        percentage={item.probability}
                                        color={item.color}
                                        delay={0.3 + (index * 0.1)}
                                    />
                                ))}
                            </div>
                        </motion.div>

                    </div>

                    {/* Right Column: Evaluation & Next Steps */}
                    <div style={styles.rightColumn}>

                        {/* Evaluation Window */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{ ...styles.card, height: 'fit-content' }}
                        >
                            <div style={styles.cardHeader}>
                                <BookOpen size={24} color={colors.purple} />
                                <h2 style={styles.cardTitle}>Evaluation Report</h2>
                            </div>
                            <div style={styles.reportContent}>
                                <p style={styles.reportText}>
                                    {predictionData.evaluation}
                                </p>
                            </div>
                        </motion.div>

                        {/* Recommendations */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            style={{ ...styles.card, backgroundColor: '#f0fdf4', border: `2px solid ${colors.primaryLight}` }}
                        >
                            <div style={styles.cardHeader}>
                                <Lightbulb size={24} color={colors.primaryDark} />
                                <h2 style={{ ...styles.cardTitle, color: colors.primaryDark }}>Recommended Next Steps</h2>
                            </div>
                            <ul style={styles.recommendationList}>
                                {predictionData.recommendations.map((rec, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.8 + (index * 0.1) }}
                                        style={styles.recommendationItem}
                                    >
                                        <CheckCircle size={20} color={colors.primary} style={{ flexShrink: 0 }} />
                                        <span>{rec}</span>
                                    </motion.li>
                                ))}
                            </ul>
                            <button style={styles.actionButton}>
                                Find Specialists Near You
                                <ArrowRight size={18} />
                            </button>
                        </motion.div>

                    </div>
                </div>
            </main>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'var(--font-nunito), sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 40px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '20px',
    },
    logoText: {
        fontSize: '24px',
        fontWeight: 700,
        color: colors.dark,
        fontFamily: 'var(--font-fredoka), sans-serif',
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
        padding: '10px 20px',
        borderRadius: '50px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    secondaryButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'white',
        color: colors.gray,
        border: '1px solid #cbd5e1',
        padding: '10px 20px',
        borderRadius: '50px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    mainContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
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
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: '1px solid #f1f5f9',
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
        padding: '16px',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
    },
};
