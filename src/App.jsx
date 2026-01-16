import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  PlayCircle, 
  FileText, 
  Users, 
  Shield, 
  ChevronDown,
  Check,
  ArrowRight,
  Star,
  Heart,
  BookOpen,
  Gamepad2,
  BarChart3,
  MessageCircle
} from 'lucide-react';

// Awareness facts and quotes that fade in/out
const awarenessQuotes = [
  {
    quote: "Did you know Albert Einstein had a learning disability?",
    fact: "He didn't speak until age 4 and struggled with reading. Today, he's celebrated as one of history's greatest minds."
  },
  {
    quote: "Did you know 1 in 5 children has a learning disability?",
    fact: "Early identification can make a profound difference in a child's academic success and self-esteem."
  },
  {
    quote: "Did you know Leonardo da Vinci had dyslexia?",
    fact: "His unique way of thinking contributed to his extraordinary creativity and innovations."
  },
  {
    quote: "Did you know Richard Branson has dyslexia?",
    fact: "He credits his learning difference for teaching him to delegate and think differently, leading to his business success."
  },
  {
    quote: "Did you know early intervention increases success rates by 90%?",
    fact: "Children who receive support before age 7 show significantly better outcomes in school and life."
  },
  {
    quote: "Did you know Steven Spielberg discovered he had dyslexia at 60?",
    fact: "Imagine how different his childhood could have been with early screening and support."
  }
];

// Rotating Quote Component
const RotatingQuote = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % awarenessQuotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.quoteContainer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={styles.quoteWrapper}
        >
          <p style={styles.quoteText}>"{awarenessQuotes[currentIndex].quote}"</p>
          <p style={styles.factText}>{awarenessQuotes[currentIndex].fact}</p>
        </motion.div>
      </AnimatePresence>
      
      {/* Quote indicators */}
      <div style={styles.indicators}>
        {awarenessQuotes.map((_, index) => (
          <motion.div
            key={index}
            style={{
              ...styles.indicator,
              backgroundColor: index === currentIndex ? '#6366f1' : '#e2e8f0'
            }}
            animate={{ scale: index === currentIndex ? 1.2 : 1 }}
          />
        ))}
      </div>
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section style={styles.hero}>
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <img src="/logo.svg" alt="Leadis" style={{ width: 58, height: 58 }} />
          <span style={styles.logoText}>Leadis</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#how-it-works" style={styles.navLink}>How It Works</a>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#about" style={styles.navLink}>About</a>
          <button style={styles.navButton}>Get Started</button>
        </div>
      </nav>

      <div style={styles.heroContent}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={styles.heroTextContainer}
        >
          <h1 style={styles.heroTitle}>
            Does Your Child Have a<br />
            <span style={styles.heroTitleAccent}>Learning Difference?</span>
          </h1>
          <p style={styles.heroSubtitle}>
            An AI-powered, child-friendly screening platform that helps identify 
            early developmental indicators—giving every child the support they deserve.
          </p>
          
          <div style={styles.heroCTA}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={styles.primaryButton}
            >
              <PlayCircle size={20} />
              Start Free Screening
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={styles.secondaryButton}
            >
              Check for Specific Disability
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={styles.quoteSection}
        >
          <RotatingQuote />
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={styles.scrollIndicator}
      >
        <ChevronDown size={32} color="#6366f1" />
      </motion.div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      icon: <FileText size={32} color="#6366f1" />,
      title: "Parent Input",
      description: "Share your child's developmental history, observed behaviors, and any concerns through our guided questionnaire."
    },
    {
      icon: <Gamepad2 size={32} color="#6366f1" />,
      title: "Interactive Assessment",
      description: "Your child engages with fun, gamified activities designed to assess language, attention, memory, and motor skills."
    },
    {
      icon: <Brain size={32} color="#6366f1" />,
      title: "AI Analysis",
      description: "Our multimodal AI processes behavioral patterns, response times, and learning preferences to build a comprehensive profile."
    },
    {
      icon: <BarChart3 size={32} color="#6366f1" />,
      title: "Risk Profile",
      description: "Receive a clear, parent-friendly report highlighting strengths, areas of concern, and recommended next steps."
    }
  ];

  return (
    <section id="how-it-works" style={styles.howItWorks}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={styles.sectionHeader}
      >
        <span style={styles.sectionLabel}>HOW IT WORKS</span>
        <h2 style={styles.sectionTitle}>Simple. Scientific. Supportive.</h2>
        <p style={styles.sectionSubtitle}>
          Our four-step process makes early screening accessible from the comfort of your home.
        </p>
      </motion.div>

      <div style={styles.stepsGrid}>
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            style={styles.stepCard}
          >
            <div style={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</div>
            <div style={styles.stepIcon}>{step.icon}</div>
            <h3 style={styles.stepTitle}>{step.title}</h3>
            <p style={styles.stepDescription}>{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <Sparkles size={24} color="#6366f1" />,
      title: "Multimodal Assessment",
      description: "Combines visual, auditory, and motor-based activities to capture a complete developmental picture."
    },
    {
      icon: <Shield size={24} color="#6366f1" />,
      title: "Privacy First",
      description: "Your child's data is encrypted and never shared. We follow strict ethical guidelines for child data."
    },
    {
      icon: <BookOpen size={24} color="#6366f1" />,
      title: "Dyslexia Screening",
      description: "Upload reading materials to analyze patterns that may indicate dyslexia-related features."
    },
    {
      icon: <MessageCircle size={24} color="#6366f1" />,
      title: "Speech Analysis",
      description: "Examines vocabulary, fluency, and pronunciation to assess expressive language development."
    },
    {
      icon: <Users size={24} color="#6366f1" />,
      title: "Age-Adaptive",
      description: "Assessments automatically adjust based on your child's age for accurate, relevant evaluation."
    },
    {
      icon: <Heart size={24} color="#6366f1" />,
      title: "Strength-Based Reports",
      description: "Reports highlight what your child does well, not just areas of concern—building confidence."
    }
  ];

  return (
    <section id="features" style={styles.features}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={styles.sectionHeader}
      >
        <span style={styles.sectionLabel}>FEATURES</span>
        <h2 style={styles.sectionTitle}>Designed with Care</h2>
        <p style={styles.sectionSubtitle}>
          Every feature is built with your child's comfort and your peace of mind in focus.
        </p>
      </motion.div>

      <div style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            style={styles.featureCard}
          >
            <div style={styles.featureIcon}>{feature.icon}</div>
            <h3 style={styles.featureTitle}>{feature.title}</h3>
            <p style={styles.featureDescription}>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// Awareness Banner
const AwarenessBanner = () => {
  return (
    <section style={styles.awarenessBanner}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={styles.bannerContent}
      >
        <Star size={40} color="#fbbf24" />
        <h2 style={styles.bannerTitle}>
          Every Child Deserves to Be Understood
        </h2>
        <p style={styles.bannerText}>
          Learning disabilities don't define potential. With early identification and the right support, 
          children with learning differences can thrive academically, socially, and emotionally. 
          Our mission is to make early screening accessible to every family.
        </p>
        <div style={styles.bannerStats}>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>15-20%</span>
            <span style={styles.statLabel}>of children have a learning disability</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>70%</span>
            <span style={styles.statLabel}>are not identified early enough</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statNumber}>90%</span>
            <span style={styles.statLabel}>success rate with early intervention</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// What We Screen Section
const ScreeningAreas = () => {
  const areas = [
    { name: "Reading & Dyslexia", risk: "Phonological awareness, decoding, fluency" },
    { name: "Writing & Dysgraphia", risk: "Handwriting, spelling, written expression" },
    { name: "Math & Dyscalculia", risk: "Number sense, calculation, math reasoning" },
    { name: "Attention & Focus", risk: "Sustained attention, task persistence, impulsivity" },
    { name: "Motor Coordination", risk: "Fine motor, gross motor, motor planning" },
    { name: "Memory & Processing", risk: "Working memory, processing speed, recall" }
  ];

  return (
    <section id="about" style={styles.screeningAreas}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={styles.sectionHeader}
      >
        <span style={styles.sectionLabel}>WHAT WE SCREEN</span>
        <h2 style={styles.sectionTitle}>Comprehensive Developmental Domains</h2>
        <p style={styles.sectionSubtitle}>
          Our platform evaluates multiple areas to provide a holistic view of your child's development.
        </p>
      </motion.div>

      <div style={styles.areasGrid}>
        {areas.map((area, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={styles.areaCard}
          >
            <Check size={20} color="#10b981" />
            <div>
              <h4 style={styles.areaTitle}>{area.name}</h4>
              <p style={styles.areaDescription}>{area.risk}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section style={styles.ctaSection}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={styles.ctaContent}
      >
        <h2 style={styles.ctaTitle}>Ready to Take the First Step?</h2>
        <p style={styles.ctaSubtitle}>
          Our screening takes just 15-20 minutes and can provide invaluable insights about your child's learning profile.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={styles.ctaButton}
        >
          Start Free Screening
          <ArrowRight size={20} />
        </motion.button>
        <p style={styles.ctaNote}>No registration required. 100% free.</p>
      </motion.div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerBrand}>
          <div style={styles.logo}>
            <Brain size={28} color="#6366f1" />
            <span style={styles.logoText}>Leadis</span>
          </div>
          <p style={styles.footerTagline}>
            AI-powered early developmental screening for every child.
          </p>
        </div>
        <div style={styles.footerLinks}>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColumnTitle}>Platform</h4>
            <a href="#" style={styles.footerLink}>How It Works</a>
            <a href="#" style={styles.footerLink}>Features</a>
            <a href="#" style={styles.footerLink}>Pricing</a>
          </div>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColumnTitle}>Resources</h4>
            <a href="#" style={styles.footerLink}>Learning Center</a>
            <a href="#" style={styles.footerLink}>For Educators</a>
            <a href="#" style={styles.footerLink}>Research</a>
          </div>
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColumnTitle}>Company</h4>
            <a href="#" style={styles.footerLink}>About Us</a>
            <a href="#" style={styles.footerLink}>Privacy Policy</a>
            <a href="#" style={styles.footerLink}>Contact</a>
          </div>
        </div>
      </div>
      <div style={styles.footerBottom}>
        <p style={styles.copyright}>© 2026 Leadis. All rights reserved.</p>
        <p style={styles.disclaimer}>
          This platform provides screening, not diagnosis. Always consult a qualified professional for clinical evaluation.
        </p>
      </div>
    </footer>
  );
};

// Main App Component
const App = () => {
  return (
    <div style={styles.app}>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <AwarenessBanner />
      <ScreeningAreas />
      <CTASection />
      <Footer />
    </div>
  );
};

// Styles
const styles = {
  app: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
  },
  
  // Navigation
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 80px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1a1a2e',
    fontFamily: "'Playfair Display', serif",
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  },
  navLink: {
    color: '#4a5568',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  navButton: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  // Hero Section
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '120px 80px 60px',
    position: 'relative',
  },
  heroContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'center',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%',
  },
  heroTextContainer: {
    maxWidth: '600px',
  },
  heroTitle: {
    fontSize: '56px',
    fontWeight: 700,
    lineHeight: 1.1,
    color: '#1a1a2e',
    marginBottom: '24px',
    fontFamily: "'Playfair Display', serif",
  },
  heroTitleAccent: {
    color: '#6366f1',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#64748b',
    lineHeight: 1.7,
    marginBottom: '40px',
  },
  heroCTA: {
    display: 'flex',
    gap: '16px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'transparent',
    color: '#1a1a2e',
    border: '2px solid #e2e8f0',
    padding: '16px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  quoteSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '40px',
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
  },

  // Quote Component
  quoteContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: '24px',
    padding: '48px',
    minHeight: '280px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  quoteWrapper: {
    textAlign: 'center',
  },
  quoteText: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '16px',
    fontFamily: "'Playfair Display', serif",
    fontStyle: 'italic',
  },
  factText: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: 1.6,
  },
  indicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '32px',
  },
  indicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s',
  },

  // How It Works Section
  howItWorks: {
    padding: '120px 80px',
    backgroundColor: '#ffffff',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '64px',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#6366f1',
    letterSpacing: '2px',
    marginBottom: '16px',
    display: 'block',
  },
  sectionTitle: {
    fontSize: '44px',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '16px',
    fontFamily: "'Playfair Display', serif",
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: '#64748b',
    maxWidth: '600px',
    margin: '0 auto',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  stepCard: {
    textAlign: 'center',
    padding: '32px 24px',
    position: 'relative',
  },
  stepNumber: {
    fontSize: '64px',
    fontWeight: 700,
    color: '#f1f5f9',
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: "'Playfair Display', serif",
  },
  stepIcon: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
    position: 'relative',
    zIndex: 1,
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '12px',
  },
  stepDescription: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: 1.6,
  },

  // Features Section
  features: {
    padding: '120px 80px',
    backgroundColor: '#f8fafc',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    transition: 'all 0.3s',
    cursor: 'default',
  },
  featureIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '10px',
  },
  featureDescription: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: 1.6,
  },

  // Awareness Banner
  awarenessBanner: {
    padding: '100px 80px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  bannerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  bannerTitle: {
    fontSize: '40px',
    fontWeight: 700,
    color: '#ffffff',
    marginTop: '24px',
    marginBottom: '20px',
    fontFamily: "'Playfair Display', serif",
  },
  bannerText: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 1.7,
    marginBottom: '48px',
  },
  bannerStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statNumber: {
    fontSize: '48px',
    fontWeight: 700,
    color: '#ffffff',
    fontFamily: "'Playfair Display', serif",
  },
  statLabel: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Screening Areas
  screeningAreas: {
    padding: '120px 80px',
    backgroundColor: '#ffffff',
  },
  areasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  areaCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
  },
  areaTitle: {
    fontSize: '17px',
    fontWeight: 600,
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  areaDescription: {
    fontSize: '14px',
    color: '#64748b',
  },

  // CTA Section
  ctaSection: {
    padding: '120px 80px',
    backgroundColor: '#f8fafc',
  },
  ctaContent: {
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '40px',
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: '16px',
    fontFamily: "'Playfair Display', serif",
  },
  ctaSubtitle: {
    fontSize: '18px',
    color: '#64748b',
    marginBottom: '32px',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    padding: '18px 40px',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
  },
  ctaNote: {
    fontSize: '14px',
    color: '#94a3b8',
    marginTop: '16px',
  },

  // Footer
  footer: {
    backgroundColor: '#1a1a2e',
    padding: '80px 80px 40px',
  },
  footerContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '80px',
    maxWidth: '1200px',
    margin: '0 auto',
    paddingBottom: '40px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  footerBrand: {},
  footerTagline: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '15px',
    marginTop: '16px',
    maxWidth: '280px',
  },
  footerLinks: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '40px',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footerColumnTitle: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  footerLink: {
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyright: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
  },
  disclaimer: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px',
    maxWidth: '500px',
    textAlign: 'right',
  },
};

export default App;
