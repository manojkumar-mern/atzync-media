'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { projects } from '@/data/projects';
import { soundManager } from '@/lib/audioManager';
import LazyVideo from '@/components/LazyVideo';
import { useSectionInView } from '@/lib/useSectionInView';

export default function SelectedWorkSection({ onOpenModal }) {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [sectionRef, isInView] = useSectionInView({ rootMargin: '350px' });
  const viewportRef = useRef(null);
  const cardsRef = useRef([]);

  const handlePrevCard = () => {
    if (activeProjectIndex > 0) {
      soundManager.playWhoosh();
      setActiveProjectIndex((prev) => prev - 1);
    }
  };

  const handleNextCard = () => {
    if (activeProjectIndex < projects.length - 1) {
      soundManager.playWhoosh();
      setActiveProjectIndex((prev) => prev + 1);
    }
  };

  const handleSelectCard = (index) => {
    if (index !== activeProjectIndex) {
      soundManager.playWhoosh();
      setActiveProjectIndex(index);
    }
  };

  // Ensure card elements are initially set and animated smoothly on activeProjectIndex change
  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards || cards.length === 0) return;

    cards.forEach((card, index) => {
      if (!card) return;

      if (index === activeProjectIndex) {
        gsap.to(card, {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'all',
          zIndex: 10,
          pointerEvents: 'auto',
        });
      } else if (index < activeProjectIndex) {
        // Previous cards -> slide upside (-105%)
        gsap.to(card, {
          yPercent: -105,
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'all',
          zIndex: index + 1,
          pointerEvents: 'none',
        });
      } else {
        // Upcoming cards -> waiting downside (+105%)
        gsap.to(card, {
          yPercent: 105,
          opacity: 0,
          scale: 0.95,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'all',
          zIndex: projects.length - index,
          pointerEvents: 'none',
        });
      }
    });
  }, [activeProjectIndex]);

  return (
    <section
      ref={sectionRef}
      className="border-bottom"
      id="work"
      style={{
        backgroundColor: 'var(--bg-light)',
        color: 'var(--text-dark-primary)',
        position: 'relative',
        paddingTop: 'clamp(4rem, 8vh, 6rem)',
        paddingBottom: 'clamp(3.5rem, 7vh, 5rem)',
      }}
    >
      <div
        ref={viewportRef}
        className="site-container flex-col justify-between"
        style={{
          boxSizing: 'border-box',
          gap: '1.75rem',
        }}
      >
        {/* Section Header */}
        <div className="flex-row items-center justify-between scroll-reveal stagger-1" style={{ zIndex: 10, gap: '0.5rem 1rem', width: '100%', alignItems: 'center' }}>
          <h2 className="heading-lg" style={{ fontSize: 'clamp(1.15rem, 3.2vw, 3rem)', color: 'var(--text-dark-primary)', margin: 0 }}>
            FEATURED PORTFOLIO
          </h2>
          <div className="flex-row items-center justify-end" style={{ gap: '0.45rem', marginLeft: 'auto', flexShrink: 0 }}>
            <span className="meta-tag" style={{ color: 'var(--text-dark-muted)', fontWeight: 600, fontSize: '0.7rem' }}>0{activeProjectIndex + 1} / 0{projects.length}</span>
            <Link
              href="/work"
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.8rem',
                fontSize: '0.68rem',
                borderRadius: '20px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-strong)',
                whiteSpace: 'nowrap',
              }}
              onClick={() => soundManager.playClick()}
            >
              VIEW ALL WORK →
            </Link>
          </div>
        </div>

        {/* Stage Wrapper holding Cards Deck + Arrow Controls on Right OUTSIDE card */}
        <div className="portfolio-main-stage-wrapper">
          {/* Cards Deck Container */}
          <div className="cards-deck-stage">
            {projects.map((project, index) => {
              const isCurrentOrNext = activeProjectIndex === index || activeProjectIndex + 1 === index || activeProjectIndex - 1 === index;
              const isInitiallyActive = index === 0;

              return (
                <div
                  key={project.id}
                  ref={(el) => (cardsRef.current[index] = el)}
                  className="crazy-card-item"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#0a0c14',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '24px',
                    boxShadow: '0 30px 70px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    zIndex: isInitiallyActive ? 10 : projects.length - index,
                    opacity: isInitiallyActive ? 1 : 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    willChange: 'transform, opacity',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                    padding: 0,
                  }}
                  onClick={() => {
                    soundManager.playWhoosh();
                    if (onOpenModal) {
                      onOpenModal({
                        title: project.title,
                        videoSrc: project.video,
                        posterSrc: project.poster,
                        aspect: project.aspect,
                        orientation: project.orientation,
                      });
                    }
                  }}
                  data-cursor="WATCH PROJECT"
                >
                  {/* Ambient Blurred Pillarbox/Letterbox Backdrop for Perfect Aspect-Ratio Frame */}
                  {project.poster && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        overflow: 'hidden',
                        borderRadius: '24px',
                        pointerEvents: 'none',
                        zIndex: 0,
                      }}
                    >
                      <img
                        src={project.poster}
                        alt=""
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'blur(35px) brightness(0.22)',
                          transform: 'scale(1.15)',
                          opacity: project.orientation === 'portrait' ? 0.8 : 0.35,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'radial-gradient(ellipse at center, rgba(10, 12, 20, 0.2) 0%, rgba(10, 12, 20, 0.9) 85%)',
                        }}
                      />
                    </div>
                  )}

                  {/* Video Stage Frame */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      borderRadius: '24px',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LazyVideo
                      poster={project.poster}
                      src={isInView && isCurrentOrNext ? project.video : undefined}
                      autoPlay={activeProjectIndex === index}
                      isPortrait={project.orientation === 'portrait'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Side Vertical Arrow Controls + Vertical Scroll Label OUTSIDE card */}
          <div className="portfolio-sidebar-controls-wrap">
            <div className="portfolio-arrow-controls" aria-label="Portfolio Navigation">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevCard();
                }}
                disabled={activeProjectIndex === 0}
                aria-label="Previous Project (Move Card Down)"
                className="portfolio-arrow-btn"
                title="Previous Project"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </button>

              <div className="flex-col items-center" style={{ gap: '5px' }}>
                {projects.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectCard(idx);
                    }}
                    aria-label={`Go to project ${idx + 1}`}
                    className={`portfolio-step-dot ${activeProjectIndex === idx ? 'active' : ''}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextCard();
                }}
                disabled={activeProjectIndex === projects.length - 1}
                aria-label="Next Project (Move Card Up)"
                className="portfolio-arrow-btn"
                title="Next Project"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* 2. Middle: Center Red Down Arrow Indicator between Left Bar and Right Text */}
            <div className="portfolio-center-red-arrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>

            {/* 3. Right: Vertical Scroll Text Label */}
            <div className="portfolio-vertical-scroll-label">
              <span>SCROLL TO EXPLORE MORE</span>
            </div>
          </div>
        </div>

        {/* Bottom Progress Nav — dots + bar + counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 10,
            paddingTop: '0.5rem',
            maxWidth: '1240px',
            width: '100%',
            margin: '0 auto',
          }}
        >
          {/* Dot indicators */}
          {projects.map((proj, idx) => (
            <button
              key={proj.id}
              type="button"
              onClick={() => handleSelectCard(idx)}
              aria-label={`Go to ${proj.title} (project ${idx + 1} of ${projects.length})`}
              title={`Go to ${proj.title}`}
              className="portfolio-bottom-dot"
              style={{
                display: 'inline-block',
                width: activeProjectIndex === idx ? '1.5rem' : '0.4rem',
                height: '0.4rem',
                borderRadius: '99px',
                backgroundColor: activeProjectIndex === idx ? 'var(--accent-orange)' : 'rgba(0,0,0,0.25)',
                transition: 'all 0.4s ease',
                flexShrink: 0,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}

          {/* Progress bar fill */}
          <div
            style={{
              flex: 1,
              height: '1px',
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${((activeProjectIndex + 1) / projects.length) * 100}%`,
                backgroundColor: 'var(--accent-orange)',
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Right counter */}
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: 'var(--text-dark-muted)',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            0{activeProjectIndex + 1} / 0{projects.length}
          </span>
        </div>
      </div>
    </section>
  );
}
