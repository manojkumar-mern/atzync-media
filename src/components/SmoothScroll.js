'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function SmoothScroll({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    let activeLenis = null;

    const initLenis = () => {
      if (activeLenis) {
        activeLenis.destroy();
        activeLenis = null;
      }

      const isAdmin = pathname?.startsWith('/admin');
      const adminWrapper = isAdmin ? document.querySelector('.admin-content-body') : null;

      const options = {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        syncTouch: false,
      };

      if (adminWrapper) {
        options.wrapper = adminWrapper;
        options.content = adminWrapper;
      }

      activeLenis = new Lenis(options);
      activeLenis.on('scroll', ScrollTrigger.update);
      window.lenis = activeLenis;
    };

    initLenis();

    const updateTicker = (time) => {
      if (activeLenis) {
        activeLenis.raf(time * 1000);
      }
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Global Scroll Reveal Observer for smooth, staggered down-to-up entry
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px 50px 0px',
        threshold: 0.05,
      }
    );

    const observeElements = () => {
      const elements = document.querySelectorAll('.scroll-reveal');
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      elements.forEach((el) => {
        if (el.classList.contains('is-revealed')) return;

        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.9 && rect.bottom >= 0) {
          el.classList.add('is-revealed');
        } else {
          revealObserver.observe(el);
        }
      });
    };

    // Run initial observation check
    const initTimer = setTimeout(observeElements, 50);

    // MutationObserver to automatically catch dynamically mounted elements or admin wrapper
    const mutationObserver = new MutationObserver(() => {
      observeElements();

      if (pathname?.startsWith('/admin')) {
        const adminWrapper = document.querySelector('.admin-content-body');
        if (adminWrapper && activeLenis && activeLenis.options?.wrapper !== adminWrapper) {
          initLenis();
        }
      }
    });

    if (document.body) {
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

    const handleResize = () => {
      observeElements();
      const currentWidth = window.innerWidth;
      const isCoarseTablet = currentWidth <= 1024 && window.matchMedia('(pointer: coarse)').matches;
      // On mobile & touch tablets, ignore height-only resizes caused by browser address bar show/hide
      // so pinned ScrollTriggers and page scroll position do not jump when stopping scroll
      if ((currentWidth < 768 || isCoarseTablet) && currentWidth === lastWidth) {
        return;
      }
      lastWidth = currentWidth;
      ScrollTrigger.refresh();
    };

    const handleFocus = () => {
      observeElements();
      const currentWidth = window.innerWidth;
      const isCoarseTablet = currentWidth <= 1024 && window.matchMedia('(pointer: coarse)').matches;
      if (currentWidth >= 768 && !isCoarseTablet) {
        ScrollTrigger.refresh();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (window.lenis === activeLenis) window.lenis = null;
      gsap.ticker.remove(updateTicker);
      clearTimeout(initTimer);
      revealObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('focus', handleFocus);
      if (activeLenis) {
        activeLenis.destroy();
      }
    };
  }, [pathname]);

  // On route changes (pathname changes), re-observe elements and refresh GSAP ScrollTrigger
  useEffect(() => {
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('.scroll-reveal');
      const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= windowHeight * 0.9 && rect.bottom >= 0) {
          el.classList.add('is-revealed');
        }
      });
      ScrollTrigger.refresh();

      // Automatically scroll to hash target if coming from another page
      if (typeof window !== 'undefined' && window.location.hash) {
        const hash = window.location.hash;
        const targetEl = document.querySelector(hash);
        if (targetEl && window.lenis) {
          window.lenis.scrollTo(targetEl, { offset: 0, duration: 1.2 });
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return <>{children}</>;
}
