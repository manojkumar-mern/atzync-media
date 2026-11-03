'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { soundManager } from '@/lib/audioManager';

export default function VideoModal({ isOpen, onClose, videoSrc, posterSrc, title = 'SHOWREEL 2026' }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const activeVideo = videoSrc || '/videos/showreel.mp4';

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, []);

  // Initialize HLS / Native playback when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      return;
    }

    // Modal opened: reset state to playing with sound
    setIsPlaying(true);
    setIsMuted(false);
    setShowControls(true);
    resetControlsTimeout();

    const video = videoRef.current;
    if (!video || !activeVideo) return;

    const isHls = typeof activeVideo === 'string' && activeVideo.includes('.m3u8');
    const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const startPlayback = () => {
      video.muted = false;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            // If browser blocks unmuted playback, fall back to muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
      }
    };

    // Safari Native HLS
    if (isHls && isSafari && video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== activeVideo) {
        video.src = activeVideo;
      }
      video.addEventListener('loadedmetadata', startPlayback, { once: true });
    }
    // Chromium / Firefox MSE via Hls.js
    else if (isHls && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        capLevelToPlayerSize: false, // Ensures full 4K UHD presentation without downscaling
      });

      hls.loadSource(activeVideo);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        startPlayback();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;
    }
    // Fallback regular video file
    else {
      if (video.src !== activeVideo) {
        video.src = activeVideo;
      }
      startPlayback();
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, activeVideo, resetControlsTimeout]);

  // Handle body lock, sound boom, and keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';
    soundManager.playSubBoom();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        resetControlsTimeout();
      }
      soundManager.playClick();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      soundManager.playClick();
      resetControlsTimeout();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  if (!isOpen) return null;

  // Controls are visible when paused, or temporarily on mouse move / tap
  const areControlsVisible = !isPlaying || showControls;

  return (
    <div
      ref={containerRef}
      className="direct-fullscreen-video-modal"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        height: '100dvh',
        zIndex: 99999,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease-out forwards',
        cursor: areControlsVisible ? 'default' : 'none',
      }}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      onClick={togglePlay}
    >
      {/* Pure Cinema Video Stage: 100% full view, zero crop across all aspect ratios */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100dvh',
          objectFit: 'contain',
          display: 'block',
          backgroundColor: '#000000',
        }}
      />

      {/* Center Play Button Overlay (ONLY shown when paused) */}
      {!isPlaying && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: '5px',
              boxShadow: '0 0 50px rgba(255, 255, 255, 0.45)',
              transition: 'transform 0.2s ease',
            }}
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
        </div>
      )}

      {/* Floating Top-Right Actions: Discreet Mute & Close Buttons (Auto-hidden while playing) */}
      <div
        style={{
          position: 'absolute',
          top: 'clamp(1rem, 3.5vh, 2.5rem)',
          right: 'clamp(1rem, 3.5vw, 2.5rem)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 20,
          opacity: areControlsVisible ? 1 : 0,
          pointerEvents: areControlsVisible ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(20, 20, 26, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.2s ease',
          }}
          className="fullscreen-action-btn"
        >
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playClick();
            onClose();
          }}
          aria-label="Close fullscreen video"
          title="Close (Esc)"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'rgba(20, 20, 26, 0.8)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)',
            transition: 'all 0.2s ease',
          }}
          className="fullscreen-action-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Floating Bottom Minimal Progress Bar (Auto-hidden while playing) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'clamp(1rem, 2.5vh, 2rem) clamp(1rem, 3.5vw, 2.5rem)',
          paddingBottom: 'max(clamp(1rem, 2.5vh, 2rem), env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, transparent 100%)',
          zIndex: 20,
          opacity: areControlsVisible ? 1 : 0,
          pointerEvents: areControlsVisible ? 'auto' : 'none',
          transition: 'opacity 0.35s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '99px',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          onClick={(e) => {
            if (videoRef.current && duration > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.max(0, Math.min(1, clickX / rect.width));
              videoRef.current.currentTime = pct * duration;
              resetControlsTimeout();
            }
          }}
        >
          <div
            style={{
              width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
              height: '100%',
              backgroundColor: 'var(--accent-orange, #ff5500)',
              boxShadow: '0 0 12px rgba(255, 85, 0, 0.8)',
              borderRadius: '99px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
