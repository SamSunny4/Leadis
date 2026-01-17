'use client';

import React from 'react';
import HandMotorAssessment from './vpd/HandMotorAssessment';
import { motion } from 'framer-motion';

export default function InteractiveQuizContent({
    onAnswerSelect,
    onNext,
}) {
    const handleComplete = (data) => {
        console.log('InteractiveQuizContent handleComplete called');
        // Pass the assessment data as the "answer"
        onAnswerSelect(data);
        // Move to next question
        if (onNext) {
            console.log('Calling onNext to advance quiz');
            setTimeout(() => onNext(), 100); // Small delay to ensure state updates
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
        >
            <HandMotorAssessment 
                onComplete={handleComplete}
            />
        </motion.div>
    );
}
