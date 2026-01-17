'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { colors } from '../../styles/quizStyles';

/**
 * Auditory Memory Test
 * Tests ability to remember spoken words/numbers
 * Uses Web Speech API for text-to-speech
 * Fetches questions from Gemini API (limited to 3)
 */

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

// Fallback questions if API fails
const FALLBACK_QUESTIONS = [
    {
        id: 1,
        type: 'numbers',
        instruction: 'Listen and type the numbers you hear:',
        items: ['3', '7', '2'],
        display: 'hidden',
    },
    {
        id: 2,
        type: 'words',
        instruction: 'Listen and select the words you heard:',
        items: ['cat', 'dog', 'bird'],
        options: ['cat', 'fish', 'dog', 'horse', 'bird', 'frog'],
        display: 'selection',
    },
    {
        id: 3,
        type: 'sentence',
        instruction: 'Listen and answer: What color was the ball?',
        sentence: 'The boy kicked the red ball into the garden.',
        answer: 'red',
        options: ['blue', 'red', 'green', 'yellow'],
    },
];

const testStyles = {
    container: {
        padding: '24px',
        textAlign: 'center',
    },
    instruction: {
        fontSize: '18px',
        fontWeight: 600,
        color: colors.dark,
        marginBottom: '20px',
    },
    playButton: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
        transition: 'all 0.2s ease',
    },
    input: {
        width: '100%',
        maxWidth: '250px',
        padding: '14px 20px',
        fontSize: '22px',
        textAlign: 'center',
        border: `3px solid ${colors.primaryLight}`,
        borderRadius: '16px',
        outline: 'none',
        fontFamily: 'inherit',
        letterSpacing: '6px',
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        maxWidth: '350px',
        margin: '0 auto 20px',
    },
    optionButton: {
        padding: '14px',
        borderRadius: '12px',
        border: '3px solid',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: 'white',
    },
    submitButton: {
        padding: '14px 40px',
        borderRadius: '50px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        margin: '20px auto 0',
    },
    progress: {
        marginTop: '20px',
        fontSize: '14px',
        color: colors.gray,
    },
    feedback: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '24px 40px',
        borderRadius: '20px',
        color: 'white',
        fontSize: '20px',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 100,
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        gap: '16px',
    },
};

async function fetchQuestionsFromAPI() {
    if (!GEMINI_API_KEY) {
        console.log('No API key, using fallback questions');
        return FALLBACK_QUESTIONS;
    }

    const prompt = `Generate exactly 3 auditory memory test questions for children in JSON format. 
    
    Return ONLY a valid JSON array with NO additional text, using this exact structure:
    [
        {
            "id": 1,
            "type": "numbers",
            "instruction": "Listen and type the numbers you hear:",
            "items": ["5", "2", "8"],
            "display": "hidden"
        },
        {
            "id": 2,
            "type": "words", 
            "instruction": "Listen and select the words you heard:",
            "items": ["apple", "car", "sun"],
            "options": ["apple", "tree", "car", "moon", "sun", "book"],
            "display": "selection"
        },
        {
            "id": 3,
            "type": "sentence",
            "instruction": "Listen and answer: What animal was in the story?",
            "sentence": "The little rabbit hopped across the green meadow.",
            "answer": "rabbit",
            "options": ["dog", "rabbit", "cat", "bird"]
        }
    ]

    Rules:
    - Use simple words appropriate for children ages 6-12
    - For "numbers" type: use 3-4 single-digit numbers
    - For "words" type: use 3 simple words to remember, provide 6 options total
    - For "sentence" type: use a simple sentence with a clear question about it
    - Make each question unique and engaging
    - Do NOT use emojis`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('No JSON array found in response');
        }

        const questions = JSON.parse(jsonMatch[0]);
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error('Invalid questions format');
        }

        // Validate and limit to 3 questions
        return questions.slice(0, 3).map((q, index) => ({
            id: index + 1,
            type: q.type || 'numbers',
            instruction: q.instruction || 'Listen carefully:',
            items: Array.isArray(q.items) ? q.items : ['1', '2', '3'],
            options: Array.isArray(q.options) ? q.options : undefined,
            sentence: q.sentence,
            answer: q.answer,
            display: q.display || 'hidden',
        }));

    } catch (error) {
        console.error('Error fetching questions from API:', error);
        return FALLBACK_QUESTIONS;
    }
}

export default function AuditoryMemoryTest({ onComplete }) {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [selectedWords, setSelectedWords] = useState([]);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [playCount, setPlayCount] = useState(0); // Track audio replays
    const synthRef = useRef(null);

    const currentQuestion = questions[currentIndex];

    // Load questions on mount
    useEffect(() => {
        async function loadQuestions() {
            setIsLoading(true);
            const fetchedQuestions = await fetchQuestionsFromAPI();
            setQuestions(fetchedQuestions);
            setIsLoading(false);
        }
        loadQuestions();
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    const speak = useCallback((text) => {
        return new Promise((resolve) => {
            if (!synthRef.current) {
                resolve();
                return;
            }

            synthRef.current.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            synthRef.current.speak(utterance);
        });
    }, []);

    const playQuestion = async () => {
        if (isPlaying || !currentQuestion) return;
        
        setIsPlaying(true);
        setPlayCount(prev => prev + 1); // Increment play count
        
        if (currentQuestion.type === 'numbers' || currentQuestion.type === 'words') {
            for (const item of currentQuestion.items) {
                await speak(item);
                await new Promise(resolve => setTimeout(resolve, 700));
            }
        } else if (currentQuestion.type === 'sentence') {
            await speak(currentQuestion.sentence);
        }
        
        setIsPlaying(false);
        setHasPlayed(true);
    };

    const checkAnswer = () => {
        if (!currentQuestion) return false;
        
        let isCorrect = false;
        
        if (currentQuestion.type === 'numbers') {
            const userNumbers = userInput.replace(/\s/g, '').split('');
            isCorrect = JSON.stringify(userNumbers) === JSON.stringify(currentQuestion.items);
        } else if (currentQuestion.type === 'words') {
            const sortedSelected = [...selectedWords].sort();
            const sortedCorrect = [...currentQuestion.items].sort();
            isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
        } else if (currentQuestion.type === 'sentence') {
            isCorrect = selectedAnswer === currentQuestion.answer;
        }

        return isCorrect;
    };

    const handleSubmit = () => {
        const isCorrect = checkAnswer();
        setAnswers(prev => [...prev, { 
            questionId: currentQuestion.id, 
            isCorrect,
            audioReplays: playCount // Store audio replays for this question
        }]);
        
        setFeedback(isCorrect ? 'correct' : 'incorrect');
        
        setTimeout(() => {
            setFeedback(null);
            
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setHasPlayed(false);
                setUserInput('');
                setSelectedWords([]);
                setSelectedAnswer(null);
                setPlayCount(0); // Reset play count for next question
            } else {
                const allAnswers = [...answers, { 
                    questionId: currentQuestion.id, 
                    isCorrect,
                    audioReplays: playCount
                }];
                const correctCount = allAnswers.filter(a => a.isCorrect).length;
                const score = Math.round((correctCount / questions.length) * 100);
                
                // Calculate total audio replays and accuracy
                const totalAudioReplays = allAnswers.reduce((sum, a) => sum + (a.audioReplays || 0), 0);
                const accuracy = correctCount / questions.length;
                
                onComplete({ 
                    score, 
                    answers: allAnswers,
                    accuracy,
                    audioReplays: totalAudioReplays,
                    wordsCorrect: correctCount,
                    wordsTotal: questions.length
                });
            }
        }, 800);
    };

    const toggleWordSelection = (word) => {
        setSelectedWords(prev => 
            prev.includes(word) 
                ? prev.filter(w => w !== word)
                : [...prev, word]
        );
    };

    const canSubmit = () => {
        if (!hasPlayed || !currentQuestion) return false;
        
        if (currentQuestion.type === 'numbers') {
            return userInput.length >= currentQuestion.items.length;
        } else if (currentQuestion.type === 'words') {
            return selectedWords.length > 0;
        } else if (currentQuestion.type === 'sentence') {
            return selectedAnswer !== null;
        }
        return false;
    };

    // Loading state
    if (isLoading) {
        return (
            <div style={testStyles.loading}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader2 size={40} color={colors.primary} />
                </motion.div>
                <p style={{ color: colors.gray }}>Preparing questions...</p>
            </div>
        );
    }

    if (!currentQuestion) {
        return <div style={testStyles.container}>No questions available</div>;
    }

    return (
        <div style={testStyles.container}>
            <h2 style={testStyles.instruction}>{currentQuestion.instruction}</h2>

            {/* Play Button */}
            <motion.button
                onClick={playQuestion}
                disabled={isPlaying}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    boxShadow: isPlaying 
                        ? ['0 0 15px rgba(99, 102, 241, 0.5)', '0 0 30px rgba(99, 102, 241, 0.8)', '0 0 15px rgba(99, 102, 241, 0.5)']
                        : '0 6px 20px rgba(99, 102, 241, 0.4)',
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
                    <Volume2 size={32} color="white" />
                ) : (
                    <Play size={32} color="white" fill="white" />
                )}
            </motion.button>

            <p style={{ color: colors.gray, marginBottom: '20px', fontSize: '14px' }}>
                {isPlaying ? 'Listen carefully...' : hasPlayed ? 'Tap to hear again' : 'Tap to listen'}
            </p>

            {/* Number Input */}
            {currentQuestion.type === 'numbers' && hasPlayed && (
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter numbers"
                    style={testStyles.input}
                    maxLength={currentQuestion.items.length + 2}
                />
            )}

            {/* Word Selection */}
            {currentQuestion.type === 'words' && hasPlayed && (
                <div style={testStyles.optionsGrid}>
                    {currentQuestion.options?.map(word => (
                        <motion.button
                            key={word}
                            onClick={() => toggleWordSelection(word)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                ...testStyles.optionButton,
                                borderColor: selectedWords.includes(word) ? colors.primary : '#e2e8f0',
                                backgroundColor: selectedWords.includes(word) ? colors.lightBg : 'white',
                                color: selectedWords.includes(word) ? colors.primaryDark : colors.dark,
                            }}
                        >
                            {word}
                            {selectedWords.includes(word) && (
                                <Check size={14} style={{ marginLeft: '6px' }} />
                            )}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Sentence Question Options */}
            {currentQuestion.type === 'sentence' && hasPlayed && (
                <div style={testStyles.optionsGrid}>
                    {currentQuestion.options?.map(option => (
                        <motion.button
                            key={option}
                            onClick={() => setSelectedAnswer(option)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                ...testStyles.optionButton,
                                borderColor: selectedAnswer === option ? colors.primary : '#e2e8f0',
                                backgroundColor: selectedAnswer === option ? colors.lightBg : 'white',
                                color: selectedAnswer === option ? colors.primaryDark : colors.dark,
                            }}
                        >
                            {option}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Submit Button */}
            <motion.button
                onClick={handleSubmit}
                disabled={!canSubmit()}
                whileHover={canSubmit() ? { scale: 1.05, y: -2 } : {}}
                whileTap={canSubmit() ? { scale: 0.95 } : {}}
                style={{
                    ...testStyles.submitButton,
                    backgroundColor: canSubmit() ? colors.primary : '#e2e8f0',
                    color: canSubmit() ? 'white' : colors.gray,
                    cursor: canSubmit() ? 'pointer' : 'not-allowed',
                    boxShadow: canSubmit() ? '0 6px 20px rgba(34, 197, 94, 0.4)' : 'none',
                }}
            >
                Submit
                <ArrowRight size={18} />
            </motion.button>

            <p style={testStyles.progress}>
                Question {currentIndex + 1} of {questions.length}
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
                        {feedback === 'correct' ? <Check size={28} /> : <X size={28} />}
                        {feedback === 'correct' ? 'Correct!' : 'Not quite'}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
