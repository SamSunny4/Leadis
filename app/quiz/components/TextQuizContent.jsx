'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
 * TextQuizContent - Renders standard multiple-choice text questions
 * 
 * @param {Object} props
 * @param {Object} props.question - The question object
 * @param {string} props.selectedAnswer - Currently selected answer
 * @param {Function} props.onAnswerSelect - Callback when answer is selected
 * @param {Function} props.onNext - Callback for next button
 * @param {Function} props.onPrev - Callback for previous button
 * @param {boolean} props.isFirst - Whether this is the first question
 * @param {boolean} props.isLast - Whether this is the last question
 */
export default function TextQuizContent({
    question,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrev,
    isFirst,
    isLast,
}) {
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

            <div style={contentStyles.optionsList}>
                {question.options.map((option, index) => (
                    <label
                        key={index}
                        style={{
                            ...contentStyles.optionLabel,
                            borderColor: selectedAnswer === option ? colors.primary : colors.primaryLight,
                            backgroundColor: selectedAnswer === option ? colors.lightBg : colors.white,
                        }}
                    >
                        <div style={{
                            ...contentStyles.customRadio,
                            backgroundColor: selectedAnswer === option ? colors.primary : 'transparent',
                            borderColor: selectedAnswer === option ? colors.primary : '#ccc'
                        }}>
                            {selectedAnswer === option && <Check size={12} color="white" />}
                        </div>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={() => onAnswerSelect(option)}
                            style={{ display: 'none' }}
                        />
                        <span style={contentStyles.optionText}>{option}</span>
                    </label>
                ))}
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
