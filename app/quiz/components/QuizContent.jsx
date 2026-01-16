'use client';

import React from 'react';
import { getQuestionType, QuestionType } from '../schema/quizSchema';
import TextQuizContent from './TextQuizContent';
import AudioQuizContent from './AudioQuizContent';
import VisualQuizContent from './VisualQuizContent';
import MinigameQuizContent from './MinigameQuizContent';
import APDQuizContent from './APDQuizContent';
import InteractiveQuizContent from './InteractiveQuizContent';

/**
 * QuizContent - Main router/factory component for quiz content
 * Dynamically renders the appropriate content component based on question type
 * Enhanced with kid-friendly props for animations and celebrations
 */
export default function QuizContent({
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
    const questionType = getQuestionType(question);

    const commonProps = {
        question,
        questionNumber,
        selectedAnswer,
        onAnswerSelect,
        onNext,
        onPrev,
        isFirst,
        isLast,
        showCelebration,
    };

    // Route to appropriate content renderer based on type
    switch (questionType) {
        case QuestionType.AUDIO:
            return <AudioQuizContent {...commonProps} />;

        case QuestionType.VISUAL:
            return <VisualQuizContent {...commonProps} />;

        case QuestionType.MINIGAME:
            return <MinigameQuizContent {...commonProps} />;

        case QuestionType.APD_TEST:
            return <APDQuizContent {...commonProps} />;

        case QuestionType.INTERACTIVE_ASSESSMENT:
            return <InteractiveQuizContent {...commonProps} />;

        case QuestionType.TEXT:
        default:
            return <TextQuizContent {...commonProps} />;
    }
}

/**
 * Re-export question types for convenience
 */
export { QuestionType } from '../schema/quizSchema';
