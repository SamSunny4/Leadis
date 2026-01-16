'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Gamepad2, Move, Grid, ListOrdered, Puzzle } from 'lucide-react';
import { colors, contentStyles } from '../styles/quizStyles';
import { MinigameType } from '../schema/quizSchema';

/**
 * MinigameQuizContent - Renders interactive minigame questions
 * Extensible framework for various game types
 * 
 * @param {Object} props
 * @param {Object} props.question - The question object
 * @param {string} props.question.gameType - Type of minigame (drag-drop, matching, sequence, puzzle)
 * @param {Object} props.question.config - Game-specific configuration
 * @param {*} props.selectedAnswer - Currently selected/completed answer
 * @param {Function} props.onAnswerSelect - Callback when answer is selected
 * @param {Function} props.onNext - Callback for next button
 * @param {Function} props.onPrev - Callback for previous button
 * @param {boolean} props.isFirst - Whether this is the first question
 * @param {boolean} props.isLast - Whether this is the last question
 */
export default function MinigameQuizContent({
    question,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrev,
    isFirst,
    isLast,
}) {
    const [gameCompleted, setGameCompleted] = useState(false);

    const getGameIcon = () => {
        switch (question.gameType) {
            case MinigameType.DRAG_DROP:
                return <Move size={48} color={colors.primary} />;
            case MinigameType.MATCHING:
                return <Grid size={48} color={colors.primary} />;
            case MinigameType.SEQUENCE:
                return <ListOrdered size={48} color={colors.primary} />;
            case MinigameType.PUZZLE:
                return <Puzzle size={48} color={colors.primary} />;
            default:
                return <Gamepad2 size={48} color={colors.primary} />;
        }
    };

    const getGameTitle = () => {
        switch (question.gameType) {
            case MinigameType.DRAG_DROP:
                return 'Drag & Drop';
            case MinigameType.MATCHING:
                return 'Matching Game';
            case MinigameType.SEQUENCE:
                return 'Sequence Order';
            case MinigameType.PUZZLE:
                return 'Puzzle';
            default:
                return 'Minigame';
        }
    };

    // Placeholder game completion handler
    const handleGameComplete = (result) => {
        setGameCompleted(true);
        onAnswerSelect(result);
    };

    return (
        <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            style={contentStyles.questionCard}
        >
            <div style={contentStyles.questionBox}>
                <h2 style={contentStyles.questionText}>Q) {question.question}</h2>
                <div style={contentStyles.questionUnderline}></div>
            </div>

            {/* Minigame Container */}
            <div style={contentStyles.minigameContainer}>
                {getGameIcon()}
                <h3 style={{
                    fontSize: '24px',
                    fontWeight: 700,
                    color: colors.dark,
                    fontFamily: 'var(--font-fredoka), sans-serif',
                }}>
                    {getGameTitle()}
                </h3>
                <p style={contentStyles.minigameInstruction}>
                    {question.config?.instructions || 'Complete the interactive activity below.'}
                </p>

                {/* Placeholder for actual game content */}
                <div style={{
                    width: '100%',
                    minHeight: '150px',
                    border: `2px dashed ${colors.primaryLight}`,
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.white,
                    padding: '24px',
                }}>
                    {gameCompleted || selectedAnswer ? (
                        <div style={{
                            textAlign: 'center',
                            color: colors.primary,
                        }}>
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    backgroundColor: colors.lightBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                    border: `2px solid ${colors.primary}`,
                                }}>
                                    ✓
                                </div>
                            </motion.div>
                            <p style={{ fontWeight: 600 }}>Activity Completed!</p>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleGameComplete('completed')}
                            style={{
                                padding: '16px 32px',
                                backgroundColor: colors.primary,
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                fontSize: '16px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <Gamepad2 size={20} />
                            Start Activity
                        </button>
                    )}
                </div>
            </div>

            <div style={contentStyles.navigationButtons}>
                <button
                    onClick={onPrev}
                    disabled={isFirst}
                    style={{
                        ...contentStyles.navButton,
                        opacity: isFirst ? 0.5 : 1,
                        cursor: isFirst ? 'not-allowed' : 'pointer',
                    }}
                >
                    <ArrowLeft size={20} />
                    Prev
                </button>

                <button
                    onClick={onNext}
                    style={contentStyles.nextButton}
                >
                    {isLast ? 'Finish' : 'Next'}
                    <ArrowRight size={20} />
                </button>
            </div>
        </motion.div>
    );
}
