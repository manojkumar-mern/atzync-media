'use client';

import { useState } from 'react';
import Link from 'next/link';
import NavbarSection from '@/sections/NavbarSection';
import VideoModal from '@/components/VideoModal';
import ProjectModal from '@/components/ProjectModal';
import { projects } from '@/data/projects';
import { soundManager } from '@/lib/audioManager';

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    title: 'SHOWREEL 2026',
    videoSrc: '/videos/showreel.mp4',
    posterSrc: '/images/hero-poster.webp',
  });

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectService, setProjectService] = useState('');

  const handleOpenModal = (data) => {
    soundManager.playWhoosh();
    if (data) setModalData(data);
    setIsModalOpen(true);
  };

  const handleOpenProjectModal = (serviceTitle = '') => {
    soundManager.playClick();
    setProjectService(serviceTitle || '');
    setIsProjectModalOpen(true);
  };

  const categories = [
    { id: 'ALL', label: 'ALL WORK' },
    { id: 'Commercial Ad Film', label: 'COMMERCIAL AD FILM' },
    { id: 'Product Photography', label: 'PRODUCT PHOTOGRAPHY' },
    { id: 'Corporate Videos', label: 'CORPORATE VIDEOS' },
    { id: 'Real Estate Videos', label: 'REAL ESTATE VIDEOS' },
    { id: 'Promotional Videos', label: 'PROMOTIONAL VIDEOS' },
    { id: 'Meta Ads', label: 'META ADS' },
  ];

  const filteredProjects = activeCategory === 'ALL'
    ? projects
    : projects.filter((p) => p.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <main className="main-viewport" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      <NavbarSection isLoaded={true} onOpenProjectModal={handleOpenProjectModal} />

      {/* Portfolio Header Hero Fold */}
      <section
        style={{
          paddingTop: 'clamp(7rem, 13vh, 9.5rem)',
          paddingBottom: 'clamp(2.5rem, 5vh, 4rem)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#07080c',
        }}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80vw',
            maxWidth: '900px',
            height: '400px',
            background: 'radial-gradient(ellipse, rgba(235, 94, 40, 0.12) 0%, rgba(7, 8, 12, 0) 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div className="site-container flex-col" style={{ gap: '1.25rem', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb & Subheading */}
          <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="flex-row items-center" style={{ gap: '0.6rem', fontSize: '0.75rem' }}>
              <Link
                href="/"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('atzync_return_to_work');
                  }
                }}
                style={{ color: 'var(--text-muted)', transition: 'color 0.2s ease' }}
                className="nav-link-item"
              >
                HOME
              </Link>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>ALL WORK</span>
            </div>

            <Link
              href="/#work"
              onClick={() => {
                soundManager.playClick();
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('atzync_return_to_work', '1');
                }
              }}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.9rem',
                fontSize: '0.7rem',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              ← BACK
            </Link>
          </div>

          {/* Main Title */}
          <div>
            <h1
              className="heading-lg"
              style={{
                fontSize: 'clamp(1.75rem, 4.2vw, 3.35rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              OUR WORK ARCHIVE
            </h1>
            <p
              className="body-lead"
              style={{
                maxWidth: '740px',
                marginTop: '0.85rem',
                fontSize: 'clamp(0.95rem, 1.4vw, 1.15rem)',
                color: 'rgba(255, 255, 255, 0.75)',
                lineHeight: 1.6,
              }}
            >
              Engineered for high retention, cinematic pacing, and commercial conversion. Explore our full suite of editorial cuts, commercial ads, viral short-form reels, Meta ad variations, and AI-assisted visual synthesis.
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="portfolio-filter-bar" style={{ marginTop: '1rem' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`portfolio-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => {
                  soundManager.playClick();
                  setActiveCategory(cat.id);
                }}
              >
                {cat.label} {cat.id === 'ALL' ? `(${projects.length})` : ''}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <section
        style={{
          paddingTop: 'clamp(2.5rem, 5vh, 4rem)',
          paddingBottom: 'clamp(4rem, 8vh, 6rem)',
        }}
      >
        <div className="site-container">
          <div className="portfolio-grid">
            {filteredProjects.map((project, index) => {
              return (
                <div
                  key={project.id}
                  className="portfolio-card film-crop-marks"
                  onClick={() =>
                    handleOpenModal({
                      title: project.title,
                      videoSrc: project.video,
                      posterSrc: project.poster,
                    })
                  }
                  data-cursor="WATCH FILM"
                >
                  {/* Media Visual Frame */}
                  <div className="portfolio-card-media">
                    <img
                      src={project.poster}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="portfolio-card-img"
                    />
                    <div className="portfolio-card-overlay" />

                    {/* Top Badges */}
                    <div
                      className="flex-row items-center justify-between"
                      style={{
                        position: 'absolute',
                        top: '0.85rem',
                        left: '0.85rem',
                        right: '0.85rem',
                        zIndex: 3,
                      }}
                    >
                      <span
                        className="badge-tag"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.75)',
                          backdropFilter: 'blur(8px)',
                          color: 'var(--accent-orange)',
                          borderColor: 'rgba(235, 94, 40, 0.4)',
                          fontSize: '0.65rem',
                        }}
                      >
                        0{index + 1} // {project.category.toUpperCase()}
                      </span>
                      <span className="timecode-tag" style={{ fontSize: '0.62rem', background: 'rgba(0,0,0,0.6)' }}>
                        {project.year}
                      </span>
                    </div>

                    {/* Play Hint */}
                    <div
                      aria-label={`Play ${project.title}`}
                      style={{
                        position: 'absolute',
                        bottom: '0.85rem',
                        left: '0.85rem',
                        zIndex: 3,
                        display: 'flex',
                        alignItems: 'center',
                        color: 'rgba(255, 255, 255, 0.92)',
                        filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.7))',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>

                  {/* Card Narrative Body */}
                  <div className="portfolio-card-body">
                    <div className="flex-col" style={{ gap: '0.4rem' }}>
                      <h3
                        style={{
                          fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)',
                          fontWeight: 900,
                          color: '#ffffff',
                          lineHeight: 1.15,
                          letterSpacing: '-0.02em',
                          textTransform: 'uppercase',
                          margin: 0,
                        }}
                      >
                        {project.title}
                      </h3>

                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: 'rgba(255, 255, 255, 0.65)',
                          lineHeight: 1.5,
                          marginTop: '0.25rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Conversion CTA Strip */}
      <section
        id="cta"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#0a0b10',
          paddingTop: 'clamp(2.5rem, 5vh, 3.5rem)',
          paddingBottom: 'clamp(1.5rem, 3vh, 2.5rem)',
          textAlign: 'center',
        }}
      >
        <div className="site-container flex-col items-center" style={{ gap: '1.25rem' }}>
          <span className="badge-tag">HAVE A FILM OR CAMPAIGN IN MIND?</span>
          <h2 className="heading-lg" style={{ fontSize: 'clamp(1.75rem, 4vw, 3.2rem)', margin: 0 }}>
            LET&apos;S CREATE SOMETHING GREAT.
          </h2>
          <p className="body-lead" style={{ maxWidth: '600px', color: 'rgba(255,255,255,0.7)' }}>
            Elevate your brand with high-retention video production, high-fashion editing choreography, and performance ads.
          </p>

          <div className="flex-row items-center" style={{ gap: '0.85rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => handleOpenProjectModal()}
              className="btn-primary"
              style={{ padding: '0.85rem 1.8rem', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              START A PROJECT →
            </button>
            <Link
              href="/"
              className="btn-secondary"
              style={{ padding: '0.85rem 1.8rem', fontSize: '0.82rem' }}
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
      </section>

      <VideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalData.title}
        videoSrc={modalData.videoSrc}
        posterSrc={modalData.posterSrc}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        initialService={projectService}
      />
    </main>
  );
}
