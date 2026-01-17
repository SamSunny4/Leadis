'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, ArrowRight, Search } from 'lucide-react';
import { colors } from '../../styles/quizStyles';

// --- SVG Assets for Animals ---

const FoxIcon = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M50 85C70 85 85 70 85 50C85 30 70 15 50 15C30 15 15 30 15 50C15 70 30 85 50 85Z" fill="#f97316" />
        <path d="M15 50L25 20L40 35" fill="#f97316" stroke="#c2410c" strokeWidth="2" strokeLinejoin="round" />
        <path d="M85 50L75 20L60 35" fill="#f97316" stroke="#c2410c" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 85C30 85 20 65 15 50C30 50 40 60 50 65C60 60 70 50 85 50C80 65 70 85 50 85Z" fill="white" />
        <circle cx="35" cy="45" r="5" fill="#333" />
        <circle cx="65" cy="45" r="5" fill="#333" />
        <ellipse cx="50" cy="55" rx="6" ry="4" fill="#333" />
        <path d="M25 20L30 30L20 30Z" fill="#fff" opacity="0.5" />
        <path d="M75 20L70 30L80 30Z" fill="#fff" opacity="0.5" />
    </svg>
);

const CatIcon = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M50 85C70 85 85 70 85 50C85 30 70 15 50 15C30 15 15 30 15 50C15 70 30 85 50 85Z" fill="#94a3b8" />
        <path d="M20 50L20 20L45 30" fill="#94a3b8" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />
        <path d="M80 50L80 20L55 30" fill="#94a3b8" stroke="#64748b" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="35" cy="45" r="5" fill="#333" />
        <circle cx="65" cy="45" r="5" fill="#333" />
        <path d="M45 55L55 55L50 60Z" fill="#pink" stroke="#333" strokeWidth="1" />
        <path d="M20 55L40 55" stroke="#333" strokeWidth="2" opacity="0.5" />
        <path d="M80 55L60 55" stroke="#333" strokeWidth="2" opacity="0.5" />
        <path d="M25 20L25 30L35 30Z" fill="#fff" opacity="0.3" />
        <path d="M75 20L75 30L65 30Z" fill="#fff" opacity="0.3" />
    </svg>
);

const DogIcon = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M50 85C70 85 85 70 85 50C85 30 70 15 50 15C30 15 15 30 15 50C15 70 30 85 50 85Z" fill="#d97706" />
        <path d="M15 40C10 40 10 70 25 60" fill="#b45309" stroke="#92400e" strokeWidth="2" />
        <path d="M85 40C90 40 90 70 75 60" fill="#b45309" stroke="#92400e" strokeWidth="2" />
        <circle cx="35" cy="45" r="5" fill="#333" />
        <circle cx="65" cy="45" r="5" fill="#333" />
        <ellipse cx="50" cy="55" rx="8" ry="6" fill="#333" />
        <path d="M50 65Q60 65 60 55" stroke="#333" strokeWidth="2" fill="none" />
    </svg>
);

const RabbitIcon = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M50 85C70 85 85 70 85 50C85 30 70 15 50 15C30 15 15 30 15 50C15 70 30 85 50 85Z" fill="#e2e8f0" />
        <path d="M35 25L30 5L45 20" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />
        <path d="M65 25L70 5L55 20" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="35" cy="45" r="5" fill="#333" />
        <circle cx="65" cy="45" r="5" fill="#333" />
        <circle cx="50" cy="55" r="3" fill="#pink" />
        <path d="M30 10L35 20" fill="#pink" opacity="0.3" />
        <path d="M70 10L65 20" fill="#pink" opacity="0.3" />
    </svg>
);

const BearIcon = () => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <path d="M50 85C70 85 85 70 85 50C85 30 70 15 50 15C30 15 15 30 15 50C15 70 30 85 50 85Z" fill="#78350f" />
        <circle cx="25" cy="25" r="10" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <circle cx="75" cy="25" r="10" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <circle cx="35" cy="45" r="5" fill="#333" />
        <circle cx="65" cy="45" r="5" fill="#333" />
        <ellipse cx="50" cy="60" rx="12" ry="10" fill="#fcd34d" opacity="0.8" />
        <circle cx="50" cy="55" r="4" fill="#333" />
    </svg>
);

const Distractors = [CatIcon, DogIcon, RabbitIcon, BearIcon];

/**
 * Find Character Minigame
 * A grid game where users must find a specific character hidden among distractors.
 * The target character moves to a new random location after each successful find.
 * 
 * @param {Object} props
 * @param {Function} props.onComplete - Callback when game is completed
 * @param {Object} props.config - Game configuration
 */
export default function FindCharacterGame({ onComplete, config }) {
    const [gameState, setGameState] = useState('idle'); // idle, playing, success
    const [score, setScore] = useState(0);
    const [targetIndex, setTargetIndex] = useState(null);
    const [gridSize, setGridSize] = useState(25); // 5x5 grid
    const [shakingIndex, setShakingIndex] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [searchTimes, setSearchTimes] = useState([]);
    const [currentSearchStart, setCurrentSearchStart] = useState(null);
    const [totalClicks, setTotalClicks] = useState(0);
    const [incorrectClicks, setIncorrectClicks] = useState(0);

    // Generate random distractors for the grid
    // Re-generate whenever score changes to create "visual noise" and randomization
    const gridDistractors = useMemo(() => {
        return Array.from({ length: gridSize }).map(() => {
            return Distractors[Math.floor(Math.random() * Distractors.length)];
        });
    }, [gridSize, score]);

    const targetScore = config?.targetScore || 5;
    const columns = Math.sqrt(gridSize);

    const startGame = () => {
        setScore(0);
        setGameState('playing');
        setStartTime(Date.now());
        setSearchTimes([]);
        setTotalClicks(0);
        setIncorrectClicks(0);
        moveTarget();
    };

    const moveTarget = useCallback(() => {
        const newIndex = Math.floor(Math.random() * gridSize);
        setTargetIndex(newIndex);
        setCurrentSearchStart(Date.now());
    }, [gridSize]);

    const handleTileClick = (index) => {
        if (gameState !== 'playing') return;

        setTotalClicks(prev => prev + 1);

        if (index === targetIndex) {
            // Found the target!
            const searchTime = currentSearchStart ? Date.now() - currentSearchStart : 0;
            setSearchTimes(prev => [...prev, searchTime]);
            
            const newScore = score + 1;
            setScore(newScore);

            if (newScore >= targetScore) {
                setGameState('success');
                const totalTime = Date.now() - startTime;
                const avgSearchTime = searchTimes.length > 0 
                    ? searchTimes.reduce((a, b) => a + b, searchTime) / (searchTimes.length + 1)
                    : searchTime;
                
                setTimeout(() => onComplete({
                    gameType: 'find-character',
                    score: newScore,
                    maxScore: targetScore,
                    accuracy: newScore / targetScore,
                    completionTime: totalTime,
                    searchTime: avgSearchTime,
                    totalClicks: totalClicks + 1,
                    incorrectClicks: incorrectClicks,
                }), 1500);
            } else {
                moveTarget();
            }
        } else {
            // Clicked a distractor
            setIncorrectClicks(prev => prev + 1);
            setShakingIndex(index);
            setTimeout(() => setShakingIndex(null), 500);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%',
            maxWidth: '500px',
        }}>
            {/* Game Status Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0 16px',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: colors.primary,
                }}>
                    <Search size={20} />
                    Find the Fox!
                </div>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: colors.dark,
                    backgroundColor: colors.lightBg,
                    padding: '4px 16px',
                    borderRadius: '20px',
                }}>
                    Score: {score}/{targetScore}
                </div>
            </div>

            {/* Game Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '8px',
                width: '100%',
                aspectRatio: '1/1',
                padding: '16px',
                backgroundColor: '#e2e8f0', // Sky/neutral background
                borderRadius: '24px',
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.1)',
                border: `4px solid ${colors.white}`,
            }}>
                {Array.from({ length: gridSize }).map((_, index) => {
                    const DistractorIcon = gridDistractors[index];

                    return (
                        <motion.button
                            key={`${index}-${score}`} // Force re-render on score change for bounce effect
                            initial={{ scale: 0 }}
                            animate={shakingIndex === index ? { x: [-5, 5, -5, 5, 0], scale: 1 } : { scale: 1 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                                delay: Math.random() * 0.1 // Random delay for "noise"
                            }}
                            onClick={() => handleTileClick(index)}
                            whileHover={gameState === 'playing' ? { scale: 1.05, zIndex: 10 } : {}}
                            whileTap={gameState === 'playing' ? { scale: 0.95 } : {}}
                            style={{
                                border: 'none',
                                borderRadius: '12px',
                                backgroundColor: 'white',
                                cursor: gameState === 'playing' ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                padding: '4px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            }}
                        >
                            {index === targetIndex ? (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <FoxIcon />
                                </motion.div>
                            ) : (
                                <div style={{ width: '100%', height: '100%', opacity: 0.8 }}>
                                    <DistractorIcon />
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {/* Controls */}
            {gameState === 'idle' && (
                <button
                    onClick={startGame}
                    style={{
                        padding: '16px 48px',
                        backgroundColor: colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '20px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}
                >
                    <Play size={24} fill="white" />
                    Start Game
                </button>
            )}

            {gameState === 'success' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        color: colors.primary,
                    }}
                >
                    <Trophy size={48} />
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>You found them all!</span>
                </motion.div>
            )}
        </div>
    );
}
