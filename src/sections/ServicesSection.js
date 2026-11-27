'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from '@/lib/gsap';
import { siteData } from '@/data/siteData';
import { soundManager } from '@/lib/audioManager';
import { useSectionInView } from '@/lib/useSectionInView';

export default function ServicesSection({ onOpenProjectModal }) {
  const [sectionRef, isInView] = useSectionInView({ rootMargin: '500px' });
  const [activeCardId, setActiveCardId] = useState(null);
  const zoomStageRef = useRef(null);
  const zoomTextRef = useRef(null);
  const cardsGridRef = useRef(null);

  const serviceImageMap = {
    'commercial-ad-film': '/images/01-commercial-ad-film.webp',
    'product-photography': '/images/02-product-photography.webp',
    'corporate-videos': '/images/03-corporate-videos.webp',
    'real-estate-videos': '/images/04-real-estate-videos.webp',
    'promotional-videos': '/images/05-promotional-videos.webp',
    'meta-ads': '/images/06-meta-ads.webp',
  };

  const serviceImages = [
    '/images/01-commercial-ad-film.webp',
    '/images/02-product-photography.webp',
    '/images/03-corporate-videos.webp',
    '/images/04-real-estate-videos.webp',
    '/images/05-promotional-videos.webp',
    '/images/06-meta-ads.webp',
  ];

  const serviceItems = siteData.services.map((srv, idx) => ({
    ...srv,
    image: srv.image || serviceImageMap[srv.id] || serviceImages[idx % serviceImages.length],
  }));

  useEffect(() => {
    if (!sectionRef.current || !zoomTextRef.current || !cardsGridRef.current || !zoomStageRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = cardsGridRef.current.querySelectorAll('.service-card');
      const isSmallScreen = window.innerWidth <= 1024;
      const isPhone = window.innerWidth <= 640;
      const isMobileView = window.innerWidth <= 767;
      const mobileAnimatedCards = [];
      let wasBehindOverlay = false;
      let card2ExitingReverse = false;
      // Keep zoom scale smooth and within GPU texture bounds on phones, tablets, and desktops
      const targetScale = isPhone ? 8 : isSmallScreen ? 14 : 18;

      // Pin section during zoom phase so cards assemble seamlessly on screen
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: isPhone ? '+=60%' : isSmallScreen ? '+=70%' : '+=85%',
          pin: true,
          pinSpacing: true,
          scrub: isSmallScreen ? true : 0.25,
          anticipatePin: isSmallScreen ? 0 : 1,
          fastScrollEnd: false,
          invalidateOnRefresh: !isSmallScreen,
          onUpdate: (self) => {
            if (!isMobileView) return;
            const card2 = cards[1];
            // When scrolling back up into SERVICES zoom (< 0.78, well away from unpin boundary),
            // smoothly move Card 2 down alongside Card 1 without micro-bounce on touch deceleration
            if (card2) {
              if (self.direction === -1 && self.progress < 0.78 && !card2ExitingReverse) {
                card2ExitingReverse = true;
                gsap.to(card2, {
                  opacity: 0,
                  y: 85,
                  duration: 0.38,
                  ease: 'power2.out',
                  force3D: true,
                  overwrite: 'auto',
                });
              } else if (self.direction === 1 && self.progress >= 0.85 && card2ExitingReverse) {
                card2ExitingReverse = false;
                gsap.to(card2, {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: 'power3.out',
                  force3D: true,
                  overwrite: 'auto',
                });
              }
            }

            const behindOverlay = self.progress < 0.25;
            if (behindOverlay && !wasBehindOverlay) {
              wasBehindOverlay = true;
              card2ExitingReverse = false;
              mobileAnimatedCards.forEach((c) => {
                if (c) gsap.set(c, { opacity: 0, y: 70, overwrite: 'auto', force3D: true });
              });
            } else if (!behindOverlay) {
              wasBehindOverlay = false;
            }
          },
        },
      });

      // 1. Kinetic Typography Zoom on "SERVICES" (2D vector transform prevents GPU bitmap texture clipping/tiling)
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
          force3D: false,
        },
        0
      );

      // 2. Smoothly fade out zoom stage overlay (keep layer mounted via opacity instead of visibility toggle to prevent fast-scroll raster cuts)
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

      // 3. Card entrance:
      // - Mobile (<= 767px): Card 1 rises right as SERVICES finishes zooming; cards 2-6 glide up one-by-one
      //   on downward scroll (replaying every time you come from above, staying stable when scrolling up from footer)
      // - Tablet (768px-1024px): clean staggered entrance
      // - Desktop (> 1024px): full 3-column stagger
      cards.forEach((card, idx) => {
        if (isMobileView) {
          if (idx === 0) {
            tl.fromTo(
              card,
              {
                opacity: 0,
                y: 85,
              },
              {
                opacity: 1,
                y: 0,
                ease: 'power2.out',
                duration: 0.42,
                force3D: true,
              },
              0.58
            );
          } else {
            mobileAnimatedCards.push(card);
            gsap.set(card, { opacity: 0, y: 70, force3D: true });

            const triggerStart = idx === 1 ? 'top 44%' : idx === 2 ? 'top 74%' : 'top 88%';
            gsap.timeline({
              scrollTrigger: {
                trigger: card,
                pinnedContainer: sectionRef.current,
                start: triggerStart,
                onEnter: () => {
                  gsap.fromTo(
                    card,
                    { opacity: 0, y: 70 },
                    {
                      opacity: 1,
                      y: 0,
                      duration: 0.75,
                      ease: 'power3.out',
                      force3D: true,
                      overwrite: 'auto',
                    }
                  );
                },
              },
            });
          }
          return;
        }

        if (isSmallScreen) {
          tl.fromTo(
            card,
            {
              opacity: 0,
              y: 24,
            },
            {
              opacity: 1,
              y: 0,
              ease: 'power2.out',
              duration: 0.4,
              force3D: true,
            },
            0.35 + idx * 0.05
          );
          return;
        }

        const col = idx % 3;
        let startX = 0;
        let startY = 35;

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
          0.25 + idx * 0.07
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
      <h2 className="sr-only">SERVICES — Creative Video Production &amp; Digital Marketing</h2>

      {/* Pinned Kinetic Zoom Stage Overlay on "SERVICES" */}
      <div
        ref={zoomStageRef}
        className="services-zoom-stage"
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
          className="services-zoom-word-wrap"
          style={{
            position: 'relative',
            zIndex: 5,
            width: '90vw',
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
            className="services-zoom-svg"
            style={{
              width: '100%',
              height: 'auto',
              overflow: 'visible',
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
