'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Volume2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import AuditoryDiscriminationTest from './apd/AuditoryDiscriminationTest';
import AuditoryMemoryTest from './apd/AuditoryMemoryTest';
import WordRecognitionTest from './apd/WordRecognitionTest';
import { colors } from '../styles/quizStyles';

/**
 * APDQuizContent - Wrapper component for individual APD tests in quiz flow
 * Renders a specific APD test based on the question's apdTestType
 * Matches the minigame theme styling
 */

const APD_COMPONENTS = {
    discrimination: {
        component: AuditoryDiscriminationTest,
        title: 'Sound Discrimination',
        description: 'Can you tell the difference between similar sounds?',
        icon: '👂',
    },
    memory: {
        component: AuditoryMemoryTest,
        title: 'Auditory Memory',
        description: 'Listen and remember what you heard.',
        icon: '🧠',
    },
    words: {
        component: WordRecognitionTest,
        title: 'Word Recognition',
        description: 'Identify words in different conditions.',
        icon: '💬',
    },
};

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
    gameCard: {
        width: '100%',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '24px',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)',
        border: `4px solid ${colors.white}`,
    },
    headphoneWarning: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '12px',
        marginBottom: '16px',
        border: '2px solid #f59e0b',
        fontSize: '14px',
    },
    testHeader: {
        textAlign: 'center',
        marginBottom: '16px',
    },
    testIcon: {
        fontSize: '40px',
        marginBottom: '8px',
    },
    testTitle: {
        fontSize: '20px',
        fontWeight: 700,
        color: colors.dark,
        marginBottom: '4px',
    },
    testDescription: {
        fontSize: '14px',
        color: colors.gray,
    },
    navigationButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '24px',
        gap: '16px',
    },
    navButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        borderRadius: '50px',
        border: `2px solid ${colors.primaryLight}`,
        backgroundColor: 'white',
        color: colors.primary,
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    nextButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '14px 28px',
        borderRadius: '50px',
        border: 'none',
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        color: 'white',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    },
    completedMessage: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        borderRadius: '16px',
        marginTop: '16px',
        border: '2px solid #10b981',
    },
};

export default function APDQuizContent({
    question,
    questionNumber,
    onAnswerSelect,
    onNext,
    onPrev,
    isFirst,
    isLast,
}) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [testResults, setTestResults] = useState(null);
    
    // Get the specific APD test type from the question
    const testType = question?.apdTestType || 'discrimination';
    const testConfig = APD_COMPONENTS[testType] || APD_COMPONENTS.discrimination;
    const TestComponent = testConfig.component;

    const handleComplete = (results) => {
        console.log(`APD Test (${testType}) completed:`, results);
        setTestResults(results);
        setIsCompleted(true);
        
        // Store individual APD test results
        try {
            const existingResults = JSON.parse(localStorage.getItem('leadis_apd_results') || '{}');
            localStorage.setItem('leadis_apd_results', JSON.stringify({
                ...existingResults,
                [testType]: {
                    ...results,
                    completedAt: new Date().toISOString(),
                },
            }));
        } catch (e) {
            console.error('Error saving APD results:', e);
        }
        
        // Notify quiz that APD test is complete
        onAnswerSelect('Completed');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={containerStyles.wrapper}
        >
            {/* Header - matching minigame style */}
            <div style={containerStyles.header}>
                <div style={containerStyles.title}>
                    <Headphones size={20} />
                    Listening Test
                </div>
            </div>

            {/* Game Card - matching minigame style */}
            <div style={containerStyles.gameCard}>
                {/* Headphone warning */}
                <div style={containerStyles.headphoneWarning}>
                    <Volume2 size={20} color="#f59e0b" />
                    <span style={{ color: '#92400e' }}>Use headphones for best results</span>
                </div>

                {/* Test header */}
                <div style={containerStyles.testHeader}>
                    <div style={containerStyles.testIcon}>{testConfig.icon}</div>
                    <h2 style={containerStyles.testTitle}>{testConfig.title}</h2>
                    <p style={containerStyles.testDescription}>{testConfig.description}</p>
                </div>

                {/* Render the specific APD test component */}
                {!isCompleted && <TestComponent onComplete={handleComplete} />}
                
                {/* Show completion message and navigation */}
                <AnimatePresence>
                    {isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div style={containerStyles.completedMessage}>
                                <CheckCircle size={24} color="#10b981" />
                                <span style={{ color: '#065f46', fontWeight: 600, fontSize: '16px' }}>
                                    Great job! You completed the {testConfig.title}!
                                </span>
                            </div>
                            
                            {/* Navigation Buttons */}
                            <div style={containerStyles.navigationButtons}>
                                <motion.button
                                    onClick={onPrev}
                                    disabled={isFirst}
                                    whileHover={!isFirst ? { scale: 1.05 } : {}}
                                    whileTap={!isFirst ? { scale: 0.95 } : {}}
                                    style={{
                                        ...containerStyles.navButton,
                                        opacity: isFirst ? 0.4 : 1,
                                        cursor: isFirst ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    <ArrowLeft size={20} />
                                    Back
                                </motion.button>

                                <motion.button
                                    onClick={onNext}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={containerStyles.nextButton}
                                >
                                    {isLast ? 'Finish' : 'Continue'}
                                    <ArrowRight size={20} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
