'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  BookOpen,
  PenTool,
  Ear,
  Calculator,
  Eye,
  Check,
  Smile,
  ChevronRight
} from 'lucide-react';

// Fun color palette - Light Green Theme (matching home page)
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

// Available specific tests
const specificTests = [
  {
    id: 'reading',
    title: 'Reading Disability Screening',
    description: 'Assess reading comprehension, letter recognition, phonological awareness, and decoding skills',
    icon: <BookOpen size={32} />,
    color: colors.primary,
    difficulty: 'reading',
  },
  {
    id: 'writing',
    title: 'Writing Disability Screening',
    description: 'Evaluate writing skills, spelling, handwriting, and written expression abilities',
    icon: <PenTool size={32} />,
    color: colors.accentBlue,
    difficulty: 'writing',
  },
  {
    id: 'listening',
    title: 'Auditory Processing Screening',
    description: 'Test listening comprehension, following verbal instructions, and auditory discrimination',
    icon: <Ear size={32} />,
    color: colors.accentOrange,
    difficulty: 'attention',
  },
  {
    id: 'math',
    title: 'Math Disability Screening',
    description: 'Assess number sense, mathematical reasoning, calculation skills, and problem-solving',
    icon: <Calculator size={32} />,
    color: colors.accentPink,
    difficulty: 'math',
  },
  {
    id: 'visual',
    title: 'Visual Processing Screening',
    description: 'Evaluate visual perception, spatial reasoning, and visual memory skills',
    icon: <Eye size={32} />,
    color: colors.accent,
    difficulty: 'memory',
  },
];

export default function TestSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTests, setSelectedTests] = useState([]);
  const [difficulties, setDifficulties] = useState([]);

  useEffect(() => {
    // Get difficulties from URL params
    const difficultiesParam = searchParams.get('difficulties');
    if (difficultiesParam) {
      const diffArray = difficultiesParam.split(',');
      setDifficulties(diffArray);
      
      // Auto-select relevant tests based on difficulties
      const autoSelected = specificTests
        .filter(test => diffArray.includes(test.difficulty))
        .map(test => test.id);
      setSelectedTests(autoSelected);
    }
  }, [searchParams]);

  const toggleTest = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const handleProceed = () => {
    if (selectedTests.length === 0) {
      alert('Please select at least one test to proceed.');
      return;
    }
    
    // Save selectedTests to localStorage for ML encoding
    const STORAGE_KEY = 'leadis_screening_form';
    try {
      const existingData = localStorage.getItem(STORAGE_KEY);
      const formData = existingData ? JSON.parse(existingData) : {};
      
      // Update selectedTests field
      formData.selectedTests = selectedTests;
      formData.selectedTests_encoded = selectedTests.map((test, idx) => 
        ['reading', 'writing', 'listening', 'math', 'visual'].includes(test) ? 1 : 0
      );
      
      // Encode selectedTests as binary vector
      const encodingMap = { "reading": 0, "writing": 1, "listening": 2, "math": 3, "visual": 4 };
      const vector = Array(5).fill(0);
      selectedTests.forEach(test => {
        const index = encodingMap[test];
        if (index !== undefined) vector[index] = 1;
      });
      formData.selectedTests_encoded = vector;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      console.log('Selected tests saved:', selectedTests);
      console.log('Encoded as binary vector:', vector);
    } catch (error) {
      console.error('Error saving selected tests:', error);
    }
    
    // Navigate to assessment page with selected tests
    const testsParam = selectedTests.join(',');
    router.push(`/assessment?tests=${testsParam}`);
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
            <img src="/logo.svg" alt="Leadis" style={{ width: 52, height: 52 }} />
          </div>
          <span style={styles.logoText}>Leadis</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.content}
        >
          <div style={styles.hero}>
            <h1 style={styles.title}>
              Choose Specific Tests
            </h1>
            <p style={styles.subtitle}>
              Based on the areas of difficulty identified, we recommend targeted screenings to better understand your child's unique learning profile. Select the tests you'd like to complete.
            </p>
          </div>

          {/* Test Cards Grid */}
          <div style={styles.testsGrid}>
            {specificTests.map((test) => {
              const isSelected = selectedTests.includes(test.id);
              const isRecommended = difficulties.includes(test.difficulty);

              return (
                <motion.div
                  key={test.id}
                  onClick={() => toggleTest(test.id)}
                  style={{
                    ...styles.testCard,
                    borderColor: isSelected ? test.color : '#e2e8f0',
                    backgroundColor: isSelected ? `${test.color}10` : colors.white,
                    cursor: 'pointer',
                  }}
                  whileHover={{ scale: 1.02, boxShadow: `0 8px 30px ${test.color}20` }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div style={{ ...styles.badge, backgroundColor: test.color }}>
                      Recommended
                    </div>
                  )}

                  {/* Selection Checkbox */}
                  <div style={{
                    ...styles.checkbox,
                    borderColor: isSelected ? test.color : '#cbd5e1',
                    backgroundColor: isSelected ? test.color : colors.white,
                  }}>
                    {isSelected && <Check size={18} color={colors.white} />}
                  </div>

                  {/* Icon */}
                  <div style={{ ...styles.testIcon, color: test.color }}>
                    {test.icon}
                  </div>

                  {/* Content */}
                  <h3 style={styles.testTitle}>{test.title}</h3>
                  <p style={styles.testDescription}>{test.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Action Button */}
          <div style={styles.actionSection}>
            <p style={styles.selectionCount}>
              {selectedTests.length === 0 
                ? 'No tests selected' 
                : `${selectedTests.length} test${selectedTests.length > 1 ? 's' : ''} selected`}
            </p>
            <motion.button
              onClick={handleProceed}
              disabled={selectedTests.length === 0}
              style={{
                ...styles.proceedButton,
                opacity: selectedTests.length === 0 ? 0.5 : 1,
                cursor: selectedTests.length === 0 ? 'not-allowed' : 'pointer',
              }}
              whileHover={selectedTests.length > 0 ? { scale: 1.02 } : {}}
              whileTap={selectedTests.length > 0 ? { scale: 0.98 } : {}}
            >
              <span>Proceed to Assessment</span>
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Info Box */}
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              Each test takes approximately 10-15 minutes. You can complete them all at once or return later to finish remaining tests.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.lightBg,
    fontFamily: "'Nunito', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    backgroundColor: colors.white,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
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
    gap: '12px',
  },
  logoIcon: {
    width: '52px',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '26px',
    fontWeight: 700,
    color: colors.dark,
    fontFamily: "'Fredoka', sans-serif",
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 40px',
  },
  content: {
    width: '100%',
  },
  hero: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    fontSize: '42px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '16px',
    fontFamily: "'Fredoka', sans-serif",
  },
  subtitle: {
    fontSize: '18px',
    color: colors.gray,
    lineHeight: '1.6',
    maxWidth: '700px',
    margin: '0 auto',
  },
  testsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '24px',
    marginBottom: '50px',
  },
  testCard: {
    position: 'relative',
    padding: '30px',
    backgroundColor: colors.white,
    borderRadius: '16px',
    border: '2px solid',
    transition: 'all 0.3s',
  },
  badge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 600,
    color: colors.white,
  },
  checkbox: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  testIcon: {
    marginBottom: '20px',
    marginTop: '20px',
  },
  testTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '12px',
    fontFamily: "'Fredoka', sans-serif",
  },
  testDescription: {
    fontSize: '15px',
    color: colors.gray,
    lineHeight: '1.6',
  },
  actionSection: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  selectionCount: {
    fontSize: '16px',
    color: colors.gray,
    marginBottom: '20px',
    fontWeight: 500,
  },
  proceedButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 40px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 600,
    transition: 'all 0.3s',
    fontFamily: "'Nunito', sans-serif",
  },
  infoBox: {
    backgroundColor: colors.white,
    padding: '20px',
    borderRadius: '12px',
    border: `2px solid ${colors.primaryLight}`,
    textAlign: 'center',
  },
  infoText: {
    fontSize: '14px',
    color: colors.gray,
    lineHeight: '1.6',
    margin: 0,
  },
};
