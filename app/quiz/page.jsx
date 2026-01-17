'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Clock, CheckCircle, Star, Loader2, RefreshCw, Volume2, VolumeX, FlaskConical, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
    generatePersonalizedQuestions, 
    getStoredQuestions, 
    clearStoredQuestions,
    updatePerformance,
    getPerformanceHistory,
    getEasierQuestion,
    getUserScreeningData
} from './services/questionManager';
import QuizContent from './components/QuizContent';
import { normalizeQuestion, QuestionType } from './schema/quizSchema';
import { colors, quizStyles } from './styles/quizStyles';
import {
    startQuizSession,
    startQuestionTimer,
    recordQuestionResponse,
    recordMinigameResult,
    recordAPDResult,
    recordInteractiveResult,
    endQuizSession,
} from '../../utils/quizMetricsTracker';
import { getUserData, updateRiskAssessment } from '../../utils/userDataManager';
import { transformUserDataForFlask } from '../../utils/dataTransformer';
import { sendPredictionRequest, getUserCredential, checkFlaskHealth } from '../../utils/flaskApiService';
import { skipQuizAndTest } from '../../utils/quizTestUtils';

// Fun floating shapes for background
const FloatingShapes = () => {
    const shapes = useMemo(() => [
        { color: colors.yellow, size: 60, top: '10%', left: '5%', delay: 0 },
        { color: colors.pink, size: 40, top: '20%', right: '10%', delay: 1 },
        { color: colors.purple, size: 50, top: '60%', left: '8%', delay: 2 },
        { color: colors.blue, size: 35, top: '75%', right: '5%', delay: 0.5 },
        { color: colors.cyan, size: 45, top: '40%', right: '3%', delay: 1.5 },
        { color: colors.orange, size: 30, top: '85%', left: '15%', delay: 2.5 },
        { color: colors.primary, size: 55, top: '5%', right: '20%', delay: 3 },
    ], []);

    return (
        <div style={quizStyles.floatingElements}>
            {shapes.map((shape, i) => (
                <div
                    key={i}
                    style={{
                        ...quizStyles.floatingShape,
                        width: shape.size,
                        height: shape.size,
                        backgroundColor: shape.color,
                        top: shape.top,
                        left: shape.left,
                        right: shape.right,
                        animationDelay: `${shape.delay}s`,
                    }}
                />
            ))}
        </div>
    );
};

// Confetti component for completion
const Confetti = () => {
    const confettiPieces = useMemo(() => 
        Array.from({ length: 50 }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 2,
            color: [colors.yellow, colors.pink, colors.purple, colors.blue, colors.primary, colors.orange][Math.floor(Math.random() * 6)],
            size: 8 + Math.random() * 8,
        })), []
    );

    return (
        <div style={quizStyles.completedConfetti}>
            {confettiPieces.map((piece) => (
                <div
                    key={piece.id}
                    style={{
                        position: 'absolute',
                        left: piece.left,
                        top: '-20px',
                        width: piece.size,
                        height: piece.size,
                        backgroundColor: piece.color,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        animation: `confetti ${piece.duration}s linear ${piece.delay}s infinite`,
                    }}
                />
            ))}
        </div>
    );
};

// Progress bar with stars
const ProgressBar = ({ current, total }) => {
    const progress = ((current + 1) / total) * 100;
    const starsEarned = Math.floor((current + 1) / (total / 3));

    return (
        <div style={quizStyles.progressContainer}>
            <span style={quizStyles.progressStar}>⭐</span>
            <div style={quizStyles.progressWrapper}>
                <div style={{ ...quizStyles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={quizStyles.progressText}>
                {current + 1} / {total}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2].map((i) => (
                    <span 
                        key={i} 
                        style={{ 
                            fontSize: '20px',
                            opacity: i < starsEarned ? 1 : 0.3,
                            transition: 'all 0.3s',
                            transform: i < starsEarned ? 'scale(1.2)' : 'scale(1)',
                        }}
                    >
                        ⭐
                    </span>
                ))}
            </div>
        </div>
    );
};

export default function QuizPage() {
    const router = useRouter();
    const [questions, setQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [answerResults, setAnswerResults] = useState({}); // Track correct/incorrect
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
    const [flaskPrediction, setFlaskPrediction] = useState(null);
    const [flaskError, setFlaskError] = useState(null);
    const [isSendingToFlask, setIsSendingToFlask] = useState(false);
    const [userData, setUserData] = useState(null);
    const [performance, setPerformance] = useState(null);
    
    // Background music refs
    const audioRef = useRef(null);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const musicTracks = ['/assets/Music/1.mp3', '/assets/Music/2.mp3', '/assets/Music/3.mp3'];

    // Initialize background music
    useEffect(() => {
        audioRef.current = new Audio(musicTracks[0]);
        audioRef.current.volume = 0.3;
        audioRef.current.loop = false;
        
        audioRef.current.addEventListener('ended', () => {
            // Play next track when current ends
            setCurrentTrack(prev => (prev + 1) % musicTracks.length);
        });
        
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
    
    // Handle track changes
    useEffect(() => {
        if (audioRef.current && !isLoading) {
            const wasPlaying = !audioRef.current.paused;
            audioRef.current.src = musicTracks[currentTrack];
            audioRef.current.volume = 0.3;
            
            if (wasPlaying) {
                audioRef.current.play().catch(e => console.log('Audio play failed:', e));
            }
        }
    }, [currentTrack]);
    
    // Start music after loading
    useEffect(() => {
        if (!isLoading && questions.length > 0 && audioRef.current && !isMusicPlaying) {
            audioRef.current.play().then(() => {
                setIsMusicPlaying(true);
            }).catch(e => {
                console.log('Audio autoplay prevented. User interaction needed.');
            });
        }
    }, [isLoading, questions]);
    
    // Stop music when quiz completes
    useEffect(() => {
        if (isCompleted && audioRef.current) {
            audioRef.current.pause();
            setIsMusicPlaying(false);
        }
    }, [isCompleted]);

    // Load user data and generate personalized questions on mount
    useEffect(() => {
        async function initializeQuiz() {
            setIsLoading(true);
            try {
                // Get user screening data
                const screeningData = getUserScreeningData();
                setUserData(screeningData);
                
                // Get performance history
                const perfHistory = getPerformanceHistory();
                setPerformance(perfHistory);
                
                // ALWAYS force regenerate on initial load (don't use cache on mount)
                clearStoredQuestions(); // Clear any old cached questions
                const generatedQuestions = await generatePersonalizedQuestions(true); // Force new generation
                let normalized = generatedQuestions.map(normalizeQuestion);
                
                // Inject Interactive Assessment after listening test
                const apdIndex = normalized.findIndex(q => q.type === QuestionType.APD_TEST);
                const interactiveQuestion = {
                    id: 'interactive-assessment-1',
                    type: QuestionType.INTERACTIVE_ASSESSMENT,
                    question: 'Interactive Assessment',
                };
                
                if (apdIndex !== -1) {
                    normalized.splice(apdIndex + 1, 0, interactiveQuestion);
                } else {
                    normalized.push(interactiveQuestion);
                }
                
                setQuestions(normalized);
                
                // Start quiz session tracking
                startQuizSession();
                
                console.log('Quiz initialized with', normalized.length, 'NEW questions');
            } catch (error) {
                console.error('Failed to initialize quiz:', error);
            } finally {
                setIsLoading(false);
            }
        }
        initializeQuiz();
    }, []);

    // Regenerate questions handler
    const handleRegenerateQuestions = useCallback(async () => {
        setIsLoading(true);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setAnswerResults({});
        clearStoredQuestions();
        
        try {
            const generatedQuestions = await generatePersonalizedQuestions(true);
            let normalized = generatedQuestions.map(normalizeQuestion);
            
            // Inject Interactive Assessment after listening test
            const apdIndex = normalized.findIndex(q => q.type === QuestionType.APD_TEST);
            const interactiveQuestion = {
                id: 'interactive-assessment-1',
                type: QuestionType.INTERACTIVE_ASSESSMENT,
                question: 'Interactive Assessment',
            };
            
            if (apdIndex !== -1) {
                normalized.splice(apdIndex + 1, 0, interactiveQuestion);
            } else {
                normalized.push(interactiveQuestion);
            }
            
            setQuestions(normalized);
        } catch (error) {
            console.error('Failed to regenerate questions:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const currentQuestion = questions[currentQuestionIndex];
    const totalQuestions = questions.length;

    // Start question timer when question changes
    useEffect(() => {
        if (currentQuestion && !isLoading) {
            startQuestionTimer(currentQuestion);
        }
    }, [currentQuestionIndex, currentQuestion, isLoading]);

    // Pause music during APD tests
    useEffect(() => {
        const isAPDTest = currentQuestion?.type === 'apd-test';
        
        if (audioRef.current) {
            if (isAPDTest && !audioRef.current.paused) {
                audioRef.current.pause();
                setIsMusicPlaying(false);
            } else if (!isAPDTest && audioRef.current.paused && !isCompleted) {
                audioRef.current.play().catch(e => console.log('Audio resume failed:', e));
                setIsMusicPlaying(true);
            }
        }
    }, [currentQuestion, isCompleted]);

    // Timer logic - count UP (only when loaded and not completed)
    useEffect(() => {
        if (!isCompleted && !isLoading && questions.length > 0) {
            const timerId = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [isCompleted, isLoading, questions.length]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                // Unmute
                audioRef.current.volume = 0.3;
                if (!currentQuestion || currentQuestion.type !== 'apd-test') {
                    audioRef.current.play().catch(e => console.log('Audio play failed:', e));
                }
            } else {
                // Mute
                audioRef.current.pause();
            }
            setIsMuted(!isMuted);
        }
    };

    const handleOptionSelect = async (option) => {
        if (!currentQuestion) return;
        
        // Extract audio replays if provided in the option object
        let audioReplays = 0;
        let actualAnswer = option;
        
        if (typeof option === 'object' && option.answer !== undefined && option.audioReplays !== undefined) {
            audioReplays = option.audioReplays;
            actualAnswer = option.answer;
        }
        
        let isCorrect = actualAnswer === currentQuestion.correctAnswer;
        
        // Minigames, APD tests, and interactive assessments are considered correct if completed
        if (currentQuestion.type === 'minigame' || currentQuestion.type === 'apd-test' || currentQuestion.type === 'interactive-assessment') {
            isCorrect = true;
        }

        const category = currentQuestion.category || 'general';
        const difficulty = currentQuestion.difficulty || 'medium';
        
        // Record metrics based on question type
        if (currentQuestion.type === 'minigame' && typeof option === 'object') {
            recordMinigameResult({
                gameType: option.gameType || currentQuestion.minigameType || 'unknown',
                score: option.score || 0,
                maxScore: option.maxScore || 0,
                accuracy: option.accuracy || 0,
                completionTime: option.completionTime || 0,
                sequenceLength: option.sequenceLength || null,
                errors: option.errors || 0,
            });
        } else if (currentQuestion.type === 'apd-test' && typeof option === 'object') {
            recordAPDResult({
                testType: option.testType || 'unknown',
                score: option.score || 0,
                accuracy: option.accuracy || 0,
                audioReplays: option.audioReplays || 0,
                responseTime: option.responseTime || 0,
                wordsCorrect: option.wordsCorrect || 0,
                wordsTotal: option.wordsTotal || 0,
            });
        } else if (currentQuestion.type === 'interactive-assessment' && typeof option === 'object') {
            recordInteractiveResult({
                section: option.section || 'hand-motor-assessment',
                duration: option.duration || 0,
                completionRate: option.completionRate || 0,
                averageAccuracy: option.averageAccuracy || 0,
                fingerCountingAccuracy: option.fingerCountingAccuracy || null,
                handLateralityAccuracy: option.handLateralityAccuracy || null,
                handPositionAccuracy: option.handPositionAccuracy || null,
                taskResults: option.taskResults || [],
            });
        }
        
        // Record the question response for all types (pass audio replays)
        recordQuestionResponse(currentQuestion, actualAnswer, isCorrect, audioReplays);
        
        // Update answers (store the actual answer value, not the object)
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: actualAnswer,
        }));
        
        // Track if answer was correct
        setAnswerResults((prev) => ({
            ...prev,
            [currentQuestion.id]: isCorrect,
        }));
        
        // Update performance and get new difficulty
        const perfResult = updatePerformance(category, isCorrect, difficulty);
        setPerformance(perfResult.overallProgress);
        
        // Show celebration for correct answers
        if (isCorrect) {
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 500);
        } else {
            // If wrong, try to get an easier follow-up question
            console.log(`Wrong answer in ${category}. New difficulty: ${perfResult.newDifficulty}`);
            
            // Optionally insert an easier question
            if (perfResult.newDifficulty !== difficulty && currentQuestionIndex < totalQuestions - 1) {
                setIsGeneratingFollowUp(true);
                try {
                    const easierQ = await getEasierQuestion(category, difficulty);
                    if (easierQ) {
                        // Insert easier question after current one
                        const normalizedEasier = normalizeQuestion({
                            ...easierQ,
                            id: Date.now(), // Unique ID
                        });
                        setQuestions(prev => [
                            ...prev.slice(0, currentQuestionIndex + 1),
                            normalizedEasier,
                            ...prev.slice(currentQuestionIndex + 1)
                        ]);
                        console.log('Inserted easier follow-up question');
                    }
                } catch (err) {
                    console.error('Could not get easier question:', err);
                } finally {
                    setIsGeneratingFollowUp(false);
                }
            }
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleFinish = async () => {
        setIsCompleted(true);
        
        // End quiz session and save all metrics to localStorage
        const sessionResults = endQuizSession();
        console.log('Quiz session ended with metrics:', sessionResults);
        
        // Calculate final score
        const correctCount = Object.values(answerResults).filter(r => r === true).length;
        console.log('Quiz Completed', { 
            answers, 
            answerResults,
            score: `${correctCount}/${Object.keys(answerResults).length}`,
            performance
        });
        
        // Send data to Flask for prediction
        await sendDataToFlask();
    };
    
    /**
     * Send user data to Flask server for risk prediction
     */
    const sendDataToFlask = async () => {
        try {
            setIsSendingToFlask(true);
            setFlaskError(null);
            
            console.log('📤 Sending data to Flask server...');
            
            // Get username from credentials (this will be the primary key in database)
            const username = getUserCredential();
            console.log('📧 Using username as credential:', username);
            
            // Get current user data from localStorage
            const currentUserData = getUserData();
            if (!currentUserData) {
                throw new Error('No user data found');
            }
            
            // Transform data to Flask format
            const flaskData = transformUserDataForFlask(currentUserData);
            
            // Send prediction request with username as credential (primary key)
            const result = await sendPredictionRequest(flaskData, username);
            
            if (!result.success) {
                throw new Error(result.error || 'Prediction failed');
            }
            
            // Store prediction results
            if (result.data.prediction) {
                setFlaskPrediction(result.data.prediction);
                
                // Update risk assessment in localStorage
                updateRiskAssessment(result.data.prediction);
                
                console.log('✅ Flask prediction received and stored:', result.data.prediction);
                
                // Wait a moment to show success, then redirect to dashboard
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                // If no prediction, still redirect after a delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            }
            
        } catch (error) {
            console.error('❌ Flask prediction error:', error);
            setFlaskError(error.message);
            
            // Still redirect to dashboard even if Flask fails
            // Dashboard will show appropriate message
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);
        } finally {
            setIsSendingToFlask(false);
        }
    };
    
    /**
     * Handle skip quiz button - for testing
     */
    const handleSkipQuiz = async () => {
        if (!confirm('Skip quiz and test Flask integration with random data?')) {
            return;
        }
        
        setIsLoading(true);
        try {
            const result = await skipQuizAndTest();
            
            if (result.success) {
                // Redirect to dashboard to see results
                alert('✅ Test successful! Redirecting to dashboard...');
                router.push('/dashboard');
            } else {
                alert('❌ Test failed: ' + result.error);
            }
        } catch (error) {
            alert('❌ Test error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate score
    const correctCount = Object.values(answerResults).filter(r => r === true).length;
    const answeredCount = Object.keys(answerResults).length;

    // Loading state
    if (isLoading) {
        const userName = userData?.fullName?.split(' ')[0] || '';
        return (
            <div style={quizStyles.container}>
                <FloatingShapes />
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: '24px',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'spin 1s linear infinite',
                    }}>
                        <Loader2 size={40} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: colors.dark,
                        textAlign: 'center',
                    }}>
                        {userName ? `Hi ${userName}! ` : ''}Creating Your Quiz...
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: colors.gray,
                        textAlign: 'center',
                        maxWidth: '300px',
                    }}>
                        Personalizing questions based on your profile
                    </p>
                </div>
                <style jsx global>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
                `}</style>
            </div>
        );
    }

    if (isCompleted) {
        const scorePercent = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
        const userName = userData?.fullName?.split(' ')[0] || '';
        
        return (
            <div style={quizStyles.container}>
                <FloatingShapes />
                <style jsx global>{`
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                    @keyframes confetti { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
                    @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
                    @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
                `}</style>
                <div style={quizStyles.completedCard}>
                    <Confetti />
                    <div style={quizStyles.starsContainer}>
                        {[0, 1, 2].map((i) => {
                            const earned = (i === 0 && scorePercent >= 30) || 
                                          (i === 1 && scorePercent >= 60) || 
                                          (i === 2 && scorePercent >= 80);
                            return (
                                <Star 
                                    key={i} 
                                    size={48}
                                    fill={earned ? colors.yellow : '#e2e8f0'}
                                    color={earned ? colors.yellow : '#cbd5e1'}
                                    style={{ 
                                        ...quizStyles.starBadge, 
                                        animationDelay: `${i * 0.2}s`,
                                        opacity: earned ? 1 : 0.5
                                    }}
                                />
                            );
                        })}
                    </div>
                    <h1 style={quizStyles.completedTitle}>
                        {userName ? `Great Job, ${userName}!` : 'Great Job!'}
                    </h1>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '36px', fontWeight: 700, color: colors.primary, margin: 0 }}>
                            {correctCount} / {answeredCount}
                        </p>
                        <p style={{ fontSize: '16px', color: colors.gray, margin: 0 }}>
                            {scorePercent}% correct
                        </p>
                    </div>
                    <p style={quizStyles.completedText}>
                        Completed in {formatTime(elapsedTime)}
                    </p>
                    
                    {/* Flask Prediction Results */}
                    {isSendingToFlask && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            backgroundColor: '#e0e7ff',
                            borderRadius: '12px',
                            marginTop: '16px',
                        }}>
                            <Loader2 size={24} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ color: '#4338ca', fontWeight: 600 }}>
                                Analyzing results with AI...
                            </span>
                        </div>
                    )}
                    
                    {flaskPrediction && !isSendingToFlask && (
                        <div style={{
                            marginTop: '16px',
                            padding: '20px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '16px',
                            border: '2px solid #86efac',
                            maxWidth: '500px',
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                            }}>
                                <FlaskConical size={24} color="#22c55e" />
                                <h3 style={{ margin: 0, color: '#166534', fontSize: '18px', fontWeight: 700 }}>
                                    AI Risk Assessment
                                </h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '14px' }}>
                                {Object.entries(flaskPrediction).map(([key, value]) => {
                                    const label = key.replace('risk_', '').replace(/_/g, ' ');
                                    const riskLevel = value < 0.3 ? 'Low' : value < 0.7 ? 'Medium' : 'High';
                                    const color = value < 0.3 ? '#22c55e' : value < 0.7 ? '#f59e0b' : '#ef4444';
                                    return (
                                        <div key={key} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            backgroundColor: 'white',
                                            borderRadius: '8px',
                                        }}>
                                            <span style={{ textTransform: 'capitalize', color: '#374151' }}>{label}</span>
                                            <span style={{ fontWeight: 700, color }}>{(value * 100).toFixed(1)}% ({riskLevel})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    {flaskError && !isSendingToFlask && (
                        <div style={{
                            marginTop: '16px',
                            padding: '16px',
                            backgroundColor: '#fef2f2',
                            borderRadius: '12px',
                            border: '2px solid #fca5a5',
                            maxWidth: '500px',
                        }}>
                            <p style={{ margin: 0, color: '#991b1b', fontSize: '14px' }}>
                                <strong>Unable to get AI assessment:</strong> {flaskError}
                            </p>
                            <p style={{ margin: '8px 0 0 0', color: '#7f1d1d', fontSize: '12px' }}>
                                Make sure the Flask server is running on http://localhost:5000
                            </p>
                        </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
                        <Link href="/" style={quizStyles.homeButton}>
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={quizStyles.container}>
            <style jsx global>{`
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-5deg); } 75% { transform: rotate(5deg); } }
                @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
                @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
            `}</style>
            
            <FloatingShapes />
            
            {/* Header with Timer */}
            <div style={quizStyles.header}>
                <div style={quizStyles.logo}>
                    <div style={quizStyles.logoIcon}><img src="/logo.svg" alt="Leadis" style={{ width: '100%', height: '100%' }} /></div>
                    <span style={quizStyles.logoText}>Leadis</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Skip Quiz Button (for testing) */}
                    <button
                        onClick={handleSkipQuiz}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#fbbf24',
                            color: '#78350f',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            fontWeight: 600,
                            fontSize: '14px',
                        }}
                        title="Skip quiz and test Flask integration with random data"
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f59e0b';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fbbf24';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                    >
                        <Zap size={18} />
                        <span>Test Flask</span>
                    </button>
                    <button
                        onClick={toggleMute}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: isMuted ? '#fef3c7' : '#e0e7ff',
                            color: isMuted ? '#f59e0b' : '#6366f1',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                        title={isMuted ? 'Unmute music' : 'Mute music'}
                    >
                        {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                    </button>
                    <div style={quizStyles.timerContainer}>
                        <Clock size={20} color="#6366f1" />
                        <span style={quizStyles.timerText}>
                            {formatTime(elapsedTime)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar current={currentQuestionIndex} total={totalQuestions} />

            <div style={quizStyles.mainContent}>
                {/* Question Content */}
                {currentQuestion && questions.length > 0 ? (
                    <div style={quizStyles.questionArea}>
                        <QuizContent
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                            selectedAnswer={answers[currentQuestion.id]}
                            onAnswerSelect={handleOptionSelect}
                            onNext={handleNext}
                            onPrev={handlePrev}
                            isFirst={currentQuestionIndex === 0}
                            isLast={currentQuestionIndex === totalQuestions - 1}
                            showCelebration={showCelebration}
                        />
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        color: colors.gray,
                    }}>
                        Loading question...
                    </div>
                )}
            </div>
        </div>
    );
}
