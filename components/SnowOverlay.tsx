"use client";

import React, { useEffect, useRef, useState } from 'react';

/**
 * HASSAAN AI ARCHITECT — Snow Protocol Overlay
 * High-performance canvas-based particle system.
 */
export function SnowOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  // Sync state with localStorage/global preference
  useEffect(() => {
    const syncSnow = () => {
      const snow = localStorage.getItem('panaversity-snow') === 'true';
      setIsEnabled(snow);
    };

    syncSnow();
    window.addEventListener('storage', syncSnow);
    // Custom event for internal toggles
    window.addEventListener('snow-toggle', syncSnow);
    
    return () => {
      window.removeEventListener('storage', syncSnow);
      window.removeEventListener('snow-toggle', syncSnow);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let flakes: any[] = [];
    const flakeCount = 60; // Optimal for performance + aesthetic

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Initialize flakes
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        d: Math.random() * flakeCount,
        v: Math.random() * 0.5 + 0.2, // Velocity
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(217, 119, 87, 0.15)'; // Slightly warm-toned snow for "Humanist" look
      ctx.beginPath();
      
      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    const update = () => {
      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        f.y += f.v;
        f.x += Math.sin(f.y / 50) * 0.5;

        if (f.y > canvas.height) {
          flakes[i] = { x: Math.random() * canvas.width, y: -10, r: f.r, d: f.d, v: f.v };
        }
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999] opacity-40 mix-blend-multiply transition-opacity duration-1000"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
}
