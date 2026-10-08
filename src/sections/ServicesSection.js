'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { siteData } from '@/data/siteData';
import { soundManager } from '@/lib/audioManager';
import { useSectionInView } from '@/lib/useSectionInView';

export default function ServicesSection({ onOpenProjectModal }) {
  const [sectionRef, isInView] = useSectionInView({ rootMargin: '350px' });
  const [activeCardId, setActiveCardId] = useState(null);
  const zoomStageRef = useRef(null);
  const zoomTextRef = useRef(null);
  const cardsGridRef = useRef(null);

  const serviceImages = [
    '/images/project-01.webp',
    '/images/project-02.webp',
    '/images/project-03.webp',
    '/images/studio-suite.webp',
    '/images/hero-poster.webp',
    '/images/brand-poster.webp',
    '/images/color-after.webp',
  ];

  const serviceItems = siteData.services.map((srv, idx) => ({
    ...srv,
    image: serviceImages[idx % serviceImages.length],
  }));

  useEffect(() => {
    if (!sectionRef.current || !zoomTextRef.current || !cardsGridRef.current || !zoomStageRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = cardsGridRef.current.querySelectorAll('.service-card');
      const isMobile = window.innerWidth < 768;
      const targetScale = isMobile ? 12 : 36; // GPU-optimized scale factor for buttery smooth performance

      // Pin section during zoom phase so cards assemble seamlessly on screen
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: isMobile ? '+=60%' : '+=85%',
          pin: true,
          pinSpacing: true,
          scrub: isMobile ? true : 0.35, // Direct touch tracking on mobile for zero lag/shaking
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      // 1. Kinetic Typography Zoom on "SERVICES"
      tl.fromTo(
        zoomTextRef.current,
        {
          scale: 1,
          opacity: 1,
        },
        {
          scale: targetScale,
          opacity: 0,
          ease: 'power1.in',
          duration: 1.0,
        },
        0
      );

      // 2. Smoothly fade out zoom stage overlay
      tl.fromTo(
        zoomStageRef.current,
        {
          opacity: 1,
        },
        {
          opacity: 0,
          duration: 0.4,
          ease: 'power1.out',
        },
        0.45
      );

      // 3. Staggered card entrance: sliding smoothly from side corners and bottom-up
      cards.forEach((card, idx) => {
        const col = isMobile ? 0 : idx % 3;
        let startX = 0;
        let startY = 40;

        if (!isMobile) {
          if (col === 0) {
            startX = -60;
            startY = 35;
          } else if (col === 1) {
            startX = 0;
            startY = 50;
          } else {
            startX = 60;
            startY = 35;
          }
        }

        tl.fromTo(
          card,
          {
            opacity: 0,
            x: startX,
            y: startY,
            scale: 0.95,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            ease: 'power2.out',
            duration: 0.45,
          },
          0.25 + (idx * (isMobile ? 0.05 : 0.07))
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-bottom"
      id="services"
      style={{
        backgroundColor: '#0a0a0e',
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 'calc(80px + clamp(1.75rem, 3vh, 2.5rem))',
        paddingBottom: 'clamp(1.75rem, 3vh, 2.5rem)',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Pinned Kinetic Zoom Stage Overlay on "SERVICES" */}
      <div
        ref={zoomStageRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 30,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#0a0a0e',
        }}
      >
        {/* Ambient Radial Glow */}
        <div
          style={{
            position: 'absolute',
            width: '80vw',
            height: '80vw',
            maxWidth: '650px',
            maxHeight: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(235, 94, 40, 0.16) 0%, rgba(235, 94, 40, 0.04) 50%, rgba(10, 10, 14, 0) 75%)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Vector SVG Word: SERVICES */}
        <div
          ref={zoomTextRef}
          style={{
            position: 'relative',
            zIndex: 5,
            width: '90vw',
            maxWidth: '1200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transformOrigin: '50% 50%',
            pointerEvents: 'none',
          }}
        >
          <svg
            viewBox="0 0 4320 960"
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
            <text
              x="50%"
              y="58%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#ffffff"
              fontFamily="var(--font-display, Impact, sans-serif)"
              fontSize="760"
              fontWeight="900"
              letterSpacing="0.04em"
              style={{
                textTransform: 'uppercase',
              }}
            >
              SERVICES
            </text>
          </svg>
        </div>
      </div>

      {/* 3-Column Medium Sized Cards Grid */}
      <div className="site-container flex-col" style={{ width: '100%', position: 'relative', zIndex: 10 }}>
        <div
          ref={cardsGridRef}
          className="services-card-grid"
          style={{
            width: '100%',
            willChange: 'transform, opacity',
          }}
        >
          {serviceItems.map((item) => {
            const isActive = activeCardId === item.id;
            return (
              <div
                key={item.id}
                className={`service-card film-crop-marks ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth < 1024;
                  if (isMobileOrTablet) {
                    soundManager.playClick();
                    setActiveCardId((prev) => (prev === item.id ? null : item.id));
                  }
                }}
              >
                {/* Background Image Visual */}
                <img
                  src={isInView ? item.image : undefined}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="service-card-image"
                  style={{ opacity: isInView ? 1 : 0, transition: 'opacity 0.5s ease' }}
                />

                {/* Vignette Overlay */}
                <div className="service-card-overlay" />

                {/* Card Content Layer */}
                <div className="service-card-content">
                  {/* Bottom Bar: Title & Hover-Revealed Details */}
                  <div className="service-card-bottom">
                    <h3 className="service-card-title">{item.title}</h3>

                    {/* Revealed on Hover / Active */}
                    <div className="service-card-details">
                      <p className="body-lead" style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.95)', lineHeight: 1.45, fontWeight: 500 }}>
                        {item.tagline}
                      </p>

                      <p className="body-regular" style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.72)', lineHeight: 1.45 }}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
