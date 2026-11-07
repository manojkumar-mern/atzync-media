'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { siteData } from '@/data/siteData';
import { soundManager } from '@/lib/audioManager';

export default function HeroSection({ isLoaded, onOpenModal, onOpenProjectModal }) {
  const sectionRef = useRef(null);
  const metaRef = useRef(null);
  const ctaRef = useRef(null);
  const statementRef = useRef(null);
  const scrollCueRef = useRef(null);

  // Typewriter effect state for ATZYNC MEDIA title
  const targetLine1 = 'ATZYNC';
  const targetLine2 = 'MEDIA';
  const line1Chars = targetLine1.split('');
  const line2Chars = targetLine2.split('');
  const [typedCount1, setTypedCount1] = useState(0);
  const [typedCount2, setTypedCount2] = useState(0);
  const [mediaIndent, setMediaIndent] = useState(0);

  const titleWrapperRef = useRef(null);
  const nRef = useRef(null);

  useEffect(() => {
    if (!isLoaded) return;

    let idx1 = 0;
    let idx2 = 0;

    const timer1 = setInterval(() => {
      if (idx1 <= line1Chars.length) {
        setTypedCount1(idx1);
        idx1++;
      } else {
        clearInterval(timer1);
        const timer2 = setInterval(() => {
          if (idx2 <= line2Chars.length) {
            setTypedCount2(idx2);
            idx2++;
          } else {
            clearInterval(timer2);
          }
        }, 70);
      }
    }, 60);

    return () => {
      clearInterval(timer1);
    };
  }, [isLoaded]);

  useEffect(() => {
    const updateIndent = () => {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setMediaIndent(0);
        return;
      }
      if (nRef.current && titleWrapperRef.current) {
        const wrapperRect = titleWrapperRef.current.getBoundingClientRect();
        const nRect = nRef.current.getBoundingClientRect();
        const offset = nRect.left - wrapperRect.left;
        if (offset > 0) {
          setMediaIndent(offset);
        }
      }
    };

    updateIndent();
    window.addEventListener('resize', updateIndent);
    const t1 = setTimeout(updateIndent, 80);
    const t2 = setTimeout(updateIndent, 300);
    const t3 = setTimeout(updateIndent, 800);

    return () => {
      window.removeEventListener('resize', updateIndent);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isLoaded, typedCount1]);

  useEffect(() => {
    if (!isLoaded || !sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (!prefersReducedMotion) {
        const entranceTl = gsap.timeline({
          defaults: { ease: 'power3.out' },
        });

        entranceTl
          .fromTo(
            metaRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6 }
          )
          .fromTo(
            statementRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            '-=0.4'
          )
          .fromTo(
            ctaRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5 },
            '-=0.4'
          )
          .fromTo(
            scrollCueRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.5 },
            '-=0.2'
          );
      } else {
        gsap.set(
          [
            metaRef.current,
            statementRef.current,
            ctaRef.current,
            scrollCueRef.current,
          ],
          { opacity: 1, y: 0 }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoaded]);

  return (
    <section ref={sectionRef} className="hero-section border-bottom" id="hero" style={{ position: 'relative' }}>
      {/* Real Local Video Ambient Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.2,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 0,
        }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload={isLoaded ? 'metadata' : 'none'}
          src={isLoaded ? '/videos/project-01.mp4' : undefined}
          poster="/images/hero-poster.webp"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(24px) brightness(0.7)' }}
        />
      </div>

      <div className="site-container flex-col" style={{ gap: 'var(--space-md)', position: 'relative', zIndex: 1 }}>
        {/* FIRST FOLD: Takes 100% viewport height on mobile */}
        <div className="hero-first-fold-wrapper flex-col" style={{ gap: 'var(--space-md)' }}>
          {/* Header Metadata Ribbon */}
          <div
            ref={metaRef}
            className="flex-row items-center justify-end hero-meta-ribbon"
            style={{ opacity: isLoaded ? 1 : 0, flexWrap: 'wrap', gap: '0.5rem 1rem', justifyContent: 'flex-end' }}
          >
            <div className="badge-tag" style={{ fontSize: 'clamp(0.65rem, 2.2vw, 0.75rem)' }}>
              <span>CREATIVE VIDEO PRODUCTION STUDIO</span>
            </div>


          </div>

          {/* Oversized Kinetic Display Title with Typewriter Effect & Staggered Zig-Zag Offset */}
          <h1
            ref={titleWrapperRef}
            className="hero-display-wrapper film-crop-marks"
            aria-label="ATZYNC MEDIA"
            style={{
              margin: 0,
              padding: 0,
              fontSize: 'inherit',
              fontWeight: 'inherit',
              lineHeight: 'inherit',
              marginTop: 'clamp(0.75rem, 2vh, 1.75rem)',
              position: 'relative'
            }}
          >
            {/* Line 1: ATZYNC starting at left */}
            <span className="hero-title-line flex-row items-center" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <span className="display-hero" style={{ opacity: isLoaded ? 1 : 0, display: 'inline-flex', letterSpacing: '0.02em' }}>
                {line1Chars.map((char, index) => {
                  const isVisible = typedCount1 === 0 ? true : index < typedCount1;
                  const isInitialInverted = index === 0; // 'A' in ATZYNC starts upside down on desktop
                  const isN = index === 4; // 'N' letter in ATZYNC anchor for MEDIA
                  return (
                    <span
                      key={index}
                      ref={isN ? nRef : null}
                      className="hero-letter-box"
                      onClick={(e) => {
                        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                          e.currentTarget.classList.toggle('is-flipped');
                        }
                      }}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: 'opacity 0.15s ease',
                        display: 'inline-block',
                      }}
                    >
                      <span className={`hero-interactive-letter ${isInitialInverted ? 'initially-inverted' : ''}`}>
                        {char}
                      </span>
                    </span>
                  );
                })}
              </span>
            </span>

            {/* Line 2: MEDIA starting directly below the 'N' of ATZYNC (Zig-Zag alignment) */}
            <span
              className="hero-title-line hero-title-line-secondary flex-row items-center"
              style={{
                marginTop: '-0.15em',
                width: '100%',
                justify: 'flex-start',
                paddingLeft: `${mediaIndent}px`,
                transition: 'padding-left 0.25s ease-out',
              }}
            >
              <span
                className="display-hero display-hero-outline"
                style={{
                  opacity: isLoaded ? 1 : 0,
                  display: 'inline-flex',
                  letterSpacing: '0.02em',
                }}
              >
                {line2Chars.map((char, index) => {
                  const isVisible = typedCount2 === 0 && typedCount1 === 0 ? true : index < typedCount2;
                  return (
                    <span
                      key={index}
                      className="hero-letter-box"
                      onClick={(e) => {
                        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                          e.currentTarget.classList.toggle('is-flipped');
                        }
                      }}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: 'opacity 0.15s ease',
                        display: 'inline-block',
                      }}
                    >
                      <span className="hero-interactive-letter">
                        {char}
                      </span>
                    </span>
                  );
                })}
              </span>
            </span>
          </h1>

          {/* Subtitle & Brand Statement */}
          <div
            ref={statementRef}
            className="grid-2col items-center hero-statement-grid"
            style={{ opacity: isLoaded ? 1 : 0, marginTop: 'clamp(2.25rem, 5vh, 4rem)' }}
          >
            <div className="flex-col hero-text-col" style={{ gap: '0.5rem' }}>
              <span className="subheading" style={{ color: 'var(--text-primary)' }}>
                {siteData.tagline}
              </span>
              <h2 className="heading-md" style={{ letterSpacing: '0.04em', opacity: 0.95, textTransform: 'uppercase' }}>
                {siteData.headline}
              </h2>
            </div>

            <p className="body-lead hero-paragraph" style={{ opacity: 0.85, paddingLeft: 'clamp(0rem, 3.5vw, 2.5rem)' }}>
              Crafting high-impact video edits, cinematic storytelling, and high-converting ad campaigns engineered to amplify your brand across modern screens.
            </p>
          </div>

          {/* Hero CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex-row items-center justify-between hero-cta-wrapper"
            style={{ opacity: isLoaded ? 1 : 0, marginTop: 'clamp(2rem, 4.5vh, 3.5rem)', flexWrap: 'wrap', gap: '1.25rem' }}
          >
            <div className="flex-row items-center hero-cta-group" style={{ gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#work" className="btn-primary" onClick={() => soundManager.playWhoosh()}>
                VIEW OUR WORK
              </a>
              <button
                onClick={() => {
                  soundManager.playClick();
                  if (onOpenProjectModal) onOpenProjectModal();
                }}
                className="btn-secondary"
              >
                START A PROJECT
              </button>

            </div>

            {/* Scroll Cue Indicator */}
            <div ref={scrollCueRef} className="flex-row items-center hero-scroll-cue" style={{ gap: '0.5rem', opacity: 0.7 }}>
              <span className="meta-tag" style={{ fontSize: '0.6875rem' }}>SCROLL FOR CINEMATIC MOTIONS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
