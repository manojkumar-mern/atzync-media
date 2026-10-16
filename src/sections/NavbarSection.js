'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { siteData } from '@/data/siteData';

export default function NavbarSection({ isLoaded, onOpenProjectModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const navRef = useRef(null);
  const isNavClickRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const isWorkPage = pathname === '/work';

  // Scroll listener for sticky background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animation trigger
  useEffect(() => {
    if (!isLoaded || !navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }, navRef);

    return () => ctx.revert();
  }, [isLoaded]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }
    };
  }, [mobileMenuOpen]);

  // Scroll Spy effect to highlight active nav item and sync URL hash on scroll
  useEffect(() => {
    if (pathname !== '/') return;

    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const valid = ['hero', 'about', 'services', 'work', 'cta'];
      if (valid.includes(hashId)) {
        setActiveSection(hashId);
        if (hashId === 'hero') {
          window.history.replaceState(null, '', '/');
        }
      }
    }

    const sectionIds = ['hero', 'about', 'services', 'work', 'cta'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isNavClickRef.current) return;

        // If at the very top of the page, keep hero active and clean URL
        if (typeof window !== 'undefined' && window.scrollY < 120) {
          setActiveSection('hero');
          if (window.location.hash !== '') {
            window.history.replaceState(null, '', '/');
          }
          return;
        }

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(id);
            if (typeof window !== 'undefined') {
              if (id === 'hero') {
                if (window.location.hash !== '') {
                  window.history.replaceState(null, '', '/');
                }
              } else {
                const targetHash = `#${id}`;
                if (window.location.hash !== targetHash) {
                  window.history.replaceState(null, '', `/#${id}`);
                }
              }
            }
          }
        });
      },
      {
        // Require section to cross the vertical center (middle 20%) of the screen
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0,
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const hashId = window.location.hash.replace('#', '');
      const valid = ['about', 'services', 'work', 'cta'];
      if (hashId && valid.includes(hashId)) {
        setActiveSection(hashId);
      } else {
        setActiveSection('hero');
        if (hashId === 'hero') {
          window.history.replaceState(null, '', '/');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      sections.forEach((sec) => observer.unobserve(sec));
      observer.disconnect();
    };
  }, [pathname]);

  const handleNavClick = (e, item) => {
    // If mobile menu is open, close it and restore scrolling immediately
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }
    }

    if (pathname === '/') {
      // Home / Hero navigation
      if (item.id === 'hero' || item.href === '/') {
        if (e) e.preventDefault();
        isNavClickRef.current = true;
        setActiveSection('hero');
        if (typeof window !== 'undefined' && window.location.hash !== '') {
          window.history.pushState(null, '', '/');
        }

        const triggerScrollToTop = () => {
          if (typeof window !== 'undefined' && window.lenis) {
            window.lenis.start();
            window.lenis.scrollTo(0, {
              offset: 0,
              duration: 1.2,
              onComplete: () => {
                isNavClickRef.current = false;
              },
            });
          } else if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        };

        triggerScrollToTop();
        setTimeout(triggerScrollToTop, 50);

        setTimeout(() => {
          isNavClickRef.current = false;
        }, 1400);
        return;
      }

      const hashIndex = item.href.indexOf('#');
      if (hashIndex !== -1) {
        const hash = item.href.substring(hashIndex);
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          if (e) e.preventDefault();
          isNavClickRef.current = true;
          setActiveSection(item.id);
          window.history.pushState(null, '', item.href);

          const triggerScroll = () => {
            if (typeof window !== 'undefined' && window.lenis) {
              window.lenis.start();
              window.lenis.scrollTo(targetEl, {
                offset: 0,
                duration: 1.2,
                onComplete: () => {
                  isNavClickRef.current = false;
                },
              });
            } else if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          };

          triggerScroll();
          setTimeout(triggerScroll, 50);

          setTimeout(() => {
            isNavClickRef.current = false;
          }, 1400);
        }
      }
    } else {
      if (e) e.preventDefault();
      router.push(item.href);
    }
  };

  const navItems = [
    { label: 'HOME', href: '/', id: 'hero', number: '01' },
    { label: 'ABOUT', href: '/#about', id: 'about', number: '02' },
    { label: 'SERVICES', href: '/#services', id: 'services', number: '03' },
    { label: 'WORK', href: '/#work', id: 'work', number: '04' },
    { label: 'CONTACT', href: '/#cta', id: 'cta', number: '05' },
  ];

  return (
    <>
      <header
        ref={navRef}
        className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}
        style={{ opacity: isLoaded ? 1 : 0 }}
      >
        <div className="site-container flex-row items-center justify-between">
          {/* Brand Logo */}
          <a
            href="/"
            className="brand-logo flex-row items-center"
            style={{ gap: '0.75rem' }}
            onClick={(e) => {
              if (pathname === '/') {
                handleNavClick(e, navItems[0]);
              }
            }}
          >
            <span className="status-dot"></span>
            <img
              src="/logo-white.webp"
              alt="ATZYNC Media"
              fetchPriority="high"
              style={{
                height: 'clamp(34px, 3.6vw, 44px)',
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="desktop-nav flex-row items-center" style={{ gap: '2.5rem' }}>
            <div className="flex-row items-center" style={{ gap: '2rem' }}>
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`nav-link-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(e, item)}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <button
              onClick={() => {
                if (onOpenProjectModal) onOpenProjectModal();
              }}
              className="btn-secondary"
              style={{ padding: '0.55rem 1.4rem', fontSize: '0.75rem' }}
            >
              START PROJECT
            </button>
          </nav>

          {/* Creative Animated Mobile Menu Toggle Button */}
          <button
            className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className="hamburger-icon">
              <span className="hamburger-line line-1"></span>
              <span className="hamburger-line line-2"></span>
              <span className="hamburger-line line-3"></span>
            </div>
          </button>
        </div>
      </header>

      {/* Fullscreen Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
        data-lenis-prevent="true"
        data-lenis-prevent-touch="true"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex-col" style={{ gap: '1.75rem', marginTop: '2rem' }}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`mobile-nav-link ${activeSection === item.id ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, item)}
            >
              <span className="meta-tag" style={{ fontSize: '0.875rem' }}>
                {item.number}
              </span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <div className="border-top flex-col" style={{ paddingTop: '1.5rem', gap: '1rem' }}>
          <div className="flex-col" style={{ gap: '0.25rem' }}>
            <span className="meta-tag">DIRECT CONTACT</span>
            <a href={`mailto:${siteData.contact.email}`} className="body-regular" style={{ color: 'var(--text-primary)' }}>
              {siteData.contact.email}
            </a>
            <a href={siteData.contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="body-regular" style={{ color: 'var(--text-primary)' }}>
              WhatsApp: {siteData.contact.phone}
            </a>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            onClick={() => {
              setMobileMenuOpen(false);
              document.body.style.overflow = '';
              document.documentElement.style.overflow = '';
              if (typeof window !== 'undefined' && window.lenis) {
                window.lenis.start();
              }
              if (onOpenProjectModal) onOpenProjectModal();
            }}
          >
            START PROJECT
          </button>
        </div>
      </div>
    </>
  );
}
