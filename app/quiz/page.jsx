'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';
import questions from './questions.json';
import QuizContent from './components/QuizContent';
import { normalizeQuestion } from './schema/quizSchema';
import { colors, quizStyles } from './styles/quizStyles';

// Normalize all questions to ensure they have type fields
const normalizedQuestions = questions.map(normalizeQuestion);

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
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [elapsedTime, setElapsedTime] = useState(0); // Count up from 0
    const [isCompleted, setIsCompleted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const currentQuestion = normalizedQuestions[currentQuestionIndex];
    const totalQuestions = normalizedQuestions.length;

    // Timer logic - count UP
    useEffect(() => {
        if (!isCompleted) {
            const timerId = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [isCompleted]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionSelect = (option) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: option,
        }));
        // Show brief celebration
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 500);
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
        console.log('Quiz Completed', answers);
    };



    if (isCompleted) {
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
                        {[0, 1, 2].map((i) => (
                            <Star 
                                key={i} 
                                size={48}
                                fill={colors.yellow}
                                color={colors.yellow}
                                style={{ 
                                    ...quizStyles.starBadge, 
                                    animationDelay: `${i * 0.2}s` 
                                }}
                            />
                        ))}
                    </div>
                    <h1 style={quizStyles.completedTitle}>Great Job!</h1>
                    <p style={quizStyles.completedText}>
                        You completed the quiz in {formatTime(elapsedTime)}!<br/>
                        Thank you for participating.
                    </p>
                    <Link href="/" style={quizStyles.homeButton}>
                        Return Home
                    </Link>
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
                    <div style={quizStyles.logoIcon}>L</div>
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
            </div>
        </div>
    );
}
