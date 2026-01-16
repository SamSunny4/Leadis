'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check, X, ArrowRight } from 'lucide-react';
import { colors } from '../../styles/quizStyles';

/**
 * Auditory Discrimination Test
 * Tests ability to distinguish between similar sounds
 * Uses Web Audio API to generate tones
 */

const QUESTIONS = [
    {
        id: 1,
        type: 'pitch',
        description: 'Are these two sounds the SAME or DIFFERENT?',
        sound1: { frequency: 440, duration: 500 },
        sound2: { frequency: 440, duration: 500 },
        correctAnswer: 'same',
    },
    {
        id: 2,
        type: 'pitch',
        description: 'Are these two sounds the SAME or DIFFERENT?',
        sound1: { frequency: 440, duration: 500 },
        sound2: { frequency: 520, duration: 500 },
        correctAnswer: 'different',
    },
    {
        id: 3,
        type: 'pitch',
        description: 'Are these two sounds the SAME or DIFFERENT?',
        sound1: { frequency: 330, duration: 500 },
        sound2: { frequency: 330, duration: 500 },
        correctAnswer: 'same',
    },
    {
        id: 4,
        type: 'pitch',
        description: 'Are these two sounds the SAME or DIFFERENT?',
        sound1: { frequency: 550, duration: 500 },
        sound2: { frequency: 600, duration: 500 },
        correctAnswer: 'different',
    },
    {
        id: 5,
        type: 'duration',
        description: 'Which sound was LONGER?',
        sound1: { frequency: 440, duration: 300 },
        sound2: { frequency: 440, duration: 600 },
        correctAnswer: 'second',
    },
    {
        id: 6,
        type: 'duration',
        description: 'Which sound was LONGER?',
        sound1: { frequency: 440, duration: 700 },
        sound2: { frequency: 440, duration: 400 },
        correctAnswer: 'first',
    },
];

const testStyles = {
    container: {
        padding: '24px',
        textAlign: 'center',
    },
    question: {
        fontSize: '24px',
        fontWeight: 700,
        color: colors.dark,
        marginBottom: '32px',
    },
    soundButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginBottom: '32px',
    },
    soundButton: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '16px',
        fontWeight: 700,
        transition: 'all 0.2s ease',
    },
    answerButtons: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
    },
    answerButton: {
        padding: '16px 32px',
        borderRadius: '50px',
        border: '3px solid',
        fontSize: '18px',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '120px',
    },
    progress: {
        marginTop: '32px',
        fontSize: '14px',
        color: colors.gray,
    },
    feedback: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '32px 48px',
        borderRadius: '24px',
        color: 'white',
        fontSize: '24px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 100,
    },
};

export default function AuditoryDiscriminationTest({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playedSounds, setPlayedSounds] = useState({ first: false, second: false });
    const [feedback, setFeedback] = useState(null);
    const audioContextRef = useRef(null);

    const currentQuestion = QUESTIONS[currentIndex];

    // Initialize AudioContext
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const playTone = useCallback(async (frequency, duration) => {
        if (!audioContextRef.current) return;
        
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Smooth envelope
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + (duration / 1000) - 0.05);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + (duration / 1000));
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration / 1000);
        
        return new Promise(resolve => setTimeout(resolve, duration + 100));
    }, []);

    const playSound = async (which) => {
        if (isPlaying) return;
        
        setIsPlaying(true);
        const sound = which === 'first' ? currentQuestion.sound1 : currentQuestion.sound2;
        await playTone(sound.frequency, sound.duration);
        setPlayedSounds(prev => ({ ...prev, [which]: true }));
        setIsPlaying(false);
    };

    const playBoth = async () => {
        if (isPlaying) return;
        
        setIsPlaying(true);
        await playTone(currentQuestion.sound1.frequency, currentQuestion.sound1.duration);
        await new Promise(resolve => setTimeout(resolve, 500)); // Gap between sounds
        await playTone(currentQuestion.sound2.frequency, currentQuestion.sound2.duration);
        setPlayedSounds({ first: true, second: true });
        setIsPlaying(false);
    };

    const handleAnswer = (answer) => {
        const isCorrect = answer === currentQuestion.correctAnswer;
        setAnswers(prev => [...prev, { questionId: currentQuestion.id, answer, isCorrect }]);
        
        // Show feedback
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        setTimeout(() => {
            setFeedback(null);
            
            if (currentIndex < QUESTIONS.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setPlayedSounds({ first: false, second: false });
            } else {
                // Calculate final score
                const allAnswers = [...answers, { questionId: currentQuestion.id, answer, isCorrect }];
                const correctCount = allAnswers.filter(a => a.isCorrect).length;
                const score = Math.round((correctCount / QUESTIONS.length) * 100);
                onComplete({ score, answers: allAnswers });
            }
        }, 800);
    };

    const getAnswerOptions = () => {
        if (currentQuestion.type === 'pitch') {
            return [
                { value: 'same', label: 'Same', color: colors.primary },
                { value: 'different', label: 'Different', color: '#8b5cf6' },
            ];
        } else {
            return [
                { value: 'first', label: 'First', color: '#3b82f6' },
                { value: 'second', label: 'Second', color: '#f59e0b' },
            ];
        }
    };

    const canAnswer = playedSounds.first && playedSounds.second;

    return (
        <div style={testStyles.container}>
            <h2 style={testStyles.question}>{currentQuestion.description}</h2>

            <div style={testStyles.soundButtons}>
                <motion.button
                    onClick={() => playSound('first')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isPlaying}
                    style={{
                        ...testStyles.soundButton,
                        background: playedSounds.first 
                            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        boxShadow: isPlaying ? 'none' : '0 8px 24px rgba(59, 130, 246, 0.4)',
                        opacity: isPlaying ? 0.7 : 1,
                    }}
                >
                    <Volume2 size={32} />
                    Sound 1
                </motion.button>

                <motion.button
                    onClick={() => playSound('second')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isPlaying}
                    style={{
                        ...testStyles.soundButton,
                        background: playedSounds.second 
                            ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        boxShadow: isPlaying ? 'none' : '0 8px 24px rgba(245, 158, 11, 0.4)',
                        opacity: isPlaying ? 0.7 : 1,
                    }}
                >
                    <Volume2 size={32} />
                    Sound 2
                </motion.button>
            </div>

            <motion.button
                onClick={playBoth}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isPlaying}
                style={{
                    padding: '12px 24px',
                    background: 'white',
                    border: `2px solid ${colors.gray}`,
                    borderRadius: '50px',
                    color: colors.dark,
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginBottom: '32px',
                    opacity: isPlaying ? 0.5 : 1,
                }}
            >
                Play Both Sounds
            </motion.button>

            <div style={testStyles.answerButtons}>
                {getAnswerOptions().map(option => (
                    <motion.button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        whileHover={canAnswer ? { scale: 1.05, y: -2 } : {}}
                        whileTap={canAnswer ? { scale: 0.95 } : {}}
                        disabled={!canAnswer}
                        style={{
                            ...testStyles.answerButton,
                            borderColor: option.color,
                            backgroundColor: canAnswer ? 'white' : '#f1f5f9',
                            color: canAnswer ? option.color : colors.gray,
                            cursor: canAnswer ? 'pointer' : 'not-allowed',
                            opacity: canAnswer ? 1 : 0.5,
                        }}
                    >
                        {option.label}
                    </motion.button>
                ))}
            </div>

            <p style={testStyles.progress}>
                Question {currentIndex + 1} of {QUESTIONS.length}
            </p>

            {/* Feedback overlay */}
            {feedback && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    style={{
                        ...testStyles.feedback,
                        backgroundColor: feedback === 'correct' ? colors.primary : '#ef4444',
                    }}
                >
                    {feedback === 'correct' ? <Check size={32} /> : <X size={32} />}
                    {feedback === 'correct' ? 'Correct!' : 'Try again next time'}
                </motion.div>
            )}
        </div>
    );
}
