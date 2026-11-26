import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);

  // Prevent mobile browser address-bar show/hide from triggering ScrollTrigger.refresh()
  // which causes pin jumps and zoom flicker when stopping scroll on mobile
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });

  // Set default animation easing and duration for cinematic feel
  gsap.defaults({
    ease: 'power3.out',
    duration: 1.2,
  });
}

export { gsap, ScrollTrigger };
