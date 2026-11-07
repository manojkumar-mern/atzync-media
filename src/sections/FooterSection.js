'use client';

import Link from 'next/link';
import { siteData } from '@/data/siteData';

export default function FooterSection() {
  return (
    <footer className="section-wrapper" style={{ paddingTop: 'clamp(2.5rem, 5vh, 4rem)', paddingBottom: 'clamp(2.5rem, 5vh, 4rem)', borderBottom: 'none' }}>
      <div className="site-container flex-col" style={{ gap: 'var(--space-md)' }}>
        <div className="flex-row items-center justify-between" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="flex-col" style={{ gap: '0.5rem' }}>
            <img
              src="/logo-white.webp"
              alt="ATZYNC Media"
              loading="lazy"
              decoding="async"
              style={{ height: 'clamp(45px, 4.5vw, 65px)', width: 'auto', objectFit: 'contain' }}
            />
            <span className="subheading" style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>{siteData.tagline}</span>
          </div>

          <div className="flex-row items-center" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Email Pill */}
            <a
              href={`mailto:${siteData.contact.email}`}
              className="footer-pill"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              {siteData.contact.email}
            </a>

            {/* WhatsApp Phone 1 Pill */}
            <a
              href={siteData.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-pill"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.119.553 4.11 1.519 5.84L0 24l6.337-1.499A11.939 11.939 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.87 0-3.619-.508-5.127-1.392l-.367-.217-3.774.893.916-3.666-.239-.379A9.954 9.954 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
              {siteData.contact.phone}
            </a>

            {/* Phone 2 Pill */}
            <a
              href={`tel:${siteData.contact.phoneSecondary.replace(/\s+/g, '')}`}
              className="footer-pill"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {siteData.contact.phoneSecondary}
            </a>

            {/* YouTube Pill */}
            <a
              href={siteData.contact.youtubeUrl || 'https://www.youtube.com/@atzyncmedia'}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-pill"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF0000">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>

            {/* Instagram Pill */}
            <a
              href={siteData.contact.instagramUrl || 'https://www.instagram.com/atzyncmedia/'}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-pill"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              Instagram
            </a>

            {/* LinkedIn Pill */}
            <a
              href={siteData.contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-pill"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#0a66c2">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              LinkedIn
            </a>

            {/* Work Link Pill */}
            <Link
              href="/work"
              className="footer-pill"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Selected Work
            </Link>
          </div>
        </div>

        <div
          className="border-top flex-row items-center justify-between"
          style={{
            marginTop: '2rem',
            paddingTop: '2rem',
            paddingBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
            borderColor: 'rgba(255, 255, 255, 0.12)',
          }}
        >
          <span className="meta-tag" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
            © {new Date().getFullYear()} {siteData.name}. ALL RIGHTS RESERVED.
          </span>
          <span className="meta-tag" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem', letterSpacing: '0.08em' }}>
            {siteData.statement}
          </span>
        </div>
      </div>
    </footer>
  );
}
