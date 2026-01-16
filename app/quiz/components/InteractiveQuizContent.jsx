'use client';

import React from 'react';
import InteractiveAssessment from '../../../src/components/InteractiveAssessment';
import { motion } from 'framer-motion';

export default function InteractiveQuizContent({
    onAnswerSelect,
}) {
    const handleComplete = (data) => {
        // Pass the assessment data as the "answer"
        onAnswerSelect(data);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%' }}
        >
            <InteractiveAssessment 
                onAssessmentComplete={handleComplete}
                ageGroup="5-7"
                assessmentType="full"
            />
        </motion.div>
    );
}
