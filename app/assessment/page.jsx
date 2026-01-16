'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft,
  Smile,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

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

const testNames = {
  'reading': 'Reading Disability Screening',
  'writing': 'Writing Disability Screening',
  'listening': 'Auditory Processing Screening',
  'math': 'Math Disability Screening',
  'visual': 'Visual Processing Screening',
};

export default function AssessmentPage() {
  const searchParams = useSearchParams();
  const [selectedTests, setSelectedTests] = useState([]);

  useEffect(() => {
    const testsParam = searchParams.get('tests');
    if (testsParam) {
      setSelectedTests(testsParam.split(','));
    }
  }, [searchParams]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <Link href="/test-selection" style={styles.backLink}>
          <ArrowLeft size={20} />
          <span>Back to Test Selection</span>
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
            <div style={styles.successIcon}>
              <CheckCircle size={64} color={colors.primary} />
            </div>
            <h1 style={styles.title}>
              Ready to Begin Assessment
            </h1>
            <p style={styles.subtitle}>
              You've selected {selectedTests.length} test{selectedTests.length > 1 ? 's' : ''} to complete. Each assessment will help us understand your child's unique learning profile.
            </p>
          </div>

          {/* Selected Tests List */}
          <div style={styles.testsList}>
            <h3 style={styles.testsListTitle}>Selected Tests:</h3>
            {selectedTests.map((testId, index) => (
              <div key={testId} style={styles.testItem}>
                <div style={styles.testNumber}>{index + 1}</div>
                <div style={styles.testName}>{testNames[testId] || testId}</div>
                <div style={styles.testDuration}>~15 min</div>
              </div>
            ))}
          </div>

          {/* Start Button */}
          <motion.button
            style={styles.startButton}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlayCircle size={24} />
            <span>Start Assessment</span>
          </motion.button>

          {/* Info Box */}
          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>Note:</strong> This is a placeholder page. The actual interactive assessments will be implemented here with age-appropriate questions, visual aids, and progress tracking.
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
    maxWidth: '800px',
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
  successIcon: {
    marginBottom: '24px',
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
    maxWidth: '600px',
    margin: '0 auto',
  },
  testsList: {
    backgroundColor: colors.white,
    padding: '30px',
    borderRadius: '16px',
    marginBottom: '30px',
    border: `2px solid ${colors.primaryLight}`,
  },
  testsListTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '20px',
    fontFamily: "'Fredoka', sans-serif",
  },
  testItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    backgroundColor: colors.lightBg,
    borderRadius: '12px',
    marginBottom: '12px',
  },
  testNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: colors.primary,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '16px',
    flexShrink: 0,
  },
  testName: {
    flex: 1,
    fontSize: '16px',
    fontWeight: 600,
    color: colors.dark,
  },
  testDuration: {
    fontSize: '14px',
    color: colors.gray,
  },
  startButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '20px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    borderRadius: '16px',
    fontSize: '20px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    marginBottom: '30px',
  },
  infoBox: {
    backgroundColor: colors.white,
    padding: '24px',
    borderRadius: '12px',
    border: `2px solid ${colors.accentBlue}`,
  },
  infoText: {
    fontSize: '15px',
    color: colors.gray,
    lineHeight: '1.6',
    margin: 0,
  },
};
