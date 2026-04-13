"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

/**
 * HASSAAN AI ARCHITECT — Atmospheric Protocol
 * v4.0: Photorealistic Canvas Snow (Dark Mode) + Cinematic Sun Flare (Light Mode)
 */
export function SnowOverlay() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isSnowEnabled, setIsSnowEnabled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check initial local storage
    const savedSnow = localStorage.getItem("h1_snow_enabled") === "true";
    setIsSnowEnabled(savedSnow);
    
    const handleToggle = (e: any) => {
      setIsSnowEnabled(e.detail?.enabled);
    };
    
    window.addEventListener("toggle-snow" as any, handleToggle);
    return () => window.removeEventListener("toggle-snow" as any, handleToggle);
  }, []);

  const isDarkMode = resolvedTheme === "dark";
  const shouldShowSnow = isDarkMode || isSnowEnabled;
  const shouldShowSun = !isDarkMode; // Light mode gets the sun

  // Canvas Snow Logic
  useEffect(() => {
    if (!mounted || !shouldShowSnow || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let flakes: any[] = [];
    const flakeCount = window.innerWidth < 768 ? 70 : 180; // High frequency for realistic effect

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resize);
    resize();

    // Initialize flakes with different depth layers (size, speed, blur)
    for (let i = 0; i < flakeCount; i++) {
        const depth = Math.random(); 
        flakes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: depth * 2.5 + 0.5,
            v: depth * 2.0 + 0.5, 
            swing: Math.random() * Math.PI * 2,
            swingSpeed: Math.random() * 0.015 + 0.005,
            opacity: depth * 0.7 + 0.3
        });
    }

    let time = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 1;
      
      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        
        ctx.beginPath();
        // Create glassy/glowing effect
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.shadowBlur = f.size * 4;
        ctx.shadowColor = "rgba(255, 255, 255, 0.9)";
        
        const swingX = Math.sin(time * f.swingSpeed + f.swing) * (f.size * 1.5);
        
        ctx.arc(f.x + swingX, f.y, f.size, 0, Math.PI * 2, true);
        ctx.fill();

        f.y += f.v;
        
        if (f.y > canvas.height + 10) {
          flakes[i] = { 
            ...f, 
            x: Math.random() * canvas.width, 
            y: -10 
          };
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, shouldShowSnow, isDarkMode]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[8888] overflow-hidden">
        {/* MAGICAL SNOW CANVAS (Dark Mode) */}
        <AnimatePresence>
            {shouldShowSnow && (
                <motion.canvas
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ 
                        mixBlendMode: "screen",
                        filter: "contrast(1.2) brightness(1.15)"
                    }}
                />
            )}
        </AnimatePresence>

        {/* CINEMATIC REALISTIC SUN FLARE (Light Mode) */}
        <AnimatePresence>
            {shouldShowSun && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: -100, y: -100 }}
                    animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -100, y: -100, transition: { duration: 0.8 } }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    className="absolute top-[-15%] left-[-10%] w-[90vw] h-[90vw] max-w-[900px] max-h-[900px] rounded-full mix-blend-soft-light md:mix-blend-screen"
                    style={{
                        background: "radial-gradient(circle, rgba(255,245,200,0.85) 0%, rgba(255,210,130,0.4) 15%, rgba(255,180,80,0.1) 40%, transparent 70%)",
                        boxShadow: "0 0 150px 100px rgba(255,220,120,0.25)",
                        filter: "blur(25px)"
                    }}
                >
                    <div className="absolute top-[20%] left-[20%] w-[12%] h-[12%] bg-white rounded-full blur-[8px]" />
                    <div className="absolute top-1/2 left-1/2 w-[250%] h-[12px] bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-[35deg] blur-[5px]" />
                    <div className="absolute top-1/2 left-1/2 w-[180%] h-[8px] bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-1/2 -translate-y-1/2 -rotate-[20deg] blur-[4px]" />
                    <div className="absolute top-1/2 left-1/2 w-[150%] h-[20px] bg-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent -translate-x-1/2 -translate-y-1/2 rotate-[60deg] blur-[8px]" />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
