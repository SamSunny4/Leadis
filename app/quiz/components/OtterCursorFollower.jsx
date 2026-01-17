'use client';

import React, { useState, useEffect, useRef } from 'react';

const SPRITE_SHEET = '/assets/quiz/otter_spritesheet.png';
const SOURCE_FRAME_SIZE = 256; // 1024x1024 sheet / 4 rows/cols
const DISPLAY_SIZE = 96; // Size on screen
const SPEED = 3.5; // Movement speed
const STOP_DISTANCE = 150; // Distance to stop from cursor
const ANIMATION_SPEED = 120; // ms per frame

export default function OtterCursorFollower() {
    const [position, setPosition] = useState({ x: -200, y: -200 }); // Start off-screen
    const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
    const [direction, setDirection] = useState(0); // 0: Down, 1: Left, 2: Right, 3: Up
    const [frame, setFrame] = useState(0);
    const [isMoving, setIsMoving] = useState(false);

    const requestRef = useRef();
    const lastTimeRef = useRef();
    const otterPosRef = useRef({ x: -200, y: -200 });
    const mousePosRef = useRef({ x: -200, y: -200 });

    // Track mouse position
    useEffect(() => {
        const handleMouseMove = (e) => {
            const pos = { x: e.clientX, y: e.clientY };
            setMousePos(pos);
            mousePosRef.current = pos;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animation loop
    useEffect(() => {
        const animate = (time) => {
            if (lastTimeRef.current === undefined) {
                lastTimeRef.current = time;
            }

            const dx = mousePosRef.current.x - otterPosRef.current.x;
            const dy = mousePosRef.current.y - otterPosRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > STOP_DISTANCE) {
                setIsMoving(true);

                // Move towards cursor
                const angle = Math.atan2(dy, dx);
                otterPosRef.current.x += Math.cos(angle) * SPEED;
                otterPosRef.current.y += Math.sin(angle) * SPEED;

                // Determine direction based on angle
                const degrees = angle * (180 / Math.PI);

                // Map degrees to sprite sheet rows
                // Row 0: Down (approx 90 deg)
                // Row 1: Left (approx 180/-180 deg)
                // Row 2: Right (approx 0 deg)
                // Row 3: Up (approx -90 deg)

                if (degrees >= 45 && degrees < 135) {
                    setDirection(0); // Down
                } else if (degrees >= 135 || degrees < -135) {
                    setDirection(1); // Left
                } else if (degrees >= -135 && degrees < -45) {
                    setDirection(3); // Up
                } else {
                    setDirection(2); // Right
                }

            } else {
                setIsMoving(false);
                setFrame(0); // Idle frame
            }

            setPosition({ ...otterPosRef.current });

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    // Sprite animation
    useEffect(() => {
        if (!isMoving) {
            setFrame(0);
            return;
        }

        const interval = setInterval(() => {
            setFrame(prev => (prev + 1) % 4); // 4 frames per row
        }, ANIMATION_SPEED);

        return () => clearInterval(interval);
    }, [isMoving]);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: `${DISPLAY_SIZE}px`,
                height: `${DISPLAY_SIZE}px`,
                backgroundImage: `url(${SPRITE_SHEET})`,
                backgroundPosition: `-${frame * DISPLAY_SIZE}px -${direction * DISPLAY_SIZE}px`,
                backgroundSize: `${DISPLAY_SIZE * 4}px ${DISPLAY_SIZE * 4}px`, // 400% size
                pointerEvents: 'none', // Click through
                zIndex: 9999,
                transform: 'translate(-50%, -50%)', // Center on position
                imageRendering: 'pixelated', // Keep it crisp
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))', // Add shadow for depth
            }}
        />
    );
}
