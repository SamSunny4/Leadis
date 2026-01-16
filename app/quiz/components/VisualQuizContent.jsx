'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { colors, contentStyles } from '../styles/quizStyles';

/**
 * Helper component for custom radio check icon
 */
const Check = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

/**
 * VisualQuizContent - Renders visual/image-based questions
 * Supports both image questions and image-based answer options
 * 
 * @param {Object} props
 * @param {Object} props.question - The question object
 * @param {string} props.question.imageUrl - Optional main question image
 * @param {Array} props.question.options - Options (can have imageUrl property)
 * @param {string} props.selectedAnswer - Currently selected answer
 * @param {Function} props.onAnswerSelect - Callback when answer is selected
 * @param {Function} props.onNext - Callback for next button
 * @param {Function} props.onPrev - Callback for previous button
 * @param {boolean} props.isFirst - Whether this is the first question
 * @param {boolean} props.isLast - Whether this is the last question
 */
export default function VisualQuizContent({
    question,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrev,
    isFirst,
    isLast,
}) {
    // Check if options have images (visual options mode)
    const hasVisualOptions = question.options?.some(opt =>
        typeof opt === 'object' && opt.imageUrl
    );

    // Normalize options to handle both string[] and object[] formats
    const normalizedOptions = question.options?.map(opt =>
        typeof opt === 'string' ? { label: opt } : opt
    ) || [];

    const getOptionValue = (opt) => opt.label || opt;

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

            {/* Main Question Image */}
            {question.imageUrl && (
                <div style={contentStyles.imageContainer}>
                    <img
                        src={question.imageUrl}
                        alt="Question visual"
                        style={contentStyles.questionImage}
                    />
                </div>
            )}

            {/* Multiple Images (for comparison questions) */}
            {question.imageUrls && question.imageUrls.length > 0 && (
                <div style={{
                    ...contentStyles.imageContainer,
                    flexWrap: 'wrap',
                    gap: '16px',
                }}>
                    {question.imageUrls.map((url, idx) => (
                        <img
                            key={idx}
                            src={url}
                            alt={`Visual ${idx + 1}`}
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
                    {normalizedOptions.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => onAnswerSelect(option.label)}
                            style={{
                                ...contentStyles.visualOption,
                                borderColor: selectedAnswer === option.label ? colors.primary : colors.primaryLight,
                                backgroundColor: selectedAnswer === option.label ? colors.lightBg : colors.white,
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
                                    backgroundColor: colors.lightBg,
                                    borderRadius: '8px',
                                }}>
                                    <ImageIcon size={40} color={colors.primaryLight} />
                                </div>
                            )}
                            <span style={{
                                ...contentStyles.optionText,
                                textAlign: 'center',
                            }}>
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                /* Standard Text Options */
                <div style={contentStyles.optionsList}>
                    {normalizedOptions.map((option, index) => (
                        <label
                            key={index}
                            style={{
                                ...contentStyles.optionLabel,
                                borderColor: selectedAnswer === option.label ? colors.primary : colors.primaryLight,
                                backgroundColor: selectedAnswer === option.label ? colors.lightBg : colors.white,
                            }}
                        >
                            <div style={{
                                ...contentStyles.customRadio,
                                backgroundColor: selectedAnswer === option.label ? colors.primary : 'transparent',
                                borderColor: selectedAnswer === option.label ? colors.primary : '#ccc'
                            }}>
                                {selectedAnswer === option.label && <Check size={12} color="white" />}
                            </div>
                            <input
                                type="radio"
                                name={`question-${question.id}`}
                                value={option.label}
                                checked={selectedAnswer === option.label}
                                onChange={() => onAnswerSelect(option.label)}
                                style={{ display: 'none' }}
                            />
                            <span style={contentStyles.optionText}>{option.label}</span>
                        </label>
                    ))}
                </div>
            )}

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
