'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { siteData } from '@/data/siteData';

export default function PreloaderSection({ onComplete }) {
  const overlayRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const barRef = useRef(null);
  const recRef = useRef(null);
  const [timecodeStr, setTimecodeStr] = useState('00:00:00:00');

  useEffect(() => {
    // Check reduced motion preference or return-to-section navigation (skip fresh preloader curtain)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isReturningToWork =
      window.location.hash === '#work' ||
      sessionStorage.getItem('atzync_return_to_work') === '1';

    if (prefersReducedMotion || isReturningToWork) {
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
        overlayRef.current.style.visibility = 'hidden';
        overlayRef.current.style.pointerEvents = 'none';
      }
      if (onComplete) onComplete();
      return;
    }

    // Timecode ticker simulation during preloader
    let frame = 0;
    const interval = setInterval(() => {
      frame += 3;
      if (frame > 24) frame = 24;
      const sec = Math.floor(frame / 24);
      const sub = (frame % 24).toString().padStart(2, '0');
      setTimecodeStr(`00:00:0${sec}:${sub}`);
    }, 40);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          clearInterval(interval);
          if (overlayRef.current) {
            overlayRef.current.style.display = 'none';
            overlayRef.current.style.visibility = 'hidden';
            overlayRef.current.style.pointerEvents = 'none';
          }
          if (onComplete) onComplete();
        },
      });

      tl.to(recRef.current, {
        opacity: 1,
        duration: 0.2,
      })
      .to(titleRef.current, {
        opacity: 1,
        y: 0,
        letterSpacing: '0.08em',
        duration: 0.5,
        ease: 'power3.out',
      }, '-=0.1')
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.35,
        ease: 'power3.out',
      }, '-=0.2')
      .to(barRef.current, {
        scaleX: 1,
        duration: 0.45,
        ease: 'power2.inOut',
      }, '-=0.2')
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '+=0.1');
    }, overlayRef);

    return () => {
      clearInterval(interval);
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
        overlayRef.current.style.visibility = 'hidden';
        overlayRef.current.style.pointerEvents = 'none';
      }
      ctx.revert();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="preloader-overlay"
      aria-hidden="true"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
    >
      <div className="flex-col items-center" style={{ gap: '0.75rem', textAlign: 'center' }}>
        {/* REC & Timecode Header */}
        <div ref={recRef} className="flex-row items-center" style={{ gap: '1rem', opacity: 0 }}>
          <span className="timecode-tag" style={{ color: 'var(--text-primary)', fontSize: '0.8125rem' }}>
            REC // {timecodeStr}
          </span>
          <span className="meta-tag">4K DCI</span>
        </div>

        {/* Brand Display Title */}
        <div
          ref={titleRef}
          style={{
            opacity: 0,
            transform: 'translateY(28px)',
            margin: '0.5rem 0',
          }}
        >
          <img
            src="/logo-white.webp"
            alt="ATZYNC Media"
            fetchPriority="high"
            style={{
              height: 'clamp(70px, 10vw, 120px)',
              width: 'auto',
              objectFit: 'contain',
            }}
          />
        </div>

        <p
          ref={subtitleRef}
          className="subheading"
          style={{
            opacity: 0,
            transform: 'translateY(12px)',
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
          }}
        >
          {siteData.tagline}
        </p>

        {/* Calibration Progress Bar */}
        <div className="preloader-track" style={{ width: '180px' }}>
          <div ref={barRef} className="preloader-bar" />
        </div>
      </div>
    </div>
  );
}
