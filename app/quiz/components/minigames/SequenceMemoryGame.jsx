'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Trophy, ArrowRight } from 'lucide-react';
import { colors } from '../../styles/quizStyles';

/**
 * Sequence Memory Minigame
 * A 3x3 grid game where users must repeat a sequence of flashing tiles.
 * Unlimited levels: Play until you miss!
 * 
 * @param {Object} props
 * @param {Function} props.onComplete - Callback when game is completed (after failure or manual finish)
 * @param {Object} props.config - Game configuration
 */
export default function SequenceMemoryGame({ onComplete, config }) {
    const [sequence, setSequence] = useState([]);
    const [userSequence, setUserSequence] = useState([]);
    const [gameState, setGameState] = useState('idle'); // idle, showing, input, success_step, fail
    const [level, setLevel] = useState(1);
    const [activeTile, setActiveTile] = useState(null);
    const [message, setMessage] = useState('');
    const [startTime, setStartTime] = useState(null);

    const gridSize = 9; // 3x3 grid

    const startGame = () => {
        setSequence([]);
        setUserSequence([]);
        setLevel(1);
        setGameState('idle');
        setMessage('Watch the pattern!');
        setStartTime(Date.now());

        // Start first level after a short delay
        setTimeout(() => {
            addToSequence([]);
        }, 1000);
    };

    const addToSequence = useCallback((currentSequence) => {
        const nextIndex = Math.floor(Math.random() * gridSize);
        const newSequence = [...currentSequence, nextIndex];
        setSequence(newSequence);
        setGameState('showing');
        setUserSequence([]);
        playSequence(newSequence);
    }, []);

    const playSequence = async (seq) => {
        // Initial delay before sequence starts
        await new Promise(resolve => setTimeout(resolve, 500));

        for (let i = 0; i < seq.length; i++) {
            setActiveTile(seq[i]);
            await new Promise(resolve => setTimeout(resolve, 600)); // Flash duration
            setActiveTile(null);
            await new Promise(resolve => setTimeout(resolve, 200)); // Gap between flashes
        }
        setGameState('input');
        setMessage('Your turn!');
    };

    const handleTileClick = (index) => {
        if (gameState !== 'input') return;

        const newUserSequence = [...userSequence, index];
        setUserSequence(newUserSequence);

        // Flash the clicked tile briefly
        setActiveTile(index);
        setTimeout(() => setActiveTile(null), 200);

        // Check correctness
        const currentIndex = newUserSequence.length - 1;
        if (newUserSequence[currentIndex] !== sequence[currentIndex]) {
            setGameState('fail');
            setMessage(`Game Over! You reached Level ${level}`);
            return;
        }

        // Check if sequence is complete
        if (newUserSequence.length === sequence.length) {
            setGameState('success_step');
            setMessage('Great job!');

            // Auto-advance to next level after short delay
            setTimeout(() => {
                setLevel(prev => prev + 1);
                setMessage(`Level ${level + 1}`);
                addToSequence(sequence);
            }, 1000);
        }
    };

    const handleFinish = () => {
        const completionTime = startTime ? Date.now() - startTime : 0;
        onComplete({
            gameType: 'sequence-memory',
            score: level,
            maxScore: level,
            accuracy: 1.0,
            completionTime: completionTime,
            sequenceLength: level,
            level: level,
            errors: 0,
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            width: '100%',
            maxWidth: '400px',
        }}>
            {/* Game Status Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0 16px',
            }}>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: colors.primary,
                }}>
                    Level {level}
                </div>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: gameState === 'fail' ? '#ef4444' : colors.gray,
                }}>
                    {message}
                </div>
            </div>

            {/* Game Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                width: '100%',
                aspectRatio: '1/1',
                padding: '16px',
                backgroundColor: colors.white,
                borderRadius: '24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                border: `2px solid ${colors.primaryLight}`,
            }}>
                {Array.from({ length: gridSize }).map((_, index) => (
                    <motion.button
                        key={index}
                        whileHover={gameState === 'input' ? { scale: 1.02 } : {}}
                        whileTap={gameState === 'input' ? { scale: 0.95 } : {}}
                        onClick={() => handleTileClick(index)}
                        style={{
                            border: 'none',
                            borderRadius: '16px',
                            backgroundColor: activeTile === index ? colors.lightBg : '#f1f5f9',
                            cursor: gameState === 'input' ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative', // Important for absolute positioning of child
                            overflow: 'hidden',
                            transition: 'background-color 0.2s',
                            boxShadow: activeTile === index
                                ? `0 0 20px ${colors.primary}`
                                : 'inset 0 2px 4px rgba(0,0,0,0.05)',
                            padding: 0, // Remove padding to prevent sizing issues
                        }}
                    >
                        <AnimatePresence>
                            {activeTile === index && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                    style={{
                                        position: 'absolute',
                                        width: '60%',
                                        height: '60%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        pointerEvents: 'none', // Prevent interference with clicks
                                    }}
                                >
                                    {/* SVG Apple for transparent background and perfect scaling */}
                                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                                        <path d="M50 95C75 95 90 75 90 50C90 25 70 15 50 15C30 15 10 25 10 50C10 75 25 95 50 95Z" fill="#ef4444" />
                                        <path d="M50 15C50 15 55 5 65 5" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
                                        <path d="M50 15C50 15 40 5 30 15C30 15 35 25 50 15Z" fill="#65a30d" />
                                        <circle cx="35" cy="45" r="5" fill="#333" />
                                        <circle cx="65" cy="45" r="5" fill="#333" />
                                        <path d="M35 60Q50 70 65 60" stroke="#333" strokeWidth="3" strokeLinecap="round" />
                                        <circle cx="32" cy="42" r="2" fill="white" />
                                        <circle cx="62" cy="42" r="2" fill="white" />
                                    </svg>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                ))}
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

            {gameState === 'fail' && (
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={startGame}
                        style={{
                            padding: '14px 32px',
                            backgroundColor: colors.white,
                            color: colors.dark,
                            border: `2px solid ${colors.gray}`,
                            borderRadius: '50px',
                            fontSize: '18px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <RotateCcw size={20} />
                        Try Again
                    </button>

                    <button
                        onClick={handleFinish}
                        style={{
                            padding: '14px 32px',
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontSize: '18px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        Finish
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
