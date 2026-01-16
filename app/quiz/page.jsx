'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import questions from './questions.json';
import QuizContent from './components/QuizContent';
import { normalizeQuestion } from './schema/quizSchema';
import { colors, quizStyles } from './styles/quizStyles';

// Normalize all questions to ensure they have type fields
const normalizedQuestions = questions.map(normalizeQuestion);

export default function QuizPage() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes in seconds
    const [isCompleted, setIsCompleted] = useState(false);

    const currentQuestion = normalizedQuestions[currentQuestionIndex];
    const totalQuestions = normalizedQuestions.length;

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0 && !isCompleted) {
            const timerId = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else if (timeLeft === 0) {
            handleFinish();
        }
    }, [timeLeft, isCompleted]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionSelect = (option) => {
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: option,
        }));
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
        // Here you would typically save the results
        console.log('Quiz Completed', answers);
    };

    if (isCompleted) {
        return (
            <div style={quizStyles.container}>
                <div style={quizStyles.completedCard}>
                    <CheckCircle size={64} color={colors.primary} style={{ marginBottom: '20px' }} />
                    <h1 style={quizStyles.completedTitle}>Quiz Completed!</h1>
                    <p style={quizStyles.completedText}>Thank you for completing the screening quiz.</p>
                    <Link href="/" style={quizStyles.homeButton}>
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={quizStyles.container}>
            {/* Header with Timer */}
            <div style={quizStyles.header}>
                <div style={quizStyles.logo}>
                    <div style={quizStyles.logoIcon}>L</div>
                    <span style={quizStyles.logoText}>Leadis</span>
                </div>
                <div style={quizStyles.timerContainer}>
                    <Clock size={20} color={colors.dark} />
                    <span style={quizStyles.timerText}>{formatTime(timeLeft)}</span>
                </div>
            </div>

		<div style={quizStyles.mainContent}>
                {/* Left Sidebar (Visual/Progress) */}
               
                {/* Right Content - Abstracted Quiz Content */}
                <div style={quizStyles.questionArea || { flex: 1 }}>
                    <QuizContent
                        question={currentQuestion}
                        selectedAnswer={answers[currentQuestion.id]}
                        onAnswerSelect={handleOptionSelect}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        isFirst={currentQuestionIndex === 0}
                        isLast={currentQuestionIndex === totalQuestions - 1}
                    />
                </div>
            </div>
        </div>
    );
}
