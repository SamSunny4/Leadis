'use client';

import React from 'react';
import { getQuestionType, QuestionType } from '../schema/quizSchema';
import TextQuizContent from './TextQuizContent';
import AudioQuizContent from './AudioQuizContent';
import VisualQuizContent from './VisualQuizContent';
import MinigameQuizContent from './MinigameQuizContent';

/**
 * QuizContent - Main router/factory component for quiz content
 * Dynamically renders the appropriate content component based on question type
 * 
 * @param {Object} props
 * @param {Object} props.question - The question object with type field
 * @param {*} props.selectedAnswer - Currently selected answer
 * @param {Function} props.onAnswerSelect - Callback when answer is selected
 * @param {Function} props.onNext - Callback for next button
 * @param {Function} props.onPrev - Callback for previous button
 * @param {boolean} props.isFirst - Whether this is the first question
 * @param {boolean} props.isLast - Whether this is the last question
 */
export default function QuizContent({
    question,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrev,
    isFirst,
    isLast,
}) {
    const questionType = getQuestionType(question);

    const commonProps = {
        question,
        selectedAnswer,
        onAnswerSelect,
        onNext,
        onPrev,
        isFirst,
        isLast,
    };

    // Route to appropriate content renderer based on type
    switch (questionType) {
        case QuestionType.AUDIO:
            return <AudioQuizContent {...commonProps} />;

        case QuestionType.VISUAL:
            return <VisualQuizContent {...commonProps} />;

        case QuestionType.MINIGAME:
            return <MinigameQuizContent {...commonProps} />;

        case QuestionType.TEXT:
        default:
            return <TextQuizContent {...commonProps} />;
    }
}

/**
 * Re-export question types for convenience
 */
export { QuestionType } from '../schema/quizSchema';
