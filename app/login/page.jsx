'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  User,
  Sparkles,
  Shield,
  Heart,
  Check,
  Loader2,
  Send,
  Star,
  Puzzle,
  Music,
  Palette
} from 'lucide-react';
import Logo from '../components/Logo';
import { 
  generateEncryptedUsername, 
  saveUserCredentials, 
  getUserCredentials,
  isUserLoggedIn 
} from '@/utils/userEncryption';
import { sendMagicLink, getMagic } from '@/utils/magicAuth';

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

// Floating decorative elements (matching home page)
const FloatingElements = () => {
  return (
    <div style={styles.floatingContainer}>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        style={{ ...styles.floatingIcon, top: '15%', left: '5%' }}
      >
        <Puzzle size={40} color={colors.accentPink} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        style={{ ...styles.floatingIcon, top: '25%', right: '8%' }}
      >
        <Star size={36} color={colors.accent} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        style={{ ...styles.floatingIcon, bottom: '30%', left: '3%' }}
      >
        <Music size={32} color={colors.accentBlue} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        style={{ ...styles.floatingIcon, bottom: '20%', right: '5%' }}
      >
        <Palette size={38} color={colors.accentOrange} />
      </motion.div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'sending', 'sent', 'verifying'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (isUserLoggedIn()) {
      router.push('/screening');
    }
  }, [router]);

  // Validate email format
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!childName.trim()) {
      setError("Please enter your child's name");
      return;
    }

    setIsLoading(true);
    setStep('sending');

    try {
      // Generate encrypted username using AES-128
      const encryptedUsername = await generateEncryptedUsername(email, childName);
      
      // Send magic link via Magic SDK
      const magicResult = await sendMagicLink(email);
      
      if (!magicResult.success) {
        throw new Error(magicResult.error || 'Failed to send magic link');
      }
      
      // Check if Magic SDK is available or in demo mode
      if (magicResult.isDemo) {
        // Demo mode: simulate the flow
        setStep('sent');
        
        // Auto-verify after 3 seconds for demo
        setTimeout(async () => {
          setStep('verifying');
          
          // Save credentials
          saveUserCredentials(email, childName, encryptedUsername);
          
          // Short delay then redirect
          setTimeout(() => {
            router.push('/screening');
          }, 1500);
        }, 3000);
      } else {
        // Real Magic authentication succeeded
        setStep('verifying');
        
        // Save credentials with the Magic token
        saveUserCredentials(email, childName, encryptedUsername);
        
        // Redirect to screening
        setTimeout(() => {
          router.push('/screening');
        }, 1500);
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  // Render different states
  const renderContent = () => {
    switch (step) {
      case 'sending':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.statusContainer}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Loader2 size={48} color={colors.primary} />
            </motion.div>
            <h2 style={styles.statusTitle}>Sending Magic Link...</h2>
            <p style={styles.statusText}>Please wait while we prepare your login link</p>
          </motion.div>
        );

      case 'sent':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.statusContainer}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={styles.successIcon}
            >
              <Send size={32} color={colors.white} />
            </motion.div>
            <h2 style={styles.statusTitle}>Check Your Email! 📧</h2>
            <p style={styles.statusText}>
              We've sent a magic link to <strong>{email}</strong>
            </p>
            <p style={styles.statusSubtext}>
              Click the link in your email to continue. It will expire in 15 minutes.
            </p>
            <div style={styles.emailAnimation}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Mail size={64} color={colors.primaryLight} />
              </motion.div>
            </div>
            <p style={styles.demoNote}>
              <Sparkles size={16} color={colors.accent} />
              <span>Demo mode: Auto-verifying in a moment...</span>
            </p>
          </motion.div>
        );

      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.statusContainer}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              style={styles.verifyIcon}
            >
              <Check size={32} color={colors.white} />
            </motion.div>
            <h2 style={styles.statusTitle}>Welcome! 🎉</h2>
            <p style={styles.statusText}>
              Account verified for <strong>{childName}</strong>
            </p>
            <p style={styles.statusSubtext}>
              Redirecting to screening...
            </p>
          </motion.div>
        );

      default:
        return (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            style={styles.form}
          >
            <div style={styles.formHeader}>
              <motion.div 
                style={styles.badge}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles size={16} color={colors.primary} />
                <span>Quick & Secure Login</span>
              </motion.div>
              <h1 style={styles.title}>Welcome to Leadis</h1>
              <p style={styles.subtitle}>
                Enter your details to start the fun screening journey for your child!
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <Mail size={18} color={colors.primary} />
                Your Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                style={styles.input}
                disabled={isLoading}
              />
              <p style={styles.helperText}>
                We'll send you a magic link to sign in - no password needed!
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <User size={18} color={colors.primary} />
                Child's Name
              </label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Enter your child's name"
                style={styles.input}
                disabled={isLoading}
              />
              <p style={styles.helperText}>
                This helps us personalize the screening experience
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.errorBox}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={styles.submitButton}
              disabled={isLoading}
            >
              <Send size={20} />
              Send Magic Link
            </motion.button>

            <div style={styles.trustBadges}>
              <div style={styles.trustItem}>
                <Shield size={16} color={colors.primary} />
                <span>Secure & Private</span>
              </div>
              <div style={styles.trustItem}>
                <Heart size={16} color={colors.accentPink} />
                <span>Kid-Friendly</span>
              </div>
            </div>
          </motion.form>
        );
    }
  };

  return (
    <div style={styles.container}>
      <FloatingElements />
      
      {/* Header */}
      <header style={styles.header}>
        <Link href="/" style={styles.backLink}>
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Logo size={56} />
          </div>
          <span style={styles.logoText}>Leadis</span>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  );
}

// Styles
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: `linear-gradient(180deg, ${colors.lightBg} 0%, ${colors.white} 100%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  floatingContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 0,
  },
  floatingIcon: {
    position: 'absolute',
    opacity: 0.4,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    position: 'relative',
    zIndex: 10,
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.gray,
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 600,
    transition: 'color 0.2s',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.dark,
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    position: 'relative',
    zIndex: 10,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: '32px',
    padding: '48px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 10px 50px rgba(34, 197, 94, 0.12)',
    border: `3px solid ${colors.primaryLight}`,
  },
  formHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.lightBg,
    padding: '10px 20px',
    borderRadius: '50px',
    marginBottom: '20px',
    border: `2px solid ${colors.primaryLight}`,
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary,
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '12px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  subtitle: {
    fontSize: '16px',
    color: colors.gray,
    lineHeight: 1.6,
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    fontWeight: 600,
    color: colors.dark,
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '16px 20px',
    fontSize: '16px',
    border: `2px solid ${colors.primaryLight}`,
    borderRadius: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: colors.white,
    boxSizing: 'border-box',
  },
  helperText: {
    fontSize: '13px',
    color: colors.gray,
    marginTop: '8px',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#dc2626',
    fontSize: '14px',
    marginBottom: '20px',
  },
  submitButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '18px 36px',
    borderRadius: '50px',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)',
    transition: 'all 0.2s',
    marginBottom: '24px',
  },
  trustBadges: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: colors.gray,
  },
  statusContainer: {
    backgroundColor: colors.white,
    borderRadius: '32px',
    padding: '60px 48px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 10px 50px rgba(34, 197, 94, 0.12)',
    border: `3px solid ${colors.primaryLight}`,
    textAlign: 'center',
  },
  statusTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: colors.dark,
    marginTop: '24px',
    marginBottom: '12px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  statusText: {
    fontSize: '16px',
    color: colors.gray,
    marginBottom: '8px',
  },
  statusSubtext: {
    fontSize: '14px',
    color: colors.gray,
    opacity: 0.8,
  },
  successIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  verifyIcon: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  emailAnimation: {
    marginTop: '32px',
    marginBottom: '24px',
  },
  demoNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    color: colors.accent,
    fontWeight: 600,
    padding: '12px 20px',
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    marginTop: '16px',
  },
  footer: {
    padding: '20px 40px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10,
  },
  footerText: {
    fontSize: '13px',
    color: colors.gray,
  },
};
