'use client';

import { useState, useEffect } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import PreloaderSection from '@/sections/PreloaderSection';
import NavbarSection from '@/sections/NavbarSection';
import HeroSection from '@/sections/HeroSection';
import AboutSection from '@/sections/AboutSection';
import ServicesSection from '@/sections/ServicesSection';
// import WhatWeDoSection from '@/sections/WhatWeDoSection';
import SelectedWorkSection from '@/sections/SelectedWorkSection';
import CTASection from '@/sections/CTASection';
import FooterSection from '@/sections/FooterSection';
import dynamic from 'next/dynamic';

const VideoModal = dynamic(() => import('@/components/VideoModal'), { ssr: false });
const ProjectModal = dynamic(() => import('@/components/ProjectModal'), { ssr: false });

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ title: 'SHOWREEL 2026', posterSrc: '/images/hero-poster.webp' });

  // Project Inquiry Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectService, setProjectService] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timers = [];
    const scrollToWork = () => {
      ScrollTrigger.refresh();
      const workEl = document.getElementById('work');
      if (!workEl) return;
      const targetTop = Math.max(0, Math.round(workEl.getBoundingClientRect().top + window.scrollY));
      if (window.lenis) {
        window.lenis.scrollTo(targetTop, { immediate: true, force: true });
      }
      window.scrollTo({ top: targetTop, behavior: 'instant' });
      if (window.location.hash !== '#work') {
        window.history.replaceState(window.history.state, '', '/#work');
      }
    };

    const triggerReturnToWork = () => {
      const shouldReturnToWork =
        window.location.hash === '#work' ||
        sessionStorage.getItem('atzync_return_to_work') === '1';

      if (!shouldReturnToWork) return;
      sessionStorage.removeItem('atzync_return_to_work');
      window.__atzyncReturningToWorkUntil = Date.now() + 1000;

      timers.push(requestAnimationFrame(scrollToWork));
      timers.push(setTimeout(scrollToWork, 80));
      timers.push(setTimeout(scrollToWork, 250));
      timers.push(setTimeout(scrollToWork, 550));
      timers.push(setTimeout(scrollToWork, 900));
    };

    triggerReturnToWork();
    window.addEventListener('popstate', triggerReturnToWork);
    window.addEventListener('pageshow', triggerReturnToWork);

    return () => {
      window.removeEventListener('popstate', triggerReturnToWork);
      window.removeEventListener('pageshow', triggerReturnToWork);
      timers.forEach((id) => {
        cancelAnimationFrame(id);
        clearTimeout(id);
      });
    };
  }, []);

  const handleOpenModal = (data) => {
    if (data) setModalData(data);
    setIsModalOpen(true);
  };

  const handleOpenProjectModal = (serviceTitle = '') => {
    setProjectService(serviceTitle || '');
    setIsProjectModalOpen(true);
  };

  return (
    <main className="main-viewport">
      <PreloaderSection onComplete={() => setIsLoaded(true)} />
      <NavbarSection isLoaded={isLoaded} onOpenProjectModal={handleOpenProjectModal} />

      <HeroSection isLoaded={isLoaded} onOpenModal={handleOpenModal} onOpenProjectModal={handleOpenProjectModal} />
      <AboutSection />
      <ServicesSection onOpenProjectModal={handleOpenProjectModal} />
      {/* <WhatWeDoSection /> */}
      <SelectedWorkSection onOpenModal={handleOpenModal} />
      <CTASection onOpenModal={handleOpenModal} onOpenProjectModal={handleOpenProjectModal} />
      <FooterSection />

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
