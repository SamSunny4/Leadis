'use client';

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
  MessageCircle,
  Smile,
  Puzzle,
  Music,
  Palette
} from 'lucide-react';

// Fun color palette - Light Green Theme
const colors = {
  primary: '#22c55e',       // Fresh green
  primaryLight: '#86efac',  // Light mint
  primaryDark: '#16a34a',   // Deep green
  accent: '#fbbf24',        // Sunny yellow
  accentPink: '#f472b6',    // Playful pink
  accentBlue: '#38bdf8',    // Sky blue
  accentOrange: '#fb923c',  // Fun orange
  dark: '#1e293b',
  gray: '#64748b',
  lightBg: '#f0fdf4',       // Very light green tint
  white: '#ffffff',
};

// Awareness facts and quotes that fade in/out
const awarenessQuotes = [
  {
    quote: "Did you know Albert Einstein had a learning disability?",
    fact: "He didn't speak until age 4 and struggled with reading. Today, he's celebrated as one of history's greatest minds."
  },
  {
    quote: "Did you know 1 in 5 children has a learning difference?",
    fact: "Early identification can make a huge difference in a child's success and happiness."
  },
  {
    quote: "Did you know Leonardo da Vinci had dyslexia?",
    fact: "His unique way of thinking made him one of the most creative people ever."
  },
  {
    quote: "Did you know Richard Branson has dyslexia?",
    fact: "He says thinking differently helped him build amazing businesses."
  },
  {
    quote: "Did you know early help increases success by 90%?",
    fact: "Kids who get support early do so much better in school and life."
  },
  {
    quote: "Did you know Steven Spielberg discovered he had dyslexia at 60?",
    fact: "Imagine how much earlier screening could have helped him."
  }
];

// Floating decorative elements
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
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
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
              backgroundColor: index === currentIndex ? colors.primary : '#e2e8f0'
            }}
            animate={{ scale: index === currentIndex ? 1.3 : 1 }}
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
      <FloatingElements />
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Smile size={28} color={colors.white} />
          </div>
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
          <motion.div 
            style={styles.heroBadge}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles size={16} color={colors.primary} />
            <span>AI-Powered Screening for Kids</span>
          </motion.div>
          <h1 style={styles.heroTitle}>
            Does Your Child Have a<br />
            <span style={styles.heroTitleAccent}>Learning Difference?</span>
          </h1>
          <p style={styles.heroSubtitle}>
            A fun, friendly screening platform that helps discover how your child learns best — 
            through games, activities, and play!
          </p>
          
          <div style={styles.heroCTA}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={styles.primaryButton}
            >
              <PlayCircle size={22} />
              Start Screening
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={styles.secondaryButton}
            >
              Check Specific Area
            </motion.button>
          </div>

          <div style={styles.trustBadges}>
            <div style={styles.trustItem}>
              <Check size={18} color={colors.primary} />
              <span>Highly Accurate</span>
            </div>
            <div style={styles.trustItem}>
              <Shield size={18} color={colors.primary} />
              <span>Safe & Private</span>
            </div>
            <div style={styles.trustItem}>
              <Heart size={18} color={colors.accentPink} />
              <span>Kid-Friendly</span>
            </div>
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
        <ChevronDown size={32} color={colors.primary} />
      </motion.div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      icon: <FileText size={32} color={colors.white} />,
      title: "Tell Us About Your Child",
      description: "Share some info about your child — their age, interests, and any things you've noticed at home or school.",
      color: colors.primary
    },
    {
      icon: <Gamepad2 size={32} color={colors.white} />,
      title: "Play Fun Games",
      description: "Your child plays fun mini-games that secretly check memory, attention, language, and motor skills!",
      color: colors.accentBlue
    },
    {
      icon: <Brain size={32} color={colors.white} />,
      title: "Smart AI Analysis",
      description: "Our friendly AI watches how your child plays and learns to understand their unique learning style.",
      color: colors.accentPink
    },
    {
      icon: <BarChart3 size={32} color={colors.white} />,
      title: "Get Your Report",
      description: "Receive an easy-to-read report showing your child's strengths and areas where they might need extra support!",
      color: colors.accentOrange
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
        <h2 style={styles.sectionTitle}>Simple as 1-2-3-4!</h2>
        <p style={styles.sectionSubtitle}>
          Our fun four-step process makes learning about your child easy and enjoyable.
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
            whileHover={{ y: -8, scale: 1.02 }}
            style={styles.stepCard}
          >
            <div style={styles.stepNumberBubble}>{index + 1}</div>
            <div style={{ ...styles.stepIconCircle, backgroundColor: step.color }}>
              {step.icon}
            </div>
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
      icon: <Sparkles size={24} color={colors.primary} />,
      title: "Multi-Sensory Fun",
      description: "Games use sounds, colors, and movement to see how your child learns best!"
    },
    {
      icon: <Shield size={24} color={colors.primary} />,
      title: "Super Safe",
      description: "Your child's info is protected with the strongest safety shields. Promise!"
    },
    {
      icon: <BookOpen size={24} color={colors.primary} />,
      title: "Reading Check",
      description: "Fun activities to see if reading feels tricky — and how to make it easier!"
    },
    {
      icon: <MessageCircle size={24} color={colors.primary} />,
      title: "Speech Games",
      description: "Playful talking activities to check how words and sounds are developing."
    },
    {
      icon: <Users size={24} color={colors.primary} />,
      title: "Right for Their Age",
      description: "Activities change based on your child's age — always just right!"
    },
    {
      icon: <Heart size={24} color={colors.accentPink} />,
      title: "Celebrate Strengths",
      description: "We show what your child is GREAT at, not just what's tricky. Every kid shines!"
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
        <h2 style={styles.sectionTitle}>Made with Love & Care</h2>
        <p style={styles.sectionSubtitle}>
          Every feature is designed to make your child smile while we learn about them!
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
            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(34, 197, 94, 0.15)' }}
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
        <h2 style={styles.bannerTitle}>
          Every Child is Unique & Amazing!
        </h2>
        <p style={styles.bannerText}>
          Learning differences don't stop kids from being incredible. With early support, 
          children can unlock their superpowers and achieve anything they dream of! 
          We're here to help every family discover their child's unique gifts.
        </p>
        <div style={styles.bannerStats}>
          <motion.div 
            style={styles.statItem}
            whileHover={{ scale: 1.05 }}
          >
            <span style={styles.statNumber}>1 in 5</span>
            <span style={styles.statLabel}>kids learn differently</span>
          </motion.div>
          <motion.div 
            style={styles.statItem}
            whileHover={{ scale: 1.05 }}
          >
            <span style={styles.statNumber}>70%</span>
            <span style={styles.statLabel}>aren't found early enough</span>
          </motion.div>
          <motion.div 
            style={styles.statItem}
            whileHover={{ scale: 1.05 }}
          >
            <span style={styles.statNumber}>90%</span>
            <span style={styles.statLabel}>thrive with early help</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// What We Screen Section
const ScreeningAreas = () => {
  const areas = [
    { name: "Reading Adventures", risk: "Letters, sounds, and story time fun!", color: colors.primary },
    { name: "Writing Wonders", risk: "Pencil skills, spelling, and creative stories!", color: colors.accentBlue },
    { name: "Number Magic", risk: "Counting, math puzzles, and number games!", color: colors.accentPink },
    { name: "Focus Power", risk: "Attention, staying on task, and patience!", color: colors.accentOrange },
    { name: "Movement & Coordination", risk: "Balance, hand skills, and body control!", color: colors.accent },
    { name: "Memory Champions", risk: "Remembering, learning speed, and recall!", color: colors.primaryDark }
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
        <span style={styles.sectionLabel}>WHAT WE CHECK</span>
        <h2 style={styles.sectionTitle}>All the Important Stuff!</h2>
        <p style={styles.sectionSubtitle}>
          Our games check different skills to give you the complete picture of your awesome kid!
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
            whileHover={{ scale: 1.03, x: 5 }}
            style={styles.areaCard}
          >
            <div style={{ ...styles.areaIcon, backgroundColor: `${area.color}20` }}>
              <Check size={24} color={area.color} />
            </div>
            <div>
              <h4 style={styles.areaTitle}>{area.name}</h4>
              <p style={styles.areaDescription}>{area.risk}</p>
            </div>
            <Check size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
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
        <h2 style={styles.ctaTitle}>Ready for the Adventure?</h2>
        <p style={styles.ctaSubtitle}>
          Just 15-20 minutes of fun games, and you'll discover amazing things about how your child learns!
        </p>
        <motion.button
          whileHover={{ scale: 1.08, y: -3 }}
          whileTap={{ scale: 0.95 }}
          style={styles.ctaButton}
        >
          Let's Go! Start Screening
          <ArrowRight size={22} />
        </motion.button>
        <p style={styles.ctaNote}>No sign-up needed • Highly accurate • Takes 15-20 mins</p>
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
            <div style={styles.logoIconFooter}>
              <Smile size={24} color={colors.white} />
            </div>
            <span style={styles.logoTextFooter}>Leadis</span>
          </div>
          <p style={styles.footerTagline}>
            Making early screening fun, friendly, and accessible for every family.
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
            <a href="#" style={styles.footerLink}>For Teachers</a>
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
        <p style={styles.copyright}>© 2026 Leadis. Made with love for families everywhere.</p>
        <p style={styles.disclaimer}>
          This platform provides screening, not diagnosis. Always consult a professional for clinical evaluation.
        </p>
      </div>
    </footer>
  );
};

// Main Page Component
export default function Home() {
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
}

// Styles
const styles = {
  app: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
  },

  // Floating Elements
  floatingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  floatingIcon: {
    position: 'absolute',
    opacity: 0.6,
  },
  
  // Navigation
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 80px',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    zIndex: 1000,
    borderBottom: '2px solid #f0fdf4',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '26px',
    fontWeight: 700,
    color: colors.dark,
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '36px',
  },
  navLink: {
    color: colors.gray,
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'color 0.2s',
  },
  navButton: {
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '14px 28px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
  },

  // Hero Section
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '120px 80px 60px',
    position: 'relative',
    background: `linear-gradient(180deg, ${colors.lightBg} 0%, ${colors.white} 100%)`,
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
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: colors.white,
    padding: '10px 20px',
    borderRadius: '50px',
    marginBottom: '24px',
    boxShadow: '0 2px 20px rgba(34, 197, 94, 0.1)',
    border: `2px solid ${colors.primaryLight}`,
    fontSize: '14px',
    fontWeight: 600,
    color: colors.primary,
  },
  heroTitle: {
    fontSize: '54px',
    fontWeight: 700,
    lineHeight: 1.15,
    color: colors.dark,
    marginBottom: '24px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  heroTitleAccent: {
    color: colors.primary,
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accentBlue} 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '19px',
    color: colors.gray,
    lineHeight: 1.7,
    marginBottom: '36px',
  },
  heroCTA: {
    display: 'flex',
    gap: '16px',
    marginBottom: '32px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '18px 36px',
    borderRadius: '50px',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.35)',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: colors.white,
    color: colors.dark,
    border: `2px solid ${colors.primaryLight}`,
    padding: '18px 36px',
    borderRadius: '50px',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  trustBadges: {
    display: 'flex',
    gap: '24px',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: colors.gray,
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
    backgroundColor: colors.white,
    borderRadius: '32px',
    padding: '48px',
    minHeight: '320px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 10px 50px rgba(34, 197, 94, 0.12)',
    border: `3px solid ${colors.primaryLight}`,
  },
  quoteWrapper: {
    textAlign: 'center',
  },
  quoteEmoji: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '16px',
  },
  quoteText: {
    fontSize: '22px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '16px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  factText: {
    fontSize: '16px',
    color: colors.gray,
    lineHeight: 1.7,
  },
  indicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '32px',
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    transition: 'all 0.3s',
  },

  // How It Works Section
  howItWorks: {
    padding: '120px 80px',
    backgroundColor: colors.white,
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '64px',
  },
  sectionLabel: {
    fontSize: '14px',
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: '2px',
    marginBottom: '16px',
    display: 'block',
  },
  sectionTitle: {
    fontSize: '44px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '16px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: colors.gray,
    maxWidth: '600px',
    margin: '0 auto',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '28px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  stepCard: {
    textAlign: 'center',
    padding: '36px 28px',
    position: 'relative',
    backgroundColor: colors.lightBg,
    borderRadius: '24px',
    border: `2px solid ${colors.primaryLight}`,
    transition: 'all 0.3s',
  },
  stepNumberBubble: {
    position: 'absolute',
    top: '-16px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: colors.primary,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '16px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  stepIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  stepEmoji: {
    fontSize: '32px',
    display: 'block',
    marginBottom: '12px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '10px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  stepDescription: {
    fontSize: '15px',
    color: colors.gray,
    lineHeight: 1.6,
  },

  // Features Section
  features: {
    padding: '120px 80px',
    backgroundColor: colors.lightBg,
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '28px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: '24px',
    padding: '36px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    border: `2px solid ${colors.primaryLight}`,
    transition: 'all 0.3s',
    cursor: 'default',
    position: 'relative',
  },
  featureEmoji: {
    position: 'absolute',
    top: '20px',
    right: '24px',
    fontSize: '28px',
  },
  featureIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    backgroundColor: colors.lightBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  featureTitle: {
    fontSize: '19px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '10px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  featureDescription: {
    fontSize: '15px',
    color: colors.gray,
    lineHeight: 1.6,
  },

  // Awareness Banner
  awarenessBanner: {
    padding: '100px 80px',
    background: `linear-gradient(135deg, ${colors.primary} 0%, #15803d 100%)`,
  },
  bannerContent: {
    maxWidth: '900px',
    margin: '0 auto',
    textAlign: 'center',
  },
  bannerTitle: {
    fontSize: '42px',
    fontWeight: 700,
    color: colors.white,
    marginBottom: '20px',
    fontFamily: 'var(--font-fredoka), sans-serif',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: '28px 20px',
    borderRadius: '20px',
    transition: 'all 0.3s',
  },
  statNumber: {
    fontSize: '44px',
    fontWeight: 700,
    color: colors.white,
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  statLabel: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.9)',
  },

  // Screening Areas
  screeningAreas: {
    padding: '120px 80px',
    backgroundColor: colors.white,
  },
  areasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  areaCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px 28px',
    backgroundColor: colors.white,
    borderRadius: '20px',
    border: `2px solid ${colors.primaryLight}`,
    transition: 'all 0.3s',
    cursor: 'default',
  },
  areaIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  areaTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '4px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  areaDescription: {
    fontSize: '14px',
    color: colors.gray,
  },

  // CTA Section
  ctaSection: {
    padding: '120px 80px',
    backgroundColor: colors.lightBg,
  },
  ctaContent: {
    maxWidth: '650px',
    margin: '0 auto',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '44px',
    fontWeight: 700,
    color: colors.dark,
    marginBottom: '16px',
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
  ctaSubtitle: {
    fontSize: '18px',
    color: colors.gray,
    marginBottom: '36px',
    lineHeight: 1.7,
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '22px 48px',
    borderRadius: '50px',
    fontSize: '19px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(34, 197, 94, 0.4)',
    transition: 'all 0.3s',
  },
  ctaNote: {
    fontSize: '15px',
    color: colors.gray,
    marginTop: '20px',
  },

  // Footer
  footer: {
    backgroundColor: colors.dark,
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
  logoIconFooter: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextFooter: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.white,
    fontFamily: 'var(--font-fredoka), sans-serif',
  },
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
    color: colors.white,
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '8px',
    fontFamily: 'var(--font-fredoka), sans-serif',
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
