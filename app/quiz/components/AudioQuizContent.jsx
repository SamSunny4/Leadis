'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2, Check } from 'lucide-react';
import { colors, contentStyles } from '../styles/quizStyles';

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * AudioQuizContent - Renders audio-based questions with clean design
 */
export default function AudioQuizContent({
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
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [hoveredOption, setHoveredOption] = useState(null);
    const [playCount, setPlayCount] = useState(0);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
                setPlayCount(prev => prev + 1);
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnd = () => {
        setIsPlaying(false);
    };
    
    // Handle answer selection with play count
    const handleAnswerSelection = (option) => {
        // Create an object with answer and metadata
        const answerData = {
            answer: option,
            audioReplays: playCount,
            type: 'audio'
        };
        onAnswerSelect(answerData);
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

                {/* Fun Audio Player */}
                <div style={contentStyles.audioContainer}>
                    <motion.div 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <motion.button
                            onClick={togglePlay}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            animate={isPlaying ? { 
                                boxShadow: ['0 0 0 0 rgba(96, 165, 250, 0.4)', '0 0 0 20px rgba(96, 165, 250, 0)'],
                            } : {}}
                            transition={isPlaying ? { duration: 1, repeat: Infinity } : {}}
                            style={contentStyles.playButtonLarge}
                        >
                            {isPlaying ? (
                                <Pause size={32} color="white" />
                            ) : (
                                <Play size={32} color="white" style={{ marginLeft: '4px' }} />
                            )}
                        </motion.button>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            backgroundColor: 'white',
                            padding: '12px 24px',
                            borderRadius: '50px',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
                        }}>
                            <Volume2 size={20} color={isPlaying ? colors.blue : colors.gray} />
                            <span style={{ 
                                fontSize: '16px', 
                                fontWeight: 600,
                                color: isPlaying ? colors.blue : colors.dark,
                            }}>
                                {isPlaying ? 'Playing...' : 'Tap to listen'}
                            </span>
                            {playCount > 0 && (
                                <span style={{
                                    fontSize: '12px',
                                    backgroundColor: colors.primaryLight,
                                    color: colors.primaryDark,
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontWeight: 700,
                                }}>
                                    Played {playCount}x
                                </span>
                            )}
                        </div>
                    </motion.div>
                    
                    {question.audioUrl && (
                        <audio
                            ref={audioRef}
                            src={question.audioUrl}
                            onEnded={handleAudioEnd}
                            style={{ display: 'none' }}
                        />
                    )}
                </div>

                {/* Options List */}
                <div style={contentStyles.optionsList}>
                    {question.options?.map((option, index) => {
                        // Handle both string and object selectedAnswer
                        const selectedValue = typeof selectedAnswer === 'object' ? selectedAnswer?.answer : selectedAnswer;
                        const isSelected = selectedValue === option;
                        const isHovered = hoveredOption === index;
                        
                        return (
                            <motion.label
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02, x: 8 }}
                                whileTap={{ scale: 0.98 }}
                                onMouseEnter={() => setHoveredOption(index)}
                                onMouseLeave={() => setHoveredOption(null)}
                                style={{
                                    ...contentStyles.optionLabel,
                                    borderColor: isSelected ? colors.primary : isHovered ? colors.primaryLight : '#e2e8f0',
                                    backgroundColor: isSelected ? colors.lightBg : 'white',
                                    boxShadow: isSelected 
                                        ? '0 8px 25px rgba(34, 197, 94, 0.25)' 
                                        : '0 4px 15px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                <div style={{
                                    ...contentStyles.optionLetter,
                                    backgroundColor: isSelected ? colors.primary : '#f1f5f9',
                                    color: isSelected ? 'white' : colors.gray,
                                }}>
                                    {optionLetters[index]}
                                </div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}-${index}`}
                                    value={option}
                                    checked={isSelected}
                                    onChange={() => handleAnswerSelection(option)}
                                    style={{ display: 'none' }}
                                />
                                <span style={{
                                    ...contentStyles.optionText,
                                    color: isSelected ? colors.primaryDark : colors.dark,
                                }}>
                                    {option}
                                </span>
                                {isSelected && (
                                    <Check size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                )}
                            </motion.label>
                        );
                    })}
                </div>
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

            {/* Celebration - Removed per user request */}
            {/* <AnimatePresence>
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
            </AnimatePresence> */}
        </motion.div>
    );
}
