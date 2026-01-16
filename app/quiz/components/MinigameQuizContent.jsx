'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Gamepad2, Move, Grid, ListOrdered, Puzzle, Sparkles, Trophy, Check, Play } from 'lucide-react';
import { colors, contentStyles } from '../styles/quizStyles';
import { MinigameType } from '../schema/quizSchema';

// Game icon components
const GameIcons = {
    [MinigameType.DRAG_DROP]: Move,
    [MinigameType.MATCHING]: Grid,
    [MinigameType.SEQUENCE]: ListOrdered,
    [MinigameType.PUZZLE]: Puzzle,
    default: Gamepad2,
};

const gameTitles = {
    [MinigameType.DRAG_DROP]: 'Drag & Drop',
    [MinigameType.MATCHING]: 'Match the Pairs',
    [MinigameType.SEQUENCE]: 'Put in Order',
    [MinigameType.PUZZLE]: 'Solve the Puzzle',
    default: 'Fun Activity',
};

/**
 * MinigameQuizContent - Renders interactive minigame questions with kid-friendly design
 */
export default function MinigameQuizContent({
    question,
    questionNumber,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrev,
    isFirst,
    isLast,
    showCelebration,
}) {
    const [gameCompleted, setGameCompleted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const GameIcon = GameIcons[question.gameType] || GameIcons.default;
    const getGameTitle = () => gameTitles[question.gameType] || gameTitles.default;

    const handleGameComplete = (result) => {
        setIsAnimating(true);
        setTimeout(() => {
            setGameCompleted(true);
            onAnswerSelect(result);
            setIsAnimating(false);
        }, 500);
    };

    return (
        <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={contentStyles.questionCard}
        >
            <div style={contentStyles.cardDecoration} />
            
            <div style={contentStyles.questionArea}>
                <div style={contentStyles.questionBox}>
                    <span style={contentStyles.questionNumber}>
                        Question {questionNumber}
                    </span>
                    <h2 style={contentStyles.questionText}>
                        {question.question}
                    </h2>
                    <div style={contentStyles.questionUnderline}></div>
                </div>

                {/* Fun Minigame Container */}
                <motion.div 
                    style={contentStyles.minigameContainer}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        animate={{ 
                            rotate: isAnimating ? [0, -10, 10, -10, 10, 0] : 0,
                            scale: isAnimating ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.5 }}
                        style={{ 
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <GameIcon size={40} color="white" />
                    </motion.div>
                    
                    <h3 style={{
                        fontSize: '28px',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: 'var(--font-fredoka), sans-serif',
                    }}>
                        {getGameTitle()}
                    </h3>
                    
                    <p style={contentStyles.minigameInstruction}>
                        {question.config?.instructions || 'Complete the activity below!'}
                    </p>

                    {/* Game Area */}
                    <div style={{
                        width: '100%',
                        minHeight: '160px',
                        border: `3px dashed ${colors.primaryLight}`,
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        padding: '28px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {gameCompleted || selectedAnswer ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                style={{ textAlign: 'center' }}
                            >
                                <motion.div
                                    animate={{ 
                                        rotate: [0, 360],
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{ 
                                        rotate: { duration: 1 },
                                        scale: { duration: 0.5, delay: 0.5 }
                                    }}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto 16px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Trophy size={40} color="white" />
                                </motion.div>
                                <p style={{ 
                                    fontWeight: 700, 
                                    fontSize: '20px',
                                    color: colors.primary,
                                    fontFamily: 'var(--font-fredoka), sans-serif',
                                }}>
                                    Great Job!
                                </p>
                            </motion.div>
                        ) : (
                            <motion.button
                                onClick={() => handleGameComplete('completed')}
                                whileHover={{ scale: 1.08, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                animate={{
                                    boxShadow: [
                                        '0 4px 20px rgba(34, 197, 94, 0.3)',
                                        '0 8px 30px rgba(34, 197, 94, 0.5)',
                                        '0 4px 20px rgba(34, 197, 94, 0.3)',
                                    ],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    padding: '20px 40px',
                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    fontFamily: 'var(--font-fredoka), sans-serif',
                                }}
                            >
                                <Play size={24} />
                                Start Activity
                                <Sparkles size={20} />
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Navigation */}
            <div style={contentStyles.navigationButtons}>
                <motion.button
                    onClick={onPrev}
                    disabled={isFirst}
                    whileHover={!isFirst ? { scale: 1.05 } : {}}
                    whileTap={!isFirst ? { scale: 0.95 } : {}}
                    style={{
                        ...contentStyles.navButton,
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
                    style={contentStyles.nextButton}
                >
                    {isLast ? 'Finish' : 'Next'}
                    <ArrowRight size={20} />
                </motion.button>
            </div>

            {/* Celebration */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                        }}
                    >
                        <Check size={60} color={colors.primary} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
