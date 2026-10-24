'use client';

import { useState, useRef, useEffect } from 'react';
import { siteData } from '@/data/siteData';
import { useSectionInView } from '@/lib/useSectionInView';
import { soundManager } from '@/lib/audioManager';

export default function AboutSection() {
  const [sectionRef, isInView] = useSectionInView({ rootMargin: '350px' });
  const [tiltStyle, setTiltStyle] = useState({});
  const cardRef = useRef(null);
  const statsRef = useRef(null);

  const stats = [
    { value: '3+', label: 'YEARS OF EXPERIENCE' },
    { value: '50+', label: 'PROJECTS COMPLETED' },
    { value: '99.8%', label: 'CLIENT RETENTION RATE' },
  ];

  const [animatedStats, setAnimatedStats] = useState(['0+', '0+', '0.0%']);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!statsRef.current) return;

    let animFrameId = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          const startTime = performance.now();
          const duration = 1100; // ms ticker duration

          const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic

            const val1 = `${Math.floor(ease * 3)}+`;
            const val2 = `${Math.floor(ease * 50)}+`;
            const val3 = `${(ease * 99.8).toFixed(1)}%`;

            setAnimatedStats([val1, val2, val3]);

            if (progress < 1) {
              animFrameId = requestAnimationFrame(animate);
            } else {
              setAnimatedStats(['3+', '50+', '99.8%']);
            }
          };

          animFrameId = requestAnimationFrame(animate);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(statsRef.current);

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      observer.disconnect();
    };
  }, []);

  // Interactive 3D Card Tilt Effect following Cursor Position
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg X-rotation
    const rotateY = ((x - centerX) / centerX) * 9;  // Max 9 deg Y-rotation

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    });
  };

  // Image CSS filter generator based on active mode
  const getImageFilter = () => {
    switch (activeFilter) {
      case 'lut':
        return 'contrast(1.18) saturate(1.4) hue-rotate(-8deg) brightness(1.03)';
      case 'mono':
        return 'grayscale(1) contrast(1.3) brightness(0.95)';
      default:
        return 'none';
    }
  };

  return (
    <section
      ref={sectionRef}
      className="section-wrapper border-bottom"
      id="about"
      style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-dark-primary)', overflow: 'hidden' }}
    >
      <div className="site-container flex-col" style={{ gap: 'var(--space-xl)' }}>
        {/* Main Content Grid: Vertical Interactive Portrait Card + Right Content Column */}
        <div className="grid-2col items-start" style={{ gap: 'var(--space-xl)' }}>
          {/* Left Column: Interactive 3D Vertical Portrait Studio Card */}
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="scroll-reveal stagger-2"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '460px',
              height: 'clamp(570px, 68vh, 690px)',
              margin: '0 auto',
              borderRadius: '26px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
              background: '#07080c',
              cursor: 'pointer',
              ...tiltStyle,
            }}
          >
            {/* Background Portrait Image */}
            {isInView ? (
              <img
                src="/images/atzync-founder.webp"
                alt="ATZYNC Media Founder & Creative Director"
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: 'calc(100% + 10px)',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  transform: 'translateY(-10px)',
                  transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#07080c' }} />
            )}
          </div>

          {/* Right Column: Title Header + Statement + Founder Credit */}
          <div className="flex-col" style={{ gap: 'var(--space-md)' }}>
            {/* Section Header on the Right Side */}
            <div className="flex-col scroll-reveal stagger-1" style={{ gap: '0.5rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  color: 'var(--text-dark-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                ABOUT US
              </h2>
              <h3
                style={{
                  fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)',
                  fontFamily: 'var(--font-heading)',
                  color: 'var(--text-dark-primary)',
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.18,
                }}
              >
                {siteData.about.headline}
              </h3>
            </div>

            <p className="body-lead scroll-reveal stagger-3" style={{ fontSize: 'clamp(1.05rem, 1.4vw, 1.25rem)', color: 'var(--text-dark-primary)' }}>
              {siteData.about.description}
            </p>

            {/* Founder / Managing Director Highlight Card */}
            <div
              className="scroll-reveal stagger-4"
              style={{
                background: 'linear-gradient(135deg, rgba(7, 8, 12, 0.05) 0%, rgba(7, 8, 12, 0.02) 100%)',
                border: '1px solid rgba(7, 8, 12, 0.12)',
                borderLeft: '4px solid #07080c',
                borderRadius: '16px',
                padding: '1.1rem 1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div className="flex-col" style={{ gap: '0.25rem' }}>
                <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-dark-primary)', letterSpacing: '0.02em' }}>
                  {siteData.founder.name}
                </span>
                <span className="subheading" style={{ fontSize: '0.75rem', color: 'var(--text-dark-secondary)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {siteData.founder.role}
                </span>
              </div>

              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(7, 8, 12, 0.06)',
                  color: 'rgba(7, 8, 12, 0.75)',
                  border: '1px solid rgba(7, 8, 12, 0.12)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                EXECUTIVE LEAD
              </span>
            </div>

            {/* Stats Grid */}
            <div ref={statsRef} className="grid-3col border-top" style={{ paddingTop: 'var(--space-md)', gap: '1rem', borderTopColor: 'var(--border-light-subtle)' }}>
              {stats.map((stat, i) => (
                <div key={i} className={`flex-col items-center scroll-reveal stagger-${i + 3}`} style={{ gap: '0.25rem', textAlign: 'center' }}>
                  <span className="display-title" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--text-dark-primary)', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
                    {animatedStats[i] || stat.value}
                  </span>
                  <span className="meta-tag" style={{ fontSize: '0.6875rem', color: 'var(--text-dark-muted)', textAlign: 'center' }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

