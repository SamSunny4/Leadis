'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, Check, X, VolumeX } from 'lucide-react';
import { colors } from '../../styles/quizStyles';

/**
 * Word Recognition Test
 * Tests ability to recognize words in quiet and with background noise
 * Uses Web Speech API for text-to-speech
 */

const TEST_ITEMS = [
    {
        id: 1,
        type: 'quiet',
        word: 'apple',
        options: ['apple', 'table', 'maple', 'cable'],
        correctAnswer: 'apple',
    },
    {
        id: 2,
        type: 'quiet',
        word: 'sunshine',
        options: ['sometime', 'sunshine', 'sunrise', 'sunlight'],
        correctAnswer: 'sunshine',
    },
    {
        id: 3,
        type: 'noise',
        word: 'garden',
        options: ['burden', 'garden', 'pardon', 'harden'],
        correctAnswer: 'garden',
        noiseLevel: 0.15,
    },
    {
        id: 4,
        type: 'noise',
        word: 'thunder',
        options: ['under', 'thunder', 'blunder', 'wonder'],
        correctAnswer: 'thunder',
        noiseLevel: 0.2,
    },
    {
        id: 5,
        type: 'competing',
        word: 'rainbow',
        distractorWord: 'window',
        options: ['rainbow', 'window', 'shadow', 'meadow'],
        correctAnswer: 'rainbow',
    },
    {
        id: 6,
        type: 'competing',
        word: 'mountain',
        distractorWord: 'fountain',
        options: ['fountain', 'mountain', 'captain', 'certain'],
        correctAnswer: 'mountain',
    },
];

const testStyles = {
    container: {
        padding: '24px',
        textAlign: 'center',
    },
    instruction: {
        fontSize: '18px',
        fontWeight: 500,
        color: colors.dark,
        marginBottom: '8px',
    },
    description: {
        fontSize: '14px',
        color: colors.gray,
        marginBottom: '24px',
    },
    playButton: {
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
        margin: '0 auto 32px',
        transition: 'all 0.2s ease',
    },
    typeIndicator: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '20px',
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        maxWidth: '400px',
        margin: '0 auto 24px',
    },
    optionButton: {
        padding: '20px',
        borderRadius: '16px',
        border: '3px solid',
        fontSize: '18px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'white',
    },
    progress: {
        marginTop: '24px',
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

export default function WordRecognitionTest({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [playCount, setPlayCount] = useState(0); // Track audio replays
    const audioContextRef = useRef(null);
    const noiseNodeRef = useRef(null);
    const noiseGainRef = useRef(null);

    const currentItem = TEST_ITEMS[currentIndex];

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        return () => {
            stopNoise();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const createNoise = useCallback((volume) => {
        if (!audioContextRef.current) return;
        
        const ctx = audioContextRef.current;
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        noiseNodeRef.current = ctx.createBufferSource();
        noiseNodeRef.current.buffer = noiseBuffer;
        noiseNodeRef.current.loop = true;
        
        noiseGainRef.current = ctx.createGain();
        noiseGainRef.current.gain.value = volume;
        
        // Add low-pass filter to make noise less harsh
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        
        noiseNodeRef.current.connect(filter);
        filter.connect(noiseGainRef.current);
        noiseGainRef.current.connect(ctx.destination);
        
        noiseNodeRef.current.start();
    }, []);

    const stopNoise = useCallback(() => {
        if (noiseNodeRef.current) {
            try {
                noiseNodeRef.current.stop();
            } catch (e) {}
            noiseNodeRef.current = null;
        }
    }, []);

    const speak = useCallback((text) => {
        return new Promise((resolve, reject) => {
            if (!window.speechSynthesis) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }
            
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85;
            utterance.pitch = 1;
            utterance.volume = 1;
            
            utterance.onend = resolve;
            utterance.onerror = reject;
            
            window.speechSynthesis.speak(utterance);
        });
    }, []);

    const playWord = async () => {
        if (isPlaying) return;
        
        setIsPlaying(true);
        setPlayCount(prev => prev + 1); // Increment play count
        
        try {
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            
            // Start background noise if needed
            if (currentItem.type === 'noise') {
                createNoise(currentItem.noiseLevel || 0.15);
            }
            
            // Play competing word in background (lower volume)
            if (currentItem.type === 'competing' && currentItem.distractorWord) {
                // Create a quieter distractor voice
                const distractor = new SpeechSynthesisUtterance(currentItem.distractorWord);
                distractor.rate = 0.9;
                distractor.pitch = 0.8;
                distractor.volume = 0.4;
                window.speechSynthesis.speak(distractor);
                
                // Small delay before main word
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Speak the target word
            await speak(currentItem.word);
            
            // Stop noise after word is spoken
            stopNoise();
            
        } catch (error) {
            console.error('Error playing word:', error);
            stopNoise();
        }
        
        setIsPlaying(false);
        setHasPlayed(true);
    };

    const handleAnswer = (answer) => {
        if (!hasPlayed) return;
        
        const isCorrect = answer === currentItem.correctAnswer;
        setAnswers(prev => [...prev, { 
            questionId: currentItem.id, 
            answer, 
            isCorrect,
            type: currentItem.type,
            audioReplays: playCount // Store audio replays for this question
        }]);
        
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        
        setTimeout(() => {
            setFeedback(null);
            
            if (currentIndex < TEST_ITEMS.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setHasPlayed(false);
                setPlayCount(0); // Reset play count for next question
            } else {
                const allAnswers = [...answers, { 
                    questionId: currentItem.id, 
                    answer, 
                    isCorrect,
                    type: currentItem.type,
                    audioReplays: playCount
                }];
                const correctCount = allAnswers.filter(a => a.isCorrect).length;
                const score = Math.round((correctCount / TEST_ITEMS.length) * 100);
                
                // Calculate subscores
                const quietAnswers = allAnswers.filter(a => a.type === 'quiet');
                const noiseAnswers = allAnswers.filter(a => a.type === 'noise');
                const competingAnswers = allAnswers.filter(a => a.type === 'competing');
                
                // Calculate total audio replays
                const totalAudioReplays = allAnswers.reduce((sum, a) => sum + (a.audioReplays || 0), 0);
                
                onComplete({ 
                    score, 
                    answers: allAnswers,
                    accuracy: correctCount / TEST_ITEMS.length,
                    audioReplays: totalAudioReplays,
                    wordsCorrect: correctCount,
                    wordsTotal: TEST_ITEMS.length,
                    subscores: {
                        quiet: Math.round((quietAnswers.filter(a => a.isCorrect).length / quietAnswers.length) * 100),
                        noise: Math.round((noiseAnswers.filter(a => a.isCorrect).length / noiseAnswers.length) * 100),
                        competing: Math.round((competingAnswers.filter(a => a.isCorrect).length / competingAnswers.length) * 100),
                    }
                });
            }
        }, 1000);
    };

    const getTypeInfo = () => {
        switch (currentItem.type) {
            case 'quiet':
                return {
                    label: 'Quiet',
                    icon: Volume2,
                    color: '#22c55e',
                    bg: '#dcfce7',
                    description: 'Listen carefully and select the word you heard.',
                };
            case 'noise':
                return {
                    label: 'With Background Noise',
                    icon: VolumeX,
                    color: '#f59e0b',
                    bg: '#fef3c7',
                    description: 'A word will be spoken with background noise. Focus on the word.',
                };
            case 'competing':
                return {
                    label: 'Competing Speech',
                    icon: Volume2,
                    color: '#ef4444',
                    bg: '#fee2e2',
                    description: 'Two words will be spoken. Select the LOUDER/CLEARER word.',
                };
            default:
                return {
                    label: 'Listen',
                    icon: Volume2,
                    color: colors.primary,
                    bg: '#e0e7ff',
                    description: 'Listen and select the correct word.',
                };
        }
    };

    const typeInfo = getTypeInfo();
    const TypeIcon = typeInfo.icon;

    return (
        <div style={testStyles.container}>
            {/* Type Indicator */}
            <div 
                style={{
                    ...testStyles.typeIndicator,
                    backgroundColor: typeInfo.bg,
                    color: typeInfo.color,
                }}
            >
                <TypeIcon size={18} />
                {typeInfo.label}
            </div>

            <h2 style={testStyles.instruction}>What word did you hear?</h2>
            <p style={testStyles.description}>{typeInfo.description}</p>

            {/* Play Button */}
            <motion.button
                onClick={playWord}
                disabled={isPlaying}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    boxShadow: isPlaying 
                        ? ['0 0 20px rgba(99, 102, 241, 0.5)', '0 0 40px rgba(99, 102, 241, 0.8)', '0 0 20px rgba(99, 102, 241, 0.5)']
                        : '0 8px 24px rgba(99, 102, 241, 0.4)',
                }}
                transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                style={{
                    ...testStyles.playButton,
                    background: hasPlayed 
                        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                }}
            >
                {isPlaying ? (
                    <Volume2 size={40} color="white" />
                ) : (
                    <Play size={40} color="white" fill="white" />
                )}
                <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>
                    {isPlaying ? 'Playing...' : hasPlayed ? 'Play Again' : 'Listen'}
                </span>
            </motion.button>

            {/* Answer Options */}
            {hasPlayed && (
                <div style={testStyles.optionsGrid}>
                    {currentItem.options.map((option, index) => (
                        <motion.button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                ...testStyles.optionButton,
                                borderColor: '#e2e8f0',
                            }}
                        >
                            {option}
                        </motion.button>
                    ))}
                </div>
            )}

            <p style={testStyles.progress}>
                Question {currentIndex + 1} of {TEST_ITEMS.length}
            </p>

            {/* Feedback overlay */}
            <AnimatePresence>
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
                        {feedback === 'correct' ? 'Correct!' : 'Not quite'}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
