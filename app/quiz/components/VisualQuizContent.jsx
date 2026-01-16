'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Image as ImageIcon, Check } from 'lucide-react';
import { colors, contentStyles } from '../styles/quizStyles';

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

/**
 * VisualQuizContent - Renders visual/image-based questions with clean design
 */
export default function VisualQuizContent({
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

    // Check if options have images (visual options mode)
    const hasVisualOptions = question.options?.some(opt =>
        typeof opt === 'object' && opt.imageUrl
    );

    // Normalize options to handle both string[] and object[] formats
    const normalizedOptions = question.options?.map(opt =>
        typeof opt === 'string' ? { label: opt } : opt
    ) || [];

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

                {/* Main Question Image */}
                {question.imageUrl && (
                    <motion.div 
                        style={contentStyles.imageContainer}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img
                            src={question.imageUrl}
                            alt="Question visual"
                            style={contentStyles.questionImage}
                        />
                    </motion.div>
                )}

                {/* Multiple Images */}
                {question.imageUrls && question.imageUrls.length > 0 && (
                    <div style={{
                        ...contentStyles.imageContainer,
                        flexWrap: 'wrap',
                        gap: '16px',
                    }}>
                        {question.imageUrls.map((url, idx) => (
                            <motion.img
                                key={idx}
                                src={url}
                                alt={`Visual ${idx + 1}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.15 }}
                                style={{
                                    ...contentStyles.questionImage,
                                    maxWidth: '45%',
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Visual Options Grid */}
                {hasVisualOptions ? (
                    <div style={contentStyles.visualOptionsGrid}>
                        {normalizedOptions.map((option, index) => {
                            const isSelected = selectedAnswer === option.label;
                            const isHovered = hoveredOption === index;
                            
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onAnswerSelect(option.label)}
                                    onMouseEnter={() => setHoveredOption(index)}
                                    onMouseLeave={() => setHoveredOption(null)}
                                    style={{
                                        ...contentStyles.visualOption,
                                        borderColor: isSelected ? colors.primary : isHovered ? colors.primaryLight : '#e2e8f0',
                                        backgroundColor: isSelected ? colors.lightBg : 'white',
                                        boxShadow: isSelected 
                                            ? '0 12px 30px rgba(34, 197, 94, 0.3)' 
                                            : isHovered 
                                                ? '0 8px 25px rgba(0, 0, 0, 0.15)' 
                                                : '0 4px 15px rgba(0, 0, 0, 0.05)',
                                    }}
                                >
                                    {option.imageUrl ? (
                                        <img
                                            src={option.imageUrl}
                                            alt={option.label}
                                            style={contentStyles.visualOptionImage}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '120px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                            borderRadius: '12px',
                                        }}>
                                            <ImageIcon size={48} color={colors.primaryLight} />
                                        </div>
                                    )}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <span style={{
                                            ...contentStyles.optionLetter,
                                            width: '28px',
                                            height: '28px',
                                            fontSize: '14px',
                                            backgroundColor: isSelected ? colors.primary : '#f1f5f9',
                                            color: isSelected ? 'white' : colors.gray,
                                        }}>
                                            {optionLetters[index]}
                                        </span>
                                        <span style={{
                                            ...contentStyles.optionText,
                                            textAlign: 'center',
                                            color: isSelected ? colors.primaryDark : colors.dark,
                                        }}>
                                            {option.label}
                                        </span>
                                        {isSelected && <Check size={18} color={colors.primary} />}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    /* Standard Text Options */
                    <div style={contentStyles.optionsList}>
                        {normalizedOptions.map((option, index) => {
                            const isSelected = selectedAnswer === option.label;
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
                                        name={`question-${question.id}`}
                                        value={option.label}
                                        checked={isSelected}
                                        onChange={() => onAnswerSelect(option.label)}
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{
                                        ...contentStyles.optionText,
                                        color: isSelected ? colors.primaryDark : colors.dark,
                                    }}>
                                        {option.label}
                                    </span>
                                    {isSelected && (
                                        <Check size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                                    )}
                                </motion.label>
                            );
                        })}
                    </div>
                )}
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
