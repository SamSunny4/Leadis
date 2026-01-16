/**
 * Shared styles for the Quiz components
 * Kid-friendly, fun and engaging design with playful elements
 */

export const colors = {
    primary: '#22c55e',
    primaryLight: '#86efac',
    primaryDark: '#16a34a',
    lightBg: '#f0fdf4',
    white: '#ffffff',
    dark: '#1e293b',
    gray: '#64748b',
    // Fun kid-friendly accent colors
    yellow: '#fbbf24',
    orange: '#fb923c',
    pink: '#f472b6',
    purple: '#a78bfa',
    blue: '#60a5fa',
    cyan: '#22d3ee',
    red: '#f87171',
};

// Fun gradient backgrounds for different question types
export const funGradients = {
    green: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
    rainbow: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 25%, #ede9fe 50%, #dbeafe 75%, #dcfce7 100%)',
    sunset: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%)',
    ocean: 'linear-gradient(135deg, #dbeafe 0%, #cffafe 50%, #dcfce7 100%)',
    candy: 'linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #dbeafe 100%)',
};

export const quizStyles = {
    container: {
        minHeight: '100vh',
        background: funGradients.rainbow,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-nunito), sans-serif',
        position: 'relative',
        overflow: 'hidden',
    },
    // Floating decorative elements
    floatingElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
    },
    floatingShape: {
        position: 'absolute',
        borderRadius: '50%',
        opacity: 0.4,
        animation: 'float 6s ease-in-out infinite',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0 0 30px 30px',
        margin: '0 20px',
        marginTop: '10px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        zIndex: 10,
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
        fontSize: '26px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'var(--font-fredoka), sans-serif',
    },
    timerContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
        borderRadius: '50px',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.15)',
        border: '2px solid #c7d2fe',
    },
    timerText: {
        fontSize: '20px',
        fontWeight: 700,
        color: '#4f46e5',
        fontVariantNumeric: 'tabular-nums',
        fontFamily: 'var(--font-fredoka), sans-serif',
    },
    // Progress bar with fun styling
    progressContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 32px',
        marginTop: '20px',
        position: 'relative',
        zIndex: 5,
    },
    progressWrapper: {
        flex: 1,
        height: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '50px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        border: '3px solid white',
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #22c55e 0%, #86efac 50%, #22c55e 100%)',
        backgroundSize: '200% 100%',
        borderRadius: '50px',
        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'shimmer 2s linear infinite',
        position: 'relative',
    },
    progressStar: {
        fontSize: '20px',
        color: colors.primary,
    },
    progressText: {
        fontSize: '16px',
        fontWeight: 700,
        color: colors.dark,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '6px 16px',
        borderRadius: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        padding: '30px',
        gap: '30px',
        maxWidth: '1100px',
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 5,
    },
    sidebar: {
        width: '300px',
        flexShrink: 0,
    },
    sidebarCard: {
        border: `1px solid ${colors.primaryLight}`,
        borderRadius: '24px',
        padding: '24px',
        height: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        backgroundColor: colors.white,
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
    },
    sidebarIconPlaceholder: {
        width: '100%',
        height: '160px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.lightBg,
        position: 'relative',
        overflow: 'hidden',
    },
    playButton: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: colors.white,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
    },
    playTriangle: {
        width: 0,
        height: 0,
        borderTop: '8px solid transparent',
        borderBottom: '8px solid transparent',
        borderLeft: `14px solid ${colors.primary}`,
        marginLeft: '4px',
    },
    progressIndicator: {
        marginTop: 'auto',
    },
    progressBar: {
        width: '100%',
        height: '10px',
        backgroundColor: '#f1f5f9',
        borderRadius: '5px',
        overflow: 'hidden',
        marginBottom: '10px',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: '5px',
        transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    progressText: {
        fontSize: '14px',
        color: colors.gray,
        textAlign: 'center',
        fontWeight: 500,
    },
    sidebarControls: {
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '10px',
    },
    controlCircle: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: colors.primaryLight,
        opacity: 0.5,
    },
    completedCard: {
        maxWidth: '550px',
        margin: '80px auto',
        padding: '50px',
        textAlign: 'center',
        backgroundColor: colors.white,
        borderRadius: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        border: '2px solid #e2e8f0',
    },
    completedConfetti: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    questionArea: {
        flex: 1,
    },
    completedTitle: {
        fontSize: '36px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '16px',
        fontFamily: 'var(--font-fredoka), sans-serif',
    },
    completedText: {
        fontSize: '18px',
        color: colors.gray,
        marginBottom: '32px',
        lineHeight: 1.6,
    },
    homeButton: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px 40px',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        borderRadius: '50px',
        textDecoration: 'none',
        fontWeight: 700,
        fontSize: '18px',
        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        fontFamily: 'var(--font-fredoka), sans-serif',
    },
    // Star reward badges
    starsContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '24px',
    },
    starBadge: {
        fontSize: '48px',
        animation: 'popIn 0.5s ease-out forwards',
        opacity: 0,
    },
};

// Content-specific styles used by quiz content components
export const contentStyles = {
    questionCard: {
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '32px',
        padding: '36px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.1)',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
    },
    cardDecoration: {
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(134, 239, 172, 0.2) 100%)',
        pointerEvents: 'none',
    },
    questionArea: {
        flex: 1,
        position: 'relative',
        zIndex: 1,
    },
    questionBox: {
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '24px',
        padding: '28px 32px',
        marginBottom: '28px',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        border: '3px solid #86efac',
        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)',
        position: 'relative',
    },
    questionNumber: {
        position: 'absolute',
        top: '-14px',
        left: '24px',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        color: 'white',
        padding: '6px 18px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 700,
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
    },
    questionText: {
        fontSize: '24px',
        fontWeight: 700,
        color: colors.dark,
        marginBottom: '12px',
        fontFamily: 'var(--font-fredoka), sans-serif',
        lineHeight: 1.5,
        marginTop: '8px',
    },
    questionEmoji: {
        fontSize: '32px',
        marginRight: '12px',
    },
    questionUnderline: {
        width: '80px',
        height: '5px',
        background: 'linear-gradient(90deg, #22c55e 0%, #86efac 100%)',
        borderRadius: '3px',
        marginTop: '8px',
    },
    optionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginBottom: '32px',
    },
    optionLabel: {
        display: 'flex',
        alignItems: 'center',
        padding: '18px 24px',
        border: '3px solid',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        gap: '16px',
        background: 'white',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
    },
    optionLabelHover: {
        transform: 'translateX(8px) scale(1.02)',
        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.2)',
    },
    optionLetter: {
        width: '36px',
        height: '36px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '16px',
        flexShrink: 0,
        transition: 'all 0.3s',
    },
    customRadio: {
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        border: '3px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
        flexShrink: 0,
    },
    optionText: {
        fontSize: '18px',
        color: colors.dark,
        fontWeight: 600,
        flex: 1,
    },
    optionCheckmark: {
        marginLeft: 'auto',
        fontSize: '20px',
    },
    navigationButtons: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: '20px',
    },
    navButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '16px 28px',
        border: '3px solid #e2e8f0',
        borderRadius: '50px',
        backgroundColor: 'white',
        fontSize: '16px',
        fontWeight: 700,
        color: colors.gray,
        transition: 'all 0.3s',
        cursor: 'pointer',
        fontFamily: 'var(--font-fredoka), sans-serif',
    },
    nextButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '18px 36px',
        border: 'none',
        borderRadius: '50px',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        fontSize: '18px',
        fontWeight: 700,
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
        fontFamily: 'var(--font-fredoka), sans-serif',
    },
    nextButtonHover: {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 30px rgba(34, 197, 94, 0.5)',
    },
    // Audio-specific styles
    audioContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        padding: '32px',
        background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)',
        borderRadius: '24px',
        marginBottom: '24px',
        border: '3px solid #c7d2fe',
    },
    audioPlayer: {
        width: '100%',
        maxWidth: '400px',
    },
    playButtonLarge: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)',
        cursor: 'pointer',
        transition: 'transform 0.3s',
        border: 'none',
    },
    // Visual-specific styles
    imageContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '32px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)',
        borderRadius: '24px',
        marginBottom: '24px',
        minHeight: '220px',
        border: '3px solid #fcd34d',
    },
    questionImage: {
        maxWidth: '100%',
        maxHeight: '300px',
        borderRadius: '16px',
        objectFit: 'contain',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    },
    visualOptionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '16px',
        marginBottom: '32px',
    },
    visualOption: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        border: '3px solid',
        borderRadius: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        gap: '12px',
        background: 'white',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    },
    visualOptionImage: {
        width: '100%',
        height: '120px',
        objectFit: 'contain',
        borderRadius: '12px',
    },
    // Minigame-specific styles
    minigameContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        padding: '40px',
        background: 'linear-gradient(135deg, #dcfce7 0%, #cffafe 100%)',
        borderRadius: '28px',
        marginBottom: '24px',
        minHeight: '320px',
        border: '3px solid #86efac',
        boxShadow: '0 8px 30px rgba(34, 197, 94, 0.15)',
    },
    minigameInstruction: {
        fontSize: '18px',
        color: colors.dark,
        textAlign: 'center',
        fontWeight: 600,
        background: 'white',
        padding: '16px 28px',
        borderRadius: '20px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
    },
    // Fun interactive elements
    bounceAnimation: {
        animation: 'bounce 0.5s ease',
    },
    pulseAnimation: {
        animation: 'pulse 2s infinite',
    },
    wiggleAnimation: {
        animation: 'wiggle 0.5s ease',
    },
    // Upload Page Styles
    uploadZone: {
        width: '100%',
        minHeight: '300px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
    },
};

// CSS Keyframes (to be added to globals.css)
export const keyframesCSS = `
@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

@keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
}

@keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

@keyframes popIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
}

@keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(10deg); }
}

@keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
`;
