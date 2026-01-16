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
  { id: 5, title: "Family Background", icon: <Users size={20} /> },
  { id: 6, title: "Consent", icon: <Shield size={20} /> },
];

// Default form data structure
const defaultFormData = {
  // Child Details
  childFirstName: '',
  childLastName: '',
  dateOfBirth: '',
  gender: '',
  primaryLanguage: 'english',
  
  // Caregiver Info
  caregiverName: '',
  relationship: '',
  phoneNumber: '',
  email: '',
  
  // Medical History
  birthHistory: '',
  medicalConditions: '',
  currentMedications: '',
  hearingStatus: '',
  visionStatus: '',
  
  // Education
  currentSetting: '',
  gradeClass: '',
  
  // Family Background
  familyHistory: '',
  householdLanguages: '',
  literacyPractices: '',
  
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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
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
    // Save final form data with timestamp
    const submissionData = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(submissionData));
    console.log('Form submitted:', submissionData);
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

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    name="childFirstName"
                    value={formData.childFirstName}
                    onChange={handleChange}
                    placeholder="Enter child's first name"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    name="childLastName"
                    value={formData.childLastName}
                    onChange={handleChange}
                    placeholder="Enter child's last name"
                    style={styles.input}
                    required
                  />
                </div>
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
                  <label style={styles.label}>Primary Caregiver Name</label>
                  <input
                    type="text"
                    name="caregiverName"
                    value={formData.caregiverName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    style={styles.input}
                    required
                  />
                </div>

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
              </div>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <Phone size={16} style={{ marginRight: '8px' }} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    style={styles.input}
                    required
                  />
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
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  placeholder="List any known conditions, diagnoses, or developmental concerns..."
                  style={styles.textarea}
                  rows={3}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Medications (Optional)</label>
                <textarea
                  name="currentMedications"
                  value={formData.currentMedications}
                  onChange={handleChange}
                  placeholder="List any current medications your child is taking..."
                  style={styles.textarea}
                  rows={2}
                />
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
                  <h2 style={styles.sectionTitle}>Education & Services</h2>
                  <p style={styles.sectionSubtitle}>Tell us about your child's learning environment</p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Current Educational Setting</label>
                <div style={styles.radioGroup}>
                  {[
                    { value: 'home', label: 'Home (not in formal education)' },
                    { value: 'daycare', label: 'Daycare / Childcare' },
                    { value: 'preschool', label: 'Preschool / Pre-K' },
                    { value: 'kindergarten', label: 'Kindergarten' },
                    { value: 'elementary', label: 'Elementary School' },
                    { value: 'other', label: 'Other' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      style={{
                        ...styles.radioLabel,
                        border: formData.currentSetting === option.value 
                          ? `2px solid ${colors.primary}` 
                          : `2px solid ${colors.primaryLight}`,
                        boxShadow: formData.currentSetting === option.value 
                          ? `0 0 0 3px ${colors.primary}20, 0 0 15px ${colors.primary}30` 
                          : 'none',
                        backgroundColor: formData.currentSetting === option.value 
                          ? colors.lightBg 
                          : colors.white,
                      }}
                    >
                      <input
                        type="radio"
                        name="currentSetting"
                        value={option.value}
                        checked={formData.currentSetting === option.value}
                        onChange={handleChange}
                        style={styles.radio}
                      />
                      <span style={{
                        ...styles.radioText,
                        fontWeight: formData.currentSetting === option.value ? 600 : 400,
                        color: formData.currentSetting === option.value ? colors.primaryDark : colors.dark,
                      }}>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Grade / Class (if applicable)</label>
                <input
                  type="text"
                  name="gradeClass"
                  value={formData.gradeClass}
                  onChange={handleChange}
                  placeholder="e.g., Grade 1, Pre-K, Nursery"
                  style={styles.input}
                />
              </div>

              <div style={styles.infoBox}>
                <BookOpen size={20} color={colors.primary} />
                <p>Understanding your child's current learning environment helps us tailor the screening activities appropriately.</p>
              </div>
            </div>
          )}

          {/* Step 5: Family Background */}
          {currentStep === 5 && (
            <div style={styles.formSection}>
              <div style={styles.sectionHeader}>
                <Users size={28} color={colors.primary} />
                <div>
                  <h2 style={styles.sectionTitle}>Family & Environmental Factors</h2>
                  <p style={styles.sectionSubtitle}>Background information to help interpret results</p>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Family History of Learning Difficulties</label>
                <p style={styles.labelHelper}>Has anyone in your family experienced learning difficulties?</p>
                <div style={styles.checkboxGroup}>
                  {[
                    'Reading difficulties / Dyslexia',
                    'Writing difficulties',
                    'Math difficulties',
                    'ADHD / Attention issues',
                    'Speech or language delays',
                    'None that I know of',
                  ].map((item) => (
                    <label key={item} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="familyHistory"
                        value={item}
                        checked={formData.familyHistory.includes(item)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            familyHistory: prev.familyHistory.includes(value)
                              ? prev.familyHistory.replace(value + ', ', '').replace(value, '')
                              : prev.familyHistory + (prev.familyHistory ? ', ' : '') + value
                          }));
                        }}
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Household Languages</label>
                <textarea
                  name="householdLanguages"
                  value={formData.householdLanguages}
                  onChange={handleChange}
                  placeholder="Describe the languages spoken in your home and who speaks them..."
                  style={styles.textarea}
                  rows={2}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Literacy Practices at Home</label>
                <p style={styles.labelHelper}>How often do you read with your child?</p>
                <div style={styles.radioGroup}>
                  {[
                    { value: 'daily', label: 'Daily' },
                    { value: 'few-times-week', label: 'A few times a week' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'occasionally', label: 'Occasionally' },
                    { value: 'rarely', label: 'Rarely' },
                  ].map((option) => (
                    <label 
                      key={option.value} 
                      style={{
                        ...styles.radioLabel,
                        border: formData.literacyPractices === option.value 
                          ? `2px solid ${colors.primary}` 
                          : `2px solid ${colors.primaryLight}`,
                        boxShadow: formData.literacyPractices === option.value 
                          ? `0 0 0 3px ${colors.primary}20, 0 0 15px ${colors.primary}30` 
                          : 'none',
                        backgroundColor: formData.literacyPractices === option.value 
                          ? colors.lightBg 
                          : colors.white,
                      }}
                    >
                      <input
                        type="radio"
                        name="literacyPractices"
                        value={option.value}
                        checked={formData.literacyPractices === option.value}
                        onChange={handleChange}
                        style={styles.radio}
                      />
                      <span style={{
                        ...styles.radioText,
                        fontWeight: formData.literacyPractices === option.value ? 600 : 400,
                        color: formData.literacyPractices === option.value ? colors.primaryDark : colors.dark,
                      }}>{option.label}</span>
                    </label>
                  ))}
                </div>
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
