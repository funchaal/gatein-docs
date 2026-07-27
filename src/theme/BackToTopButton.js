import React, { useEffect, useState } from 'react';

export default function BackToTopButton() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
          const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
          setScrollProgress(progress);
          setIsVisible(scrollY > 150);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <div
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        cursor: 'pointer',
        zIndex: 9999,
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gatein-bg-deep)',
        border: '1px solid var(--gatein-border-subtle)',
        borderRadius: '50%',
        boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? (isHovered ? 'scale(1.12) translateY(-2px)' : 'scale(1)') : 'scale(0.8) translateY(10px)',
        pointerEvents: isVisible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
      }}
    >
      <svg
        width="48"
        height="48"
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="2.5"
          fill="none"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="var(--gatein-accent)"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'none' }}
        />
      </svg>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--gatein-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'transform 0.2s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        }}
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  );
}