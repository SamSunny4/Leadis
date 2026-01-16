'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { colors, contentStyles } from '../styles/quizStyles';

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * TextQuizContent - Renders standard multiple-choice text questions
 * Clean, kid-friendly design with animations
 */
export default function TextQuizContent({
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
    const [hoveredOption, setHoveredOption] = useState(null);

    return (
        <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={contentStyles.questionCard}
        >
            {/* Decorative circle */}
            <div style={contentStyles.cardDecoration} />
            
            <div style={contentStyles.questionArea}>
                {/* Question Box */}
                <div style={contentStyles.questionBox}>
                    <span style={contentStyles.questionNumber}>
                        Question {questionNumber}
                    </span>
                    <h2 style={contentStyles.questionText}>
                        {question.question}
                    </h2>
                    <div style={contentStyles.questionUnderline}></div>
                </div>

                {/* Options List */}
                <div style={contentStyles.optionsList}>
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === option;
                        const isHovered = hoveredOption === index;
                        
                        return (
                            <motion.label
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
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
                                        : isHovered 
                                            ? '0 8px 20px rgba(0, 0, 0, 0.1)' 
                                            : '0 4px 15px rgba(0, 0, 0, 0.05)',
                                }}
                            >
                                {/* Option Letter Badge */}
                                <div style={{
                                    ...contentStyles.optionLetter,
                                    backgroundColor: isSelected ? colors.primary : isHovered ? colors.primaryLight : '#f1f5f9',
                                    color: isSelected ? 'white' : isHovered ? colors.primaryDark : colors.gray,
                                }}>
                                    {optionLetters[index]}
                                </div>
                                
                                {/* Hidden Radio - using ID to prevent duplicate names across re-renders */}
                                <input
                                    type="radio"
                                    name={`question-${question.id}-${index}`} 
                                    value={option}
                                    checked={isSelected}
                                    onChange={() => onAnswerSelect(option)}
                                    style={{ display: 'none' }}
                                />
                                
                                {/* Option Text */}
                                <span style={{
                                    ...contentStyles.optionText,
                                    color: isSelected ? colors.primaryDark : colors.dark,
                                }}>
                                    {option}
                                </span>
                                
                                {/* Checkmark */}
                                {isSelected && (
                                    <Check size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                )}
                            </motion.label>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
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

            {/* Celebration animation - Removed per user request */}
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
