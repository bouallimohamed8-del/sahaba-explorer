/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  const requestRef = useRef<number | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // 1. Accessibility features checks
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // 2. Touch/mobile device check
    const checkIfTouch = () => {
      const match = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      setIsMobile(match);
    };
    checkIfTouch();
    window.addEventListener('resize', checkIfTouch);

    const onMouseMove = (e: MouseEvent) => {
      mousePosition.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // Hover interactions check
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const isInteractive = target.closest('button, a, select, input, textarea, [role="button"], .cursor-pointer, [data-interactive]') !== null;
      setIsHovered(isInteractive);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);

    // Spring interpolation loop for smooth trailing
    const updateTrail = () => {
      setTrailPosition(prev => {
        const dx = mousePosition.current.x - prev.x;
        const dy = mousePosition.current.y - prev.y;
        
        // Adjust the speed factor for the spring momentum delay
        const easeFactor = 0.16; 
        
        return {
          x: prev.x + dx * easeFactor,
          y: prev.y + dy * easeFactor
        };
      });

      requestRef.current = requestAnimationFrame(updateTrail);
    };
    requestRef.current = requestAnimationFrame(updateTrail);

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
      window.removeEventListener('resize', checkIfTouch);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  // Return empty if reduced motion requested or if we are on a touch device
  if (isReducedMotion || isMobile || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Hide original default cursor globally when this premium component is mounted */}
      <style>{`
        @media (pointer: fine) {
          body, html, a, button, select, input, textarea, [role="button"], .cursor-pointer {
            cursor: none !important;
          }
        }
      `}</style>

      {/* Main Core Dot Cursor */}
      <div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full bg-amber-500 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 mix-blend-difference"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate3d(-50%, -50%, 0) scale(${isClicking ? 0.75 : isHovered ? 1.5 : 1})`,
        }}
      />

      {/* Secondary Trailing Circle with Interpolated Lags */}
      <div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-amber-500/50 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 will-change-transform flex items-center justify-center"
        style={{
          left: `${trailPosition.x}px`,
          top: `${trailPosition.y}px`,
          transform: `translate3d(-50%, -50%, 0) scale(${isClicking ? 0.85 : isHovered ? 1.8 : 1})`,
          transition: 'transform 0.15s cubic-bezier(0.1, 0.8, 0.2, 1), border-color 0.2s ease',
          backgroundColor: isHovered ? 'rgba(217, 167, 82, 0.08)' : 'transparent',
          borderColor: isHovered ? '#D9A752' : 'rgba(217, 167, 82, 0.4)'
        }}
      >
        {/* Subtle center crosshair in interactive state */}
        {isHovered && (
          <div className="w-1 h-1 rounded-full bg-amber-500 animation-pulse" />
        )}
      </div>
    </>
  );
}
