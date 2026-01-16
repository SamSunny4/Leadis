'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Play, Pause, Volume2 } from 'lucide-react';
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
 * AudioQuizContent - Renders audio-based questions
 * Includes an audio player with the question audio and text options
 * 
 * @param {Object} props
 * @param {Object} props.question - The question object with audioUrl
 * @param {string} props.selectedAnswer - Currently selected answer
 * @param {Function} props.onAnswerSelect - Callback when answer is selected
 * @param {Function} props.onNext - Callback for next button
 * @param {Function} props.onPrev - Callback for previous button
 * @param {boolean} props.isFirst - Whether this is the first question
 * @param {boolean} props.isLast - Whether this is the last question
 */
export default function AudioQuizContent({
    question,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrev,
    isFirst,
    isLast,
}) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleAudioEnd = () => {
        setIsPlaying(false);
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

            {/* Audio Player Section */}
            <div style={contentStyles.audioContainer}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 24px',
                    backgroundColor: colors.white,
                    borderRadius: '50px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}>
                    <Volume2 size={24} color={colors.primary} />
                    <button
                        onClick={togglePlay}
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            backgroundColor: colors.primary,
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                            transition: 'transform 0.2s',
                        }}
                    >
                        {isPlaying ? (
                            <Pause size={20} color="white" />
                        ) : (
                            <Play size={20} color="white" style={{ marginLeft: '2px' }} />
                        )}
                    </button>
                    <span style={{ fontSize: '14px', color: colors.gray, fontWeight: 500 }}>
                        {isPlaying ? 'Playing...' : 'Click to play audio'}
                    </span>
                </div>
                {question.audioUrl && (
                    <audio
                        ref={audioRef}
                        src={question.audioUrl}
                        onEnded={handleAudioEnd}
                        style={{ display: 'none' }}
                    />
                )}
            </div>

            <div style={contentStyles.optionsList}>
                {question.options?.map((option, index) => (
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
