"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function AmbientFireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const myConfetti = confetti.create(canvasRef.current, {
      resize: true,
      useWorker: true,
    });

    const COLORS = [
      "#0077b6", "#3b96f5", "#5eb5f9", // ocean blues
      "#f77f00", "#ff9b33", "#ffd60a", // coral/sand
      "#90e0ef",                        // light blue
    ];

    function fireBurst() {
      const originX = 0.1 + Math.random() * 0.8;
      const originY = 0.2 + Math.random() * 0.5;
      const particleCount = 15 + Math.floor(Math.random() * 16); // 15-30

      myConfetti({
        particleCount,
        spread: 60 + Math.random() * 30,
        origin: { x: originX, y: originY },
        startVelocity: 20 + Math.random() * 15,
        gravity: 0.8,
        scalar: 0.7 + Math.random() * 0.2,
        decay: 0.92,
        ticks: 80 + Math.floor(Math.random() * 40),
        colors: COLORS,
        disableForReducedMotion: true,
      });
    }

    fireBurst(); // fire once immediately
    const intervalId = setInterval(fireBurst, 3000);

    return () => {
      clearInterval(intervalId);
      myConfetti.reset();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="print-hide fixed inset-0 w-full h-full"
      style={{ pointerEvents: "none", zIndex: 0 }}
    />
  );
}
