'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock, CheckCircle, Star, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { 
    generatePersonalizedQuestions, 
    getStoredQuestions, 
    clearStoredQuestions,
    updatePerformance,
    getPerformanceHistory,
    getEasierQuestion,
    getUserScreeningData
} from './services/questionManager';
import QuizContent from './components/QuizContent';
import { normalizeQuestion } from './schema/quizSchema';
import { colors, quizStyles } from './styles/quizStyles';

// Fun floating shapes for background
const FloatingShapes = () => {
    const shapes = useMemo(() => [
        { color: colors.yellow, size: 60, top: '10%', left: '5%', delay: 0 },
        { color: colors.pink, size: 40, top: '20%', right: '10%', delay: 1 },
        { color: colors.purple, size: 50, top: '60%', left: '8%', delay: 2 },
        { color: colors.blue, size: 35, top: '75%', right: '5%', delay: 0.5 },
        { color: colors.cyan, size: 45, top: '40%', right: '3%', delay: 1.5 },
        { color: colors.orange, size: 30, top: '85%', left: '15%', delay: 2.5 },
        { color: colors.primary, size: 55, top: '5%', right: '20%', delay: 3 },
    ], []);

    return (
        <div style={quizStyles.floatingElements}>
            {shapes.map((shape, i) => (
                <div
                    key={i}
                    style={{
                        ...quizStyles.floatingShape,
                        width: shape.size,
                        height: shape.size,
                        backgroundColor: shape.color,
                        top: shape.top,
                        left: shape.left,
                        right: shape.right,
                        animationDelay: `${shape.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

// Confetti component for completion
const Confetti = () => {
    const confettiPieces = useMemo(() => 
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 2,
            color: [colors.yellow, colors.pink, colors.purple, colors.blue, colors.primary, colors.orange][Math.floor(Math.random() * 6)],
            size: 8 + Math.random() * 8,
        })), []
    );

    return (
        <div style={quizStyles.completedConfetti}>
            {confettiPieces.map((piece) => (
                <div
                    key={piece.id}
                    style={{
                        position: 'absolute',
                        left: piece.left,
                        top: '-20px',
                        width: piece.size,
                        height: piece.size,
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        animation: `confetti ${piece.duration}s linear ${piece.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
};

// Progress bar with stars
const ProgressBar = ({ current, total }) => {
    const progress = ((current + 1) / total) * 100;
    const starsEarned = Math.floor((current + 1) / (total / 3));

    return (
        <div style={quizStyles.progressContainer}>
            <span style={quizStyles.progressStar}>⭐</span>
            <div style={quizStyles.progressWrapper}>
                <div style={{ ...quizStyles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={quizStyles.progressText}>
                {current + 1} / {total}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map((i) => (
                    <span 
                        key={i} 
                        style={{ 
                            fontSize: '20px',
                            opacity: i < starsEarned ? 1 : 0.3,
                            transition: 'all 0.3s',
                            transform: i < starsEarned ? 'scale(1.2)' : 'scale(1)',
                        }}
                    >
                        ⭐
                    </span>
                ))}
            </div>
        </div>
    );
};

export default function QuizPage() {
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [answerResults, setAnswerResults] = useState({}); // Track correct/incorrect
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [userData, setUserData] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

    // Load user data and generate personalized questions on mount
    useEffect(() => {
        async function initializeQuiz() {
            setIsLoading(true);
            try {
                // Get user screening data
                const screeningData = getUserScreeningData();
                setUserData(screeningData);
                
                // Get performance history
                const perfHistory = getPerformanceHistory();
                setPerformance(perfHistory);
                
                // ALWAYS force regenerate on initial load (don't use cache on mount)
                clearStoredQuestions(); // Clear any old cached questions
                const generatedQuestions = await generatePersonalizedQuestions(true); // Force new generation
                const normalized = generatedQuestions.map(normalizeQuestion);
                setQuestions(normalized);
                
                console.log('Quiz initialized with', normalized.length, 'NEW questions');
            } catch (error) {
                console.error('Failed to initialize quiz:', error);
            } finally {
                setIsLoading(false);
            }
        }
        initializeQuiz();
    }, []);

    // Regenerate questions handler
    const handleRegenerateQuestions = useCallback(async () => {
        setIsLoading(true);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setAnswerResults({});
        clearStoredQuestions();
        
        try {
            const generatedQuestions = await generatePersonalizedQuestions(true);
            const normalized = generatedQuestions.map(normalizeQuestion);
            setQuestions(normalized);
        } catch (error) {
            console.error('Failed to regenerate questions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // Timer logic - count UP (only when loaded and not completed)
    useEffect(() => {
        if (!isCompleted && !isLoading && questions.length > 0) {
            const timerId = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [isCompleted, isLoading, questions.length]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionSelect = async (option) => {
        if (!currentQuestion) return;
        
        let isCorrect = option === currentQuestion.correctAnswer;
        
        // Minigames and APD tests are considered correct if completed (any result returned)
        if (currentQuestion.type === 'minigame' || currentQuestion.type === 'apd-test') {
            isCorrect = true;
        }

        const category = currentQuestion.category || 'general';
        const difficulty = currentQuestion.difficulty || 'medium';
        
        // Update answers
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: option,
        }));
        
        // Track if answer was correct
        setAnswerResults((prev) => ({
            ...prev,
            [currentQuestion.id]: isCorrect,
        }));
        
        // Update performance and get new difficulty
        const perfResult = updatePerformance(category, isCorrect, difficulty);
        setPerformance(perfResult.overallProgress);
        
        // Show celebration for correct answers
        if (isCorrect) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 500);
        } else {
            // If wrong, try to get an easier follow-up question
            console.log(`Wrong answer in ${category}. New difficulty: ${perfResult.newDifficulty}`);
            
            // Optionally insert an easier question
            if (perfResult.newDifficulty !== difficulty && currentQuestionIndex < totalQuestions - 1) {
                setIsGeneratingFollowUp(true);
                try {
                    const easierQ = await getEasierQuestion(category, difficulty);
                    if (easierQ) {
                        // Insert easier question after current one
                        const normalizedEasier = normalizeQuestion({
                            ...easierQ,
                            id: Date.now(), // Unique ID
                        });
                        setQuestions(prev => [
                            ...prev.slice(0, currentQuestionIndex + 1),
                            normalizedEasier,
                            ...prev.slice(currentQuestionIndex + 1)
                        ]);
                        console.log('Inserted easier follow-up question');
                    }
                } catch (err) {
                    console.error('Could not get easier question:', err);
                } finally {
                    setIsGeneratingFollowUp(false);
                }
            }
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleFinish = () => {
        setIsCompleted(true);
        // Calculate final score
        const correctCount = Object.values(answerResults).filter(r => r === true).length;
        console.log('Quiz Completed', { 
            answers, 
            answerResults,
            score: `${correctCount}/${Object.keys(answerResults).length}`,
            performance
        });
    };

    // Calculate score
    const correctCount = Object.values(answerResults).filter(r => r === true).length;
    const answeredCount = Object.keys(answerResults).length;

    // Loading state
    if (isLoading) {
        const userName = userData?.fullName?.split(' ')[0] || '';
        return (
            <div style={quizStyles.container}>
                <FloatingShapes />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: '24px',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'spin 1s linear infinite',
                    }}>
                        <Loader2 size={40} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: colors.dark,
                        textAlign: 'center',
                    }}>
                        {userName ? `Hi ${userName}! ` : ''}Creating Your Quiz...
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: colors.gray,
                        textAlign: 'center',
                        maxWidth: '300px',
                    }}>
                        Personalizing questions based on your profile
                    </p>
                </div>
                <style jsx global>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
                `}</style>
            </div>
        );
    }

    if (isCompleted) {
        const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
        const userName = userData?.fullName?.split(' ')[0] || '';
        
        return (
            <div style={quizStyles.container}>
                <FloatingShapes />
                <style jsx global>{`
                    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                    @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
                    @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
                    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
                `}</style>
                <div style={quizStyles.completedCard}>
                    <Confetti />
                    <div style={quizStyles.starsContainer}>
                        {[0, 1, 2].map((i) => {
                            const earned = (i === 0 && scorePercent >= 30) || 
                                          (i === 1 && scorePercent >= 60) || 
                                          (i === 2 && scorePercent >= 80);
                            return (
                                <Star 
                                    key={i} 
                                    size={48}
                                    fill={earned ? colors.yellow : '#e2e8f0'}
                                    color={earned ? colors.yellow : '#cbd5e1'}
                                    style={{ 
                                        ...quizStyles.starBadge, 
                                        animationDelay: `${i * 0.2}s`,
                                        opacity: earned ? 1 : 0.5
                                    }}
                                />
                            );
                        })}
                    </div>
                    <h1 style={quizStyles.completedTitle}>
                        {userName ? `Great Job, ${userName}!` : 'Great Job!'}
                    </h1>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '36px', fontWeight: 700, color: colors.primary, margin: 0 }}>
                            {correctCount} / {answeredCount}
                        </p>
                        <p style={{ fontSize: '16px', color: colors.gray, margin: 0 }}>
                            {scorePercent}% correct
                        </p>
                    </div>
                    <p style={quizStyles.completedText}>
                        Completed in {formatTime(elapsedTime)}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link href="/" style={quizStyles.homeButton}>
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={quizStyles.container}>
            <style jsx global>{`
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
            `}</style>
            
            <FloatingShapes />
            
            {/* Header with Timer */}
            <div style={quizStyles.header}>
                <div style={quizStyles.logo}>
                    <div style={quizStyles.logoIcon}><img src="/logo.svg" alt="Leadis" style={{ width: '100%', height: '100%' }} /></div>
                    <span style={quizStyles.logoText}>Leadis</span>
                </div>
                <div style={quizStyles.timerContainer}>
                    <Clock size={20} color="#6366f1" />
                    <span style={quizStyles.timerText}>
                        {formatTime(elapsedTime)}
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar current={currentQuestionIndex} total={totalQuestions} />

            <div style={quizStyles.mainContent}>
                {/* Question Content */}
                {currentQuestion && questions.length > 0 ? (
                    <div style={quizStyles.questionArea}>
                        <QuizContent
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            selectedAnswer={answers[currentQuestion.id]}
                            onAnswerSelect={handleOptionSelect}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            isFirst={currentQuestionIndex === 0}
                            isLast={currentQuestionIndex === totalQuestions - 1}
                            showCelebration={showCelebration}
                        />
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        color: colors.gray,
                    }}>
                        Loading question...
                    </div>
                )}
            </div>
        </div>
    );
}
