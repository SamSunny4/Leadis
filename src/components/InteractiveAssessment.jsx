import React from 'react';
import HandMotorAssessment from './HandMotorAssessment';

/**
 * Interactive Assessment Module
 * 
 * Simplified to focus on hand motor skills assessment:
 * - Finger counting (3 fingers, 5 fingers)
 * - Hand laterality (left hand, right hand)
 * - Hand positioning (above head, in front of face)
 */
const InteractiveAssessment = ({ 
  onAssessmentComplete,
  ageGroup = '5-7',
  assessmentType = 'full'
}) => {
  return (
    <HandMotorAssessment 
      onComplete={onAssessmentComplete}
    />
  );
};

export default InteractiveAssessment;
