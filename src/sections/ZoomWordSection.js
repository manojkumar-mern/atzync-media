'use client';

import { useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';

export default function ZoomWordSection() {
  const containerRef = useRef(null);
  const zoomTextRef = useRef(null);
  const metaLeftRef = useRef(null);
  const metaRightRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !zoomTextRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;
      const targetScale = isMobile ? 14 : 50;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: isMobile ? true : 0.35,
          invalidateOnRefresh: true,
        },
      });

      // 1. Fade out surrounding cues early so user focuses on the typography
      tl.to(
        [metaLeftRef.current, metaRightRef.current, cueRef.current],
        {
          autoAlpha: 0,
          y: -15,
          duration: 0.2,
          ease: 'power2.out',
          force3D: true,
        },
        0
      );

      // 2. High-precision vector scale
      tl.fromTo(
        zoomTextRef.current,
        {
          scale: 1,
          autoAlpha: 1,
        },
        {
          scale: targetScale,
          ease: 'power1.in',
          duration: 1.0,
        },
        0
      );

      // 3. Smooth opacity release right at the exit edge
      tl.to(
        zoomTextRef.current,
        {
          autoAlpha: 0,
          duration: 0.15,
          ease: 'power1.out',
        },
        0.85
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="zoom-word-section"
      style={{
        position: 'relative',
        height: '115vh',
        backgroundColor: '#0a0b10',
        color: '#ffffff',
      }}
    >
      {/* Sticky Viewport Stage (100vh GPU Composited) */}
      <div
        className="zoom-sticky-stage"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          isolation: 'isolate',
        }}
      >
        {/* Ambient Background Glow */}
        <div
          style={{
            position: 'absolute',
            width: '80vw',
            height: '80vw',
            maxWidth: '700px',
            maxHeight: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(235, 94, 40, 0.14) 0%, rgba(235, 94, 40, 0.03) 45%, rgba(10, 11, 16, 0) 75%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Top HUD Indicators */}
        <div
          className="site-container flex-row items-center justify-between"
          style={{
            position: 'absolute',
            top: 'clamp(2rem, 5vh, 3.5rem)',
            left: 0,
            right: 0,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div ref={metaLeftRef} className="flex-row items-center" style={{ gap: '0.75rem' }}>
            <span className="subheading" style={{ color: 'var(--text-secondary)', letterSpacing: '0.14em', fontWeight: 700 }}>
              OUR EXPERTISE
            </span>
          </div>

          <div ref={metaRightRef} className="flex-row items-center" style={{ gap: '0.5rem' }}>
            <span className="meta-tag" style={{ opacity: 0.7 }}>IDEAS → VISUALS → IMPACT</span>
          </div>
        </div>

        {/* Scaled Typography Container (Vector SVG Text for Infinite Razor-Sharp Resolution) */}
        <div
          ref={zoomTextRef}
          className="zoom-text-wrapper"
          style={{
            position: 'relative',
            zIndex: 5,
            width: '90vw',
            maxWidth: '1200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: '52% 50%',
            pointerEvents: 'none',
          }}
        >
          <svg
            viewBox="0 0 4240 960"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              width: '100%',
              height: 'auto',
              overflow: 'visible',
              shapeRendering: 'geometricPrecision',
              textRendering: 'geometricPrecision',
            }}
          >
            {/* Bold Display Word: ATZYNC */}
            <text
              x="50%"
              y="58%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="var(--font-display, Impact, sans-serif)"
              fontSize="800"
              fontWeight="900"
              letterSpacing="0.04em"
              style={{
                textTransform: 'uppercase',
              }}
            >
              ATZYNC
            </text>
          </svg>
        </div>

        {/* Bottom Scroll Cue */}
        <div
          ref={cueRef}
          className="flex-col items-center"
          style={{
            position: 'absolute',
            bottom: 'clamp(2rem, 5vh, 3.5rem)',
            zIndex: 10,
            gap: '0.4rem',
            pointerEvents: 'none',
          }}
        >
          <span className="meta-tag" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.75rem', letterSpacing: '0.15em' }}>
            SCROLL TO DIVE IN
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-orange)" strokeWidth="2.2">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
