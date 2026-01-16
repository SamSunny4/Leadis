'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, ArrowRight, Trophy, Volume2, Play, RotateCcw } from 'lucide-react';
import { colors } from '../../styles/quizStyles';
import AuditoryDiscriminationTest from './AuditoryDiscriminationTest';
import AuditoryMemoryTest from './AuditoryMemoryTest';
import WordRecognitionTest from './WordRecognitionTest';

/**
 * APD Test Container
 * Orchestrates Auditory Processing Disorder screening tests
 * Simplified to 3 core tests: Discrimination, Memory, and Word Recognition
 * Matches the minigame component theme
 */

const APD_TESTS = [
    {
        id: 'discrimination',
        name: 'Sound Discrimination',
        description: 'Can you tell the difference between similar sounds?',
        icon: '👂',
        component: AuditoryDiscriminationTest,
    },
    {
        id: 'memory',
        name: 'Auditory Memory',
        description: 'Listen and remember what you heard.',
        icon: '🧠',
        component: AuditoryMemoryTest,
    },
    {
        id: 'words',
        name: 'Word Recognition',
        description: 'Identify words in different conditions.',
        icon: '💬',
        component: WordRecognitionTest,
    },
];

const containerStyles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        width: '100%',
        maxWidth: '500px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 16px',
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '18px',
        fontWeight: 700,
        color: colors.primary,
    },
    progress: {
        fontSize: '18px',
        fontWeight: 700,
        color: colors.dark,
        backgroundColor: colors.lightBg,
        padding: '4px 16px',
        borderRadius: '20px',
    },
    gameCard: {
        width: '100%',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)',
        border: `4px solid ${colors.white}`,
    },
    startScreen: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
    },
    startIcon: {
        fontSize: '64px',
        marginBottom: '16px',
    },
    startTitle: {
        fontSize: '24px',
        fontWeight: 700,
        color: colors.dark,
        marginBottom: '8px',
    },
    startDescription: {
        fontSize: '16px',
        color: colors.gray,
        marginBottom: '24px',
    },
    headphoneWarning: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '2px solid #f59e0b',
        fontSize: '14px',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '16px 32px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        fontSize: '18px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
    },
    successScreen: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
    },
    successIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4)',
    },
    scoreText: {
        fontSize: '48px',
        fontWeight: 700,
        marginBottom: '8px',
    },
    resultItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        padding: '12px 16px',
        background: 'white',
        borderRadius: '12px',
        marginBottom: '8px',
    },
    progressBar: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        justifyContent: 'center',
    },
    progressDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        transition: 'all 0.3s ease',
    },
};

export default function APDTestContainer({ onComplete, testType = null }) {
    // If testType is provided, run only that specific test
    const testsToRun = testType 
        ? APD_TESTS.filter(t => t.id === testType)
        : APD_TESTS;

    const [gameState, setGameState] = useState('idle'); // idle, playing, success
    const [currentTestIndex, setCurrentTestIndex] = useState(0);
    const [testResults, setTestResults] = useState({});

    const currentTest = testsToRun[currentTestIndex];

    const handleTestComplete = useCallback((result) => {
        setTestResults(prev => ({
            ...prev,
            [currentTest.id]: result,
        }));
        
        // Move to next test or show results
        if (currentTestIndex < testsToRun.length - 1) {
            setCurrentTestIndex(prev => prev + 1);
            setGameState('idle');
        } else {
            setGameState('success');
        }
    }, [currentTestIndex, currentTest, testsToRun.length]);

    const startTest = () => {
        setGameState('playing');
    };

    const calculateOverallScore = () => {
        const scores = Object.values(testResults);
        if (scores.length === 0) return 0;
        const total = scores.reduce((sum, r) => sum + (r.score || 0), 0);
        return Math.round(total / scores.length);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return colors.primary;
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const handleComplete = () => {
        const overallScore = calculateOverallScore();
        onComplete?.({ 
            score: overallScore, 
            results: testResults,
            testsCompleted: testsToRun.length 
        });
    };

    const handleRestart = () => {
        setGameState('idle');
        setCurrentTestIndex(0);
        setTestResults({});
    };

    // Idle state - show start screen for current test
    if (gameState === 'idle') {
        return (
            <div style={containerStyles.wrapper}>
                {/* Header */}
                <div style={containerStyles.header}>
                    <div style={containerStyles.title}>
                        <Headphones size={20} />
                        Listening Test
                    </div>
                    <div style={containerStyles.progress}>
                        {currentTestIndex + 1}/{testsToRun.length}
                    </div>
                </div>

                {/* Game Card */}
                <div style={containerStyles.gameCard}>
                    {/* Progress dots */}
                    <div style={containerStyles.progressBar}>
                        {testsToRun.map((test, index) => (
                            <div
                                key={test.id}
                                style={{
                                    ...containerStyles.progressDot,
                                    backgroundColor: index < currentTestIndex 
                                        ? colors.primary 
                                        : index === currentTestIndex 
                                            ? colors.primaryLight 
                                            : '#cbd5e1',
                                    transform: index === currentTestIndex ? 'scale(1.3)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>

                    <div style={containerStyles.startScreen}>
                        <div style={containerStyles.startIcon}>{currentTest.icon}</div>
                        <h2 style={containerStyles.startTitle}>{currentTest.name}</h2>
                        <p style={containerStyles.startDescription}>{currentTest.description}</p>

                        {currentTestIndex === 0 && (
                            <div style={containerStyles.headphoneWarning}>
                                <Volume2 size={24} color="#f59e0b" />
                                <span style={{ color: '#92400e' }}>Use headphones for best results</span>
                            </div>
                        )}

                        <motion.button
                            onClick={startTest}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            style={containerStyles.button}
                        >
                            <Play size={24} fill="white" />
                            Start
                        </motion.button>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (gameState === 'success') {
        const overallScore = calculateOverallScore();
        return (
            <div style={containerStyles.wrapper}>
                <div style={containerStyles.header}>
                    <div style={containerStyles.title}>
                        <Trophy size={20} color="#f59e0b" />
                        Test Complete!
                    </div>
                </div>

                <div style={containerStyles.gameCard}>
                    <div style={containerStyles.successScreen}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            style={containerStyles.successIcon}
                        >
                            <Trophy size={48} color="white" />
                        </motion.div>

                        <div style={{
                            ...containerStyles.scoreText,
                            color: getScoreColor(overallScore),
                        }}>
                            {overallScore}%
                        </div>
                        <p style={{ color: colors.gray, marginBottom: '24px' }}>
                            {overallScore >= 80 ? 'Excellent work!' : 
                             overallScore >= 60 ? 'Good effort!' : 'Keep practicing!'}
                        </p>

                        {/* Individual test results */}
                        {testsToRun.map((test) => {
                            const result = testResults[test.id];
                            const score = result?.score || 0;
                            return (
                                <div key={test.id} style={containerStyles.resultItem}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{test.icon}</span>
                                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{test.name}</span>
                                    </div>
                                    <span style={{
                                        fontWeight: 700,
                                        color: getScoreColor(score),
                                    }}>
                                        {score}%
                                    </span>
                                </div>
                            );
                        })}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <motion.button
                                onClick={handleRestart}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    ...containerStyles.button,
                                    background: 'white',
                                    color: colors.primary,
                                    border: `2px solid ${colors.primary}`,
                                    boxShadow: 'none',
                                }}
                            >
                                <RotateCcw size={20} />
                                Retry
                            </motion.button>
                            <motion.button
                                onClick={handleComplete}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={containerStyles.button}
                            >
                                Continue
                                <ArrowRight size={20} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Playing state - render current test component
    const TestComponent = currentTest.component;

    return (
        <div style={containerStyles.wrapper}>
            <div style={containerStyles.header}>
                <div style={containerStyles.title}>
                    <span style={{ fontSize: '20px' }}>{currentTest.icon}</span>
                    {currentTest.name}
                </div>
                <div style={containerStyles.progress}>
                    {currentTestIndex + 1}/{testsToRun.length}
                </div>
            </div>

            <div style={containerStyles.gameCard}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentTest.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <TestComponent onComplete={handleTestComplete} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
