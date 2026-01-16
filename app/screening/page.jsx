'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  Phone,
  Mail,
  Heart,
  BookOpen,
  Users,
  Shield,
  Check,
  Smile
} from 'lucide-react';

// LocalStorage key for form data
const STORAGE_KEY = 'leadis_screening_form';

// ML Encoding Map
const ML_ENCODING = {
  gender: { "male": 0, "female": 1, "other": 2, "prefer-not-to-say": 3 },
  primaryLanguage: { "english": 0 },
  multilingualExposure: { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4 },
  relationship: { "mother": 0, "father": 1, "grandparent": 2, "guardian": 3, "other": 4 },
  birthHistory: { "full-term": 0, "preterm": 1, "nicu": 2, "complications": 3, "unknown": 4 },
  hearingStatus: { "normal": 0, "tested-normal": 0, "concerns": 1, "diagnosed": 2, "not-tested": 3 },
  visionStatus: { "normal": 0, "tested-normal": 0, "glasses": 1, "concerns": 2, "not-tested": 3 },
  educationalSetting: { "not-enrolled": 0, "daycare": 1, "preschool-kindergarten": 2, "school": 3, "homeschooling": 4, "other": 5 },
  currentGrade: { "not-applicable": 0, "preschool": 1, "kindergarten": 2, "1": 3, "2": 4, "3": 5, "4": 6, "5": 7, "6+": 8 },
  mediumOfInstruction: { "english": 0, "regional": 1, "bilingual": 2, "other": 3 },
  learningExperience: { "similar": 0, "slightly-slower": 1, "much-slower": 2, "highly-variable": 3, "not-sure": 4 },
  ageFirstWordMonths: { "6": 6, "9": 9, "12": 12, "15": 15, "18": 18, "24": 24, "30": 30, "36": 36, "48": 48, "0": 0 },
  ageFirstSentenceMonths: { "12": 12, "18": 18, "24": 24, "30": 30, "36": 36, "48": 48, "60": 60, "0": 0 },
  historySpeechTherapy: { "0": 0, "1": 1, "2": 2, "3": 3 },
  historyMotorDelay: { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4 },
  familyADHD: { "no-history": 0, "one-parent": 1, "both-parents": 2, "siblings": 3, "unsure": 4 },
  // Array encodings
  medicalConditions: { "Autism Spectrum Disorder (ASD)": 0, "ADHD": 1, "Dyslexia": 2, "Speech delay": 3, "Motor coordination issues": 4, "Sensory processing disorder": 5, "Developmental delay": 6, "Anxiety": 7, "Other diagnosed condition": 8, "None": 9 },
  learningSupport: { "special-education": 0, "resource-room": 1, "tutoring": 2, "speech-support": 3, "occupational-therapy": 4, "no-support": 5, "unsure": 6 },
  academicDifficulties: { "following-instructions": 0, "reading": 1, "writing": 2, "math": 3, "attention": 4, "memory": 5, "none": 6, "unsure": 7 },
  familyLearningDifficulty: { "no-history": 0, "reading": 1, "writing": 2, "math": 3, "general": 4, "multiple": 5, "unsure": 6 }
};

// Encode form data for ML processing
const encodeFormDataForML = (formData) => {
  const encoded = { ...formData };
  
  // Calculate age in months from DOB
  if (formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const ageMonths = Math.floor((Date.now() - birthDate) / (1000 * 60 * 60 * 24 * 30.44));
    encoded.age_months = ageMonths;
  }
  
  // Encode single-value fields
  Object.keys(ML_ENCODING).forEach(field => {
    if (formData[field] !== undefined && formData[field] !== '' && !Array.isArray(formData[field])) {
      encoded[`${field}_encoded`] = ML_ENCODING[field][formData[field]] ?? null;
    }
  });
  
  // Encode medical conditions (comma-separated to binary vector)
  if (formData.medicalConditions) {
    const conditions = formData.medicalConditions.split(',').map(c => c.trim());
    const vector = Array(10).fill(0);
    conditions.forEach(condition => {
      const index = ML_ENCODING.medicalConditions[condition];
      if (index !== undefined) vector[index] = 1;
    });
    encoded.medicalConditions_encoded = vector;
  }
  
  // Encode array fields to binary vectors
  ['learningSupport', 'academicDifficulties', 'familyLearningDifficulty'].forEach(field => {
    if (Array.isArray(formData[field])) {
      const maxLength = Object.keys(ML_ENCODING[field]).length;
      const vector = Array(maxLength).fill(0);
      formData[field].forEach(value => {
        const index = ML_ENCODING[field][value];
        if (index !== undefined) vector[index] = 1;
      });
      encoded[`${field}_encoded`] = vector;
    }
  });
  
  // Add concern flags
  encoded.vision_concern_flag = ['concerns', 'not-tested'].includes(formData.visionStatus) ? 1 : 0;
  encoded.hearing_concern_flag = ['concerns', 'diagnosed', 'not-tested'].includes(formData.hearingStatus) ? 1 : 0;
  
  return encoded;
};

// Fun color palette - Light Green Theme
const colors = {
  primary: '#22c55e',
  primaryLight: '#86efac',
  primaryDark: '#16a34a',
  accent: '#fbbf24',
  accentPink: '#f472b6',
  accentBlue: '#38bdf8',
  accentOrange: '#fb923c',
  dark: '#1e293b',
  gray: '#64748b',
  lightBg: '#f0fdf4',
  white: '#ffffff',
};

// Form steps configuration
const formSteps = [
  { id: 1, title: "Child Details", icon: <User size={20} /> },
  { id: 2, title: "Caregiver Info", icon: <Users size={20} /> },
  { id: 3, title: "Medical History", icon: <Heart size={20} /> },
  { id: 4, title: "Education", icon: <BookOpen size={20} /> },
  { id: 5, title: "Developmental History", icon: <Heart size={20} /> },
  { id: 6, title: "Consent", icon: <Shield size={20} /> },
];

// Default form data structure
const defaultFormData = {
  // Child Details
  fullName: '',
  dateOfBirth: '',
  gender: '',
  primaryLanguage: 'english',
  multilingualExposure: '',
  
  // Caregiver Info
  relationship: '',
  email: '',
  
  // Medical History
  birthHistory: '',
  medicalConditions: '',
  hearingStatus: '',
  visionStatus: '',
  
  // Education
  educationalSetting: '',
  currentGrade: '',
  mediumOfInstruction: '',
  learningSupport: [],
  learningExperience: '',
  academicDifficulties: [],
  
  // Developmental History
  ageFirstWordMonths: '',
  ageFirstSentenceMonths: '',
  historySpeechTherapy: '',
  historyMotorDelay: '',
  familyLearningDifficulty: [],
  familyADHD: '',
  
  // Consent
  dataConsent: false,
};

export default function ScreeningForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(defaultFormData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load form data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData({ ...defaultFormData, ...parsedData });
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        const encodedData = encodeFormDataForML(formData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(encodedData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  }, [formData, isLoaded]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    if (currentStep < formSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Encode form data for ML processing
    const encodedData = encodeFormDataForML(formData);
    
    // Save final form data with timestamp and ML encodings
    const submissionData = {
      ...encodedData,
      submittedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissionData));
    console.log('Form submitted (ML-encoded):', submissionData);
    console.log('Original form data:', formData);
    // TODO: Navigate to assessment page
  };

  // Clear saved form data
  const clearFormData = () => {
    setFormData(defaultFormData);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} years, ${months} months`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Smile size={24} color={colors.white} />
          </div>
          <span style={styles.logoText}>Leadis</span>
        </div>
      </header>

      {/* Progress Steps */}
      <div style={styles.progressContainer}>
        <div style={styles.progressSteps}>
          {formSteps.map((step, index) => (
            <div key={step.id} style={styles.stepWrapper}>
              <motion.div
                onClick={() => setCurrentStep(step.id)}
                style={{
                  ...styles.stepCircle,
                  backgroundColor: currentStep >= step.id ? colors.primary : colors.white,
                  borderColor: currentStep >= step.id ? colors.primary : '#e2e8f0',
                  color: currentStep >= step.id ? colors.white : colors.gray,
                  cursor: 'pointer',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentStep > step.id ? <Check size={18} /> : step.icon}
              </motion.div>
              <span 
                onClick={() => setCurrentStep(step.id)}
                style={{
                  ...styles.stepLabel,
                  color: currentStep >= step.id ? colors.primary : colors.gray,
                  fontWeight: currentStep === step.id ? 700 : 500,
                  cursor: 'pointer',
                }}>
                {step.title}
              </span>
              {index < formSteps.length - 1 && (
                <div style={{
                  ...styles.stepConnector,
                  backgroundColor: currentStep > step.id ? colors.primary : '#e2e8f0',
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        style={styles.formContainer}
      >
        <form onSubmit={handleSubmit}>
          {/* Step 1: Child Details */}
          {currentStep === 1 && (
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <User size={28} color={colors.primary} />
                <div>
                  <h2 style={styles.sectionTitle}>Child Details</h2>
                  <p style={styles.sectionSubtitle}>Tell us about your child</p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Child's Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter child's full name"
                  style={styles.input}
                  required
                />
                <p style={styles.helperText}>
                  Full name helps personalize the screening experience
                </p>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Calendar size={16} style={{ marginRight: '8px' }} />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    style={styles.dateInput}
                    required
                  />
                  {formData.dateOfBirth && (
                    <p style={styles.helperText}>
                      Age: {calculateAge(formData.dateOfBirth)}
                    </p>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Sex / Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    style={styles.select}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Primary Language</label>
                <select
                  name="primaryLanguage"
                  value={formData.primaryLanguage}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="english">English</option>
                </select>
                <p style={styles.helperText}>
                  More languages coming soon
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Multilingual Exposure</label>
                <p style={styles.labelHelper}>Is your child exposed to more than one language?</p>
                <select
                  name="multilingualExposure"
                  value={formData.multilingualExposure}
                  onChange={handleChange}
                  style={styles.select}
                  required
                >
                  <option value="">Select exposure level</option>
                  <option value="0">Monolingual (one language only)</option>
                  <option value="1">Minimal (occasional exposure)</option>
                  <option value="2">Moderate (regular but not daily)</option>
                  <option value="3">High (daily exposure to 2+ languages)</option>
                  <option value="4">Native bilingual (equal fluency in 2+ languages)</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Caregiver Info */}
          {currentStep === 2 && (
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <Users size={28} color={colors.primary} />
                <div>
                  <h2 style={styles.sectionTitle}>Caregiver Information</h2>
                  <p style={styles.sectionSubtitle}>Your contact details</p>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Relationship to Child</label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    style={styles.select}
                    required
                  >
                    <option value="">Select relationship</option>
                    <option value="mother">Mother</option>
                    <option value="father">Father</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="guardian">Guardian</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Mail size={16} style={{ marginRight: '8px' }} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.infoBox}>
                <Shield size={20} color={colors.primary} />
                <p>Your contact information is kept secure and will only be used to share screening results with you.</p>
              </div>
            </div>
          )}

          {/* Step 3: Medical History */}
          {currentStep === 3 && (
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <Heart size={28} color={colors.primary} />
                <div>
                  <h2 style={styles.sectionTitle}>Medical & Developmental History</h2>
                  <p style={styles.sectionSubtitle}>Help us understand your child's health background</p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Birth History</label>
                <select
                  name="birthHistory"
                  value={formData.birthHistory}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="">Select birth history</option>
                  <option value="full-term">Full term (37+ weeks)</option>
                  <option value="preterm">Preterm (before 37 weeks)</option>
                  <option value="nicu">Required NICU stay</option>
                  <option value="complications">Birth complications</option>
                  <option value="unknown">Unknown / Prefer not to say</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Known Medical Conditions or Diagnoses (Optional)</label>
                <div style={styles.checkboxGroup}>
                  {[
                    'Autism Spectrum Disorder (ASD)',
                    'ADHD',
                    'Dyslexia',
                    'Speech delay',
                    'Motor coordination issues',
                    'Sensory processing disorder',
                    'Developmental delay',
                    'Anxiety',
                    'Other diagnosed condition',
                    'None',
                  ].map((item) => (
                    <label key={item} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="medicalConditions"
                        value={item}
                        checked={formData.medicalConditions.includes(item)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            medicalConditions: prev.medicalConditions.includes(value)
                              ? prev.medicalConditions.replace(value + ', ', '').replace(value, '')
                              : prev.medicalConditions + (prev.medicalConditions ? ', ' : '') + value
                          }));
                        }}
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Hearing Status</label>
                  <select
                    name="hearingStatus"
                    value={formData.hearingStatus}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select hearing status</option>
                    <option value="normal">No concerns</option>
                    <option value="tested-normal">Tested - Normal</option>
                    <option value="concerns">Some concerns</option>
                    <option value="diagnosed">Diagnosed hearing issue</option>
                    <option value="not-tested">Not tested</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Vision Status</label>
                  <select
                    name="visionStatus"
                    value={formData.visionStatus}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select vision status</option>
                    <option value="normal">No concerns</option>
                    <option value="tested-normal">Tested - Normal</option>
                    <option value="glasses">Wears glasses</option>
                    <option value="concerns">Some concerns</option>
                    <option value="not-tested">Not tested</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Education */}
          {currentStep === 4 && (
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <BookOpen size={28} color={colors.primary} />
                <div>
                  <h2 style={styles.sectionTitle}>Education & Learning Environment</h2>
                  <p style={styles.sectionSubtitle}>Tell us about your child's educational setting and learning experience</p>
                </div>
              </div>

              {/* 1. Current Educational Setting */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Current Educational Setting</label>
                <p style={styles.labelHelper}>What is your child's current learning environment?</p>
                <div style={styles.radioGroup}>
                  {[
                    { value: 'not-enrolled', label: 'Not enrolled / At home' },
                    { value: 'daycare', label: 'Daycare' },
                    { value: 'preschool-kindergarten', label: 'Preschool / Kindergarten' },
                    { value: 'school', label: 'School' },
                    { value: 'homeschooling', label: 'Homeschooling' },
                    { value: 'other', label: 'Other (specify)' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      style={{
                        ...styles.radioLabel,
                        border: formData.educationalSetting === option.value 
                          ? `2px solid ${colors.primary}` 
                          : `2px solid ${colors.primaryLight}`,
                        boxShadow: formData.educationalSetting === option.value 
                          ? `0 0 0 3px ${colors.primary}20, 0 0 15px ${colors.primary}30` 
                          : 'none',
                        backgroundColor: formData.educationalSetting === option.value 
                          ? colors.lightBg 
                          : colors.white,
                      }}
                    >
                      <input
                        type="radio"
                        name="educationalSetting"
                        value={option.value}
                        checked={formData.educationalSetting === option.value}
                        onChange={handleChange}
                        style={styles.radio}
                      />
                      <span style={{
                        ...styles.radioText,
                        fontWeight: formData.educationalSetting === option.value ? 600 : 400,
                        color: formData.educationalSetting === option.value ? colors.primaryDark : colors.dark,
                      }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. Current Grade or Level (conditional) */}
              {['preschool-kindergarten', 'school', 'homeschooling'].includes(formData.educationalSetting) && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Grade or Level</label>
                  <select
                    name="currentGrade"
                    value={formData.currentGrade}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select grade/level</option>
                    <option value="not-applicable">Not applicable</option>
                    <option value="preschool">Preschool</option>
                    <option value="kindergarten">Kindergarten</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6+">Grade 6 or above</option>
                  </select>
                </div>
              )}

              {/* 3. Medium of Instruction */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Medium of Instruction</label>
                <p style={styles.labelHelper}>What is the primary language of instruction?</p>
                <div style={styles.radioGroup}>
                  {[
                    { value: 'english', label: 'English' },
                    { value: 'regional', label: 'Regional language' },
                    { value: 'bilingual', label: 'Bilingual' },
                    { value: 'other', label: 'Other (specify)' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      style={{
                        ...styles.radioLabel,
                        border: formData.mediumOfInstruction === option.value 
                          ? `2px solid ${colors.primary}` 
                          : `2px solid ${colors.primaryLight}`,
                        boxShadow: formData.mediumOfInstruction === option.value 
                          ? `0 0 0 3px ${colors.primary}20, 0 0 15px ${colors.primary}30` 
                          : 'none',
                        backgroundColor: formData.mediumOfInstruction === option.value 
                          ? colors.lightBg 
                          : colors.white,
                      }}
                    >
                      <input
                        type="radio"
                        name="mediumOfInstruction"
                        value={option.value}
                        checked={formData.mediumOfInstruction === option.value}
                        onChange={handleChange}
                        style={styles.radio}
                      />
                      <span style={{
                        ...styles.radioText,
                        fontWeight: formData.mediumOfInstruction === option.value ? 600 : 400,
                        color: formData.mediumOfInstruction === option.value ? colors.primaryDark : colors.dark,
                      }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. Learning Support or Services Received */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Learning Support or Services Received</label>
                <p style={styles.labelHelper}>Is your child currently receiving any educational support services?</p>
                <div style={styles.checkboxGroup}>
                  {[
                    { value: 'special-education', label: 'Special education support' },
                    { value: 'resource-room', label: 'Resource room / remedial classes' },
                    { value: 'tutoring', label: 'One-on-one tutoring' },
                    { value: 'speech-support', label: 'Speech or language support (school-based)' },
                    { value: 'occupational-therapy', label: 'Occupational therapy (school-based)' },
                    { value: 'no-support', label: 'No additional support' },
                    { value: 'unsure', label: 'Unsure' },
                  ].map((option) => {
                    const isNoSupport = formData.learningSupport.includes('no-support');
                    const isDisabled = isNoSupport && option.value !== 'no-support';
                    
                    return (
                      <label 
                        key={option.value} 
                        style={{
                          ...styles.checkboxLabel,
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          name="learningSupport"
                          value={option.value}
                          checked={formData.learningSupport.includes(option.value)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => {
                              let newValues = [...prev.learningSupport];
                              
                              if (value === 'no-support') {
                                newValues = e.target.checked ? ['no-support'] : [];
                              } else {
                                if (e.target.checked) {
                                  newValues = newValues.filter(v => v !== 'no-support');
                                  newValues.push(value);
                                } else {
                                  newValues = newValues.filter(v => v !== value);
                                }
                              }
                              
                              return { ...prev, learningSupport: newValues };
                            });
                          }}
                          style={styles.checkbox}
                        />
                        <span style={styles.checkboxText}>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. Learning Experience at School / Learning Center */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Learning Experience at School / Learning Center</label>
                <p style={styles.labelHelper}>How does your child generally manage learning tasks compared to peers?</p>
                <div style={styles.radioGroup}>
                  {[
                    { value: 'similar', label: 'Similar to peers' },
                    { value: 'slightly-slower', label: 'Slightly slower than peers' },
                    { value: 'much-slower', label: 'Much slower than peers' },
                    { value: 'highly-variable', label: 'Highly variable (sometimes good, sometimes difficult)' },
                    { value: 'not-sure', label: 'Not sure' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      style={{
                        ...styles.radioLabel,
                        border: formData.learningExperience === option.value 
                          ? `2px solid ${colors.primary}` 
                          : `2px solid ${colors.primaryLight}`,
                        boxShadow: formData.learningExperience === option.value 
                          ? `0 0 0 3px ${colors.primary}20, 0 0 15px ${colors.primary}30` 
                          : 'none',
                        backgroundColor: formData.learningExperience === option.value 
                          ? colors.lightBg 
                          : colors.white,
                      }}
                    >
                      <input
                        type="radio"
                        name="learningExperience"
                        value={option.value}
                        checked={formData.learningExperience === option.value}
                        onChange={handleChange}
                        style={styles.radio}
                      />
                      <span style={{
                        ...styles.radioText,
                        fontWeight: formData.learningExperience === option.value ? 600 : 400,
                        color: formData.learningExperience === option.value ? colors.primaryDark : colors.dark,
                      }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. Areas of Academic Difficulty (If Any) */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Areas of Academic Difficulty (If Any)</label>
                <p style={styles.labelHelper}>Which areas does your child currently find challenging?</p>
                <div style={styles.checkboxGroup}>
                  {[
                    { value: 'following-instructions', label: 'Following instructions' },
                    { value: 'reading', label: 'Reading or letter recognition' },
                    { value: 'writing', label: 'Writing or fine motor tasks' },
                    { value: 'math', label: 'Math or number understanding' },
                    { value: 'attention', label: 'Attention during learning' },
                    { value: 'memory', label: 'Memory or recall' },
                    { value: 'none', label: 'None observed' },
                    { value: 'unsure', label: 'Unsure' },
                  ].map((option) => {
                    const isNone = formData.academicDifficulties.includes('none');
                    const isDisabled = isNone && option.value !== 'none';
                    
                    return (
                      <label 
                        key={option.value} 
                        style={{
                          ...styles.checkboxLabel,
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          name="academicDifficulties"
                          value={option.value}
                          checked={formData.academicDifficulties.includes(option.value)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => {
                              let newValues = [...prev.academicDifficulties];
                              
                              if (value === 'none') {
                                newValues = e.target.checked ? ['none'] : [];
                              } else {
                                if (e.target.checked) {
                                  newValues = newValues.filter(v => v !== 'none');
                                  newValues.push(value);
                                } else {
                                  newValues = newValues.filter(v => v !== value);
                                }
                              }
                              
                              return { ...prev, academicDifficulties: newValues };
                            });
                          }}
                          style={styles.checkbox}
                        />
                        <span style={styles.checkboxText}>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={styles.infoBox}>
                <BookOpen size={20} color={colors.primary} />
                <p>Understanding your child's learning environment and experiences helps us provide more accurate screening and appropriate recommendations.</p>
              </div>
            </div>
          )}

          {/* Step 5: Developmental History */}
          {currentStep === 5 && (
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <Heart size={28} color={colors.primary} />
                <div>
                  <h2 style={styles.sectionTitle}>Developmental History</h2>
                  <p style={styles.sectionSubtitle}>Important milestones and family history</p>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Age of First Word</label>
                  <p style={styles.labelHelper}>When did your child say their first meaningful word?</p>
                  <select
                    name="ageFirstWordMonths"
                    value={formData.ageFirstWordMonths}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select age</option>
                    <option value="6">6 months or earlier</option>
                    <option value="9">7-9 months</option>
                    <option value="12">10-12 months (typical)</option>
                    <option value="15">13-15 months</option>
                    <option value="18">16-18 months</option>
                    <option value="24">19-24 months</option>
                    <option value="30">25-30 months</option>
                    <option value="36">31-36 months (3 years)</option>
                    <option value="48">Over 3 years</option>
                    <option value="0">Not yet / Don't remember</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Age of First Sentence</label>
                  <p style={styles.labelHelper}>When did your child combine 2-3 words?</p>
                  <select
                    name="ageFirstSentenceMonths"
                    value={formData.ageFirstSentenceMonths}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select age</option>
                    <option value="12">12 months or earlier</option>
                    <option value="18">13-18 months</option>
                    <option value="24">19-24 months (typical)</option>
                    <option value="30">25-30 months</option>
                    <option value="36">31-36 months (3 years)</option>
                    <option value="48">3-4 years</option>
                    <option value="60">Over 4 years</option>
                    <option value="0">Not yet / Don't remember</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>History of Speech Therapy</label>
                  <select
                    name="historySpeechTherapy"
                    value={formData.historySpeechTherapy}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select status</option>
                    <option value="0">No - Never received</option>
                    <option value="1">Yes - Currently in therapy</option>
                    <option value="2">Yes - Completed in the past</option>
                    <option value="3">Recommended but not started</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>History of Motor Delay</label>
                  <p style={styles.labelHelper}>Delays in crawling, walking, or coordination</p>
                  <select
                    name="historyMotorDelay"
                    value={formData.historyMotorDelay}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select status</option>
                    <option value="0">No motor concerns</option>
                    <option value="1">Mild delay (within 3 months)</option>
                    <option value="2">Moderate delay (3-6 months)</option>
                    <option value="3">Significant delay (6+ months)</option>
                    <option value="4">Currently receiving therapy</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Family History of Learning Difficulties</label>
                <p style={styles.labelHelper}>Has anyone in your immediate family (parents or siblings) had diagnosed or long-standing learning difficulties?</p>
                <div style={styles.checkboxGroup}>
                  {[
                    { value: 'no-history', label: 'No known family history' },
                    { value: 'reading', label: 'Reading-related learning difficulties' },
                    { value: 'writing', label: 'Writing-related learning difficulties' },
                    { value: 'math', label: 'Math-related learning difficulties' },
                    { value: 'general', label: 'General learning difficulties' },
                    { value: 'multiple', label: 'Multiple types of learning difficulties' },
                    { value: 'unsure', label: 'Unsure / Prefer not to say' },
                  ].map((option) => {
                    const isNoHistory = formData.familyLearningDifficulty.includes('no-history');
                    const isDisabled = isNoHistory && option.value !== 'no-history';
                    
                    return (
                      <label 
                        key={option.value} 
                        style={{
                          ...styles.checkboxLabel,
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          name="familyLearningDifficulty"
                          value={option.value}
                          checked={formData.familyLearningDifficulty.includes(option.value)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const value = e.target.value;
                            setFormData(prev => {
                              let newValues = [...prev.familyLearningDifficulty];
                              
                              if (value === 'no-history') {
                                // If selecting "no history", clear all others
                                newValues = e.target.checked ? ['no-history'] : [];
                              } else {
                                // If selecting another option, remove "no history"
                                if (e.target.checked) {
                                  newValues = newValues.filter(v => v !== 'no-history');
                                  newValues.push(value);
                                } else {
                                  newValues = newValues.filter(v => v !== value);
                                }
                              }
                              
                              return { ...prev, familyLearningDifficulty: newValues };
                            });
                          }}
                          style={styles.checkbox}
                        />
                        <span style={styles.checkboxText}>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Family History of Attention Difficulties</label>
                <p style={styles.labelHelper}>Has anyone in your immediate family been diagnosed with ADHD or long-term attention difficulties?</p>
                <div style={styles.radioGroup}>
                  {[
                    { value: 'no-history', label: 'No known family history' },
                    { value: 'one-parent', label: 'Yes – one parent' },
                    { value: 'both-parents', label: 'Yes – both parents' },
                    { value: 'siblings', label: 'Yes – sibling(s)' },
                    { value: 'unsure', label: 'Unsure / Prefer not to say' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      style={{
                        ...styles.radioLabel,
                        border: formData.familyADHD === option.value 
                          ? `2px solid ${colors.primary}` 
                          : `2px solid ${colors.primaryLight}`,
                        boxShadow: formData.familyADHD === option.value 
                          ? `0 0 0 3px ${colors.primary}20, 0 0 15px ${colors.primary}30` 
                          : 'none',
                        backgroundColor: formData.familyADHD === option.value 
                          ? colors.lightBg 
                          : colors.white,
                      }}
                    >
                      <input
                        type="radio"
                        name="familyADHD"
                        value={option.value}
                        checked={formData.familyADHD === option.value}
                        onChange={handleChange}
                        style={styles.radio}
                      />
                      <span style={{
                        ...styles.radioText,
                        fontWeight: formData.familyADHD === option.value ? 600 : 400,
                        color: formData.familyADHD === option.value ? colors.primaryDark : colors.dark,
                      }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.infoBox}>
                <Heart size={20} color={colors.primary} />
                <p>Developmental milestones and family history help us understand potential genetic and environmental factors that may influence learning patterns.</p>
              </div>
            </div>
          )}

          {/* Step 6: Consent */}
          {currentStep === 6 && (
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <Shield size={28} color={colors.primary} />
                <div>
                  <h2 style={styles.sectionTitle}>Consent & Privacy</h2>
                  <p style={styles.sectionSubtitle}>Review and provide your consent</p>
                </div>
              </div>

              <div style={styles.consentBox}>
                <h3 style={styles.consentTitle}>Data Usage Consent</h3>
                <div style={styles.consentContent}>
                  <p>By proceeding with this screening, you acknowledge and agree to the following:</p>
                  <ul style={styles.consentList}>
                    <li>The screening results are for informational purposes only and do not constitute a medical diagnosis.</li>
                    <li>Your child's data will be processed securely and used solely for generating the screening report.</li>
                    <li>We will not share your personal information with third parties without your explicit consent.</li>
                    <li>You may request deletion of your data at any time by contacting us.</li>
                    <li>For any concerns indicated by the screening, we recommend consulting a qualified healthcare professional.</li>
                  </ul>
                </div>

                <label style={styles.consentCheckbox}>
                  <input
                    type="checkbox"
                    name="dataConsent"
                    checked={formData.dataConsent}
                    onChange={handleChange}
                    style={styles.checkbox}
                    required
                  />
                  <span style={styles.consentCheckboxText}>
                    I have read and agree to the above terms. I consent to the use of my child's screening data as described.
                  </span>
                </label>
              </div>

              <div style={styles.summaryBox}>
                <h4 style={styles.summaryTitle}>Ready to Start?</h4>
                <p style={styles.summaryText}>
                  After submitting this form, your child will begin the fun, interactive screening activities. 
                  The assessment takes approximately 15-20 minutes to complete.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={styles.buttonGroup}>
            {currentStep > 1 && (
              <motion.button
                type="button"
                onClick={prevStep}
                style={styles.secondaryButton}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={20} />
                Previous
              </motion.button>
            )}

            {currentStep < formSteps.length ? (
              <motion.button
                type="button"
                onClick={nextStep}
                style={styles.primaryButton}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Next Step
                <ArrowRight size={20} />
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                style={{
                  ...styles.primaryButton,
                  opacity: formData.dataConsent ? 1 : 0.5,
                  cursor: formData.dataConsent ? 'pointer' : 'not-allowed',
                }}
                disabled={!formData.dataConsent}
                whileHover={formData.dataConsent ? { scale: 1.02 } : {}}
                whileTap={formData.dataConsent ? { scale: 0.98 } : {}}
              >
                Start Screening
                <ArrowRight size={20} />
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.white,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 60px',
    borderBottom: `2px solid ${colors.lightBg}`,
    backgroundColor: colors.white,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.gray,
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 700,
    color: colors.dark,
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  progressContainer: {
    padding: '40px 60px',
    backgroundColor: colors.lightBg,
    borderBottom: `2px solid ${colors.primaryLight}`,
  },
  progressSteps: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '900px',
    margin: '0 auto',
  },
  stepWrapper: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  stepLabel: {
    position: 'absolute',
    bottom: '-28px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    transition: 'all 0.3s',
  },
  stepConnector: {
    width: '80px',
    height: '3px',
    marginLeft: '8px',
    marginRight: '8px',
    borderRadius: '2px',
    transition: 'all 0.3s',
  },
  formContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '60px 40px 100px',
  },
  formSection: {
    backgroundColor: colors.white,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '40px',
    paddingBottom: '20px',
    borderBottom: `2px solid ${colors.lightBg}`,
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '4px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  sectionSubtitle: {
    fontSize: '15px',
    color: colors.gray,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '24px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    fontWeight: 600,
    color: colors.dark,
    marginBottom: '10px',
  },
  labelHelper: {
    fontSize: '14px',
    color: colors.gray,
    marginBottom: '12px',
    marginTop: '-4px',
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
    fontFamily: 'inherit',
  },
  dateInput: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
    fontFamily: 'inherit',
    colorScheme: 'light',
    accentColor: colors.primary,
    cursor: 'pointer',
  },
  select: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  helperText: {
    fontSize: '13px',
    color: colors.primary,
    marginTop: '8px',
    fontWeight: 500,
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
  },
  radio: {
    width: '20px',
    height: '20px',
    accentColor: colors.primary,
    cursor: 'pointer',
  },
  radioText: {
    fontSize: '15px',
    color: colors.dark,
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '14px 16px',
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: colors.primary,
    cursor: 'pointer',
    marginTop: '2px',
    flexShrink: 0,
  },
  checkboxText: {
    fontSize: '14px',
    color: colors.dark,
    lineHeight: 1.4,
  },
  infoBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '20px',
    backgroundColor: colors.lightBg,
    borderRadius: '16px',
    marginTop: '32px',
    fontSize: '14px',
    color: colors.gray,
    lineHeight: 1.6,
  },
  consentBox: {
    padding: '28px',
    backgroundColor: colors.lightBg,
    borderRadius: '20px',
    marginBottom: '32px',
  },
  consentTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '16px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  consentContent: {
    fontSize: '14px',
    color: colors.gray,
    lineHeight: 1.7,
    marginBottom: '24px',
  },
  consentList: {
    marginTop: '12px',
    marginLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  consentCheckbox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '18px',
    backgroundColor: colors.white,
    borderRadius: '12px',
    cursor: 'pointer',
    border: `2px solid ${colors.primaryLight}`,
  },
  consentCheckboxText: {
    fontSize: '15px',
    color: colors.dark,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  summaryBox: {
    padding: '24px',
    backgroundColor: `${colors.primary}10`,
    borderRadius: '16px',
    border: `2px solid ${colors.primaryLight}`,
  },
  summaryTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: colors.primary,
    marginBottom: '8px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  summaryText: {
    fontSize: '14px',
    color: colors.gray,
    lineHeight: 1.6,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '48px',
    paddingTop: '32px',
    borderTop: `2px solid ${colors.lightBg}`,
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '16px 32px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
    marginLeft: 'auto',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: colors.white,
    color: colors.dark,
    border: `2px solid ${colors.primaryLight}`,
    padding: '16px 32px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
