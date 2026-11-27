'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Hls from 'hls.js';
import { soundManager } from '@/lib/audioManager';
import { createHlsConfig, applyOptimalStartLevel } from '@/lib/hlsConfig';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getMuxPlaybackId = (src) => {
  if (typeof src !== 'string') return null;
  const match = src.match(/stream\.mux\.com\/([^/.?]+)/);
  return match ? match[1] : null;
};

export default function VideoModal({ isOpen, onClose, videoSrc, posterSrc, title = 'SHOWREEL 2026' }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isBarHovered, setIsBarHovered] = useState(false);
  const [hoverPct, setHoverPct] = useState(null);

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressBarRef = useRef(null);

  const activeVideo = videoSrc || '/videos/showreel.mp4';
  const muxPlaybackId = getMuxPlaybackId(activeVideo);

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
    setIsLoading(true);
    setHasError(false);
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

      const hls = new Hls(createHlsConfig({ mode: 'fullscreen', isActive: true }));

      hls.loadSource(activeVideo);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        applyOptimalStartLevel(hls);
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
              setIsLoading(false);
              setHasError(true);
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

  // Track popstate vs programmatic close for mobile back button navigation
  const isPoppingHistoryRef = useRef(false);

  // Handle body lock, Lenis scroll sync, sound boom, mobile back button & keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock scroll and Lenis smoothly
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (typeof window !== 'undefined' && window.lenis) {
      window.lenis.stop();
    }
    soundManager.playSubBoom();

    // 2. Push history state so mobile back button (or gesture) closes modal instead of leaving site
    const stateId = 'video-modal-' + Date.now();
    window.history.pushState({ videoModal: stateId }, '', window.location.href);
    isPoppingHistoryRef.current = false;

    // 3. Listen to browser popstate (mobile hardware back, gesture swipe back, or browser back)
    const handlePopState = () => {
      isPoppingHistoryRef.current = true;
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    // 4. Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skipBy(-5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        skipBy(5);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (typeof window !== 'undefined' && window.lenis) {
        window.lenis.start();
      }

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);

      // If closed programmatically (close '✕' button or Escape), pop the history state
      // so the browser history doesn't retain an extra dead step.
      if (!isPoppingHistoryRef.current) {
        if (window.history.state && window.history.state.videoModal === stateId) {
          window.history.back();
        }
      }
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

  const skipBy = (delta) => {
    const video = videoRef.current;
    if (!video) return;
    const total = video.duration || duration || 0;
    const nextTime = Math.max(0, total > 0 ? Math.min(total, video.currentTime + delta) : video.currentTime + delta);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    soundManager.playClick();
    resetControlsTimeout();
  };

  const getPctFromClientX = useCallback((clientX) => {
    const bar = progressBarRef.current;
    if (!bar) return 0;
    const rect = bar.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const seekToPct = useCallback((pct) => {
    const video = videoRef.current;
    if (!video) return;
    const total = video.duration || duration || 0;
    if (total <= 0) return;
    const nextTime = pct * total;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, [duration]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const pct = getPctFromClientX(e.clientX);
      setHoverPct(pct);
      seekToPct(pct);
      resetControlsTimeout();
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isDragging, getPctFromClientX, seekToPct, resetControlsTimeout]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleLoadedData = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      setIsLoading(false);
    }
  };

  const handleCanPlay = () => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      setIsLoading(false);
    }
  };

  const handlePlaying = () => {
    setIsPlaying(true);
    setIsLoading(false);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handleStalled = () => {
    if (videoRef.current && videoRef.current.readyState < 3) {
      setIsLoading(true);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
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
      data-lenis-prevent="true"
      data-lenis-prevent-touch="true"
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
        poster={posterSrc}
        autoPlay
        playsInline
        preload="auto"
        muted={isMuted}
        onLoadedMetadata={handleTimeUpdate}
        onDurationChange={handleTimeUpdate}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onStalled={handleStalled}
        onError={handleError}
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

      {/* Cinematic Video Loading Indicator */}
      {isOpen && isLoading && !hasError && (
        <div
          className="video-loading-overlay video-modal-loading-overlay"
          aria-live="polite"
          aria-label="Loading video"
        >
          <div className="video-loading-spinner video-modal-loading-spinner" />
          <span className="video-loading-text">LOADING VIDEO</span>
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

      {/* Floating Bottom YouTube-Style Scrubber Bar + Exact Timing Thumbnail Preview */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'clamp(1rem, 2.5vh, 2rem) clamp(1rem, 3.5vw, 2.5rem)',
          paddingBottom: 'max(clamp(1rem, 2.5vh, 2rem), env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.35) 55%, transparent 100%)',
          zIndex: 20,
          opacity: areControlsVisible || isDragging ? 1 : 0,
          pointerEvents: areControlsVisible || isDragging ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Timecode Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.88)',
            letterSpacing: '0.04em',
            fontVariantNumeric: 'tabular-nums',
            userSelect: 'none',
          }}
        >
          <span>
            {formatTime(currentTime)} <span style={{ color: 'rgba(255, 255, 255, 0.45)' }}>/ {formatTime(duration)}</span>
          </span>
        </div>

        {/* Interactive Track + Draggable Round Thumb + Thumbnail Preview Tooltip */}
        <div
          ref={progressBarRef}
          role="slider"
          aria-label="Video timeline"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          tabIndex={0}
          style={{
            width: '100%',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onPointerEnter={(e) => {
            setIsBarHovered(true);
            setHoverPct(getPctFromClientX(e.clientX));
          }}
          onPointerMove={(e) => {
            setIsBarHovered(true);
            if (!isDragging) {
              setHoverPct(getPctFromClientX(e.clientX));
            }
          }}
          onPointerLeave={() => {
            setIsBarHovered(false);
            if (!isDragging) setHoverPct(null);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            const pct = getPctFromClientX(e.clientX);
            setIsDragging(true);
            setHoverPct(pct);
            seekToPct(pct);
            resetControlsTimeout();
          }}
        >
          {/* Floating Exact-Time Thumbnail & Timestamp Preview */}
          {(isBarHovered || isDragging) && hoverPct !== null && duration > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '32px',
                left: `clamp(72px, ${hoverPct * 100}%, calc(100% - 72px))`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
                pointerEvents: 'none',
                zIndex: 30,
              }}
            >
              {muxPlaybackId && (
                <div
                  style={{
                    width: '144px',
                    height: '81px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#0c0d12',
                    border: '1.5px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 8px 28px rgba(0, 0, 0, 0.85)',
                  }}
                >
                  <img
                    src={`https://image.mux.com/${muxPlaybackId}/thumbnail.webp?time=${(Math.round(hoverPct * duration * 2) / 2).toFixed(1)}&width=320`}
                    alt={`Preview at ${formatTime(hoverPct * duration)}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
              )}
              <span
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(12, 13, 18, 0.92)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
                }}
              >
                {formatTime(hoverPct * duration)}
              </span>
            </div>
          )}

          {/* Track Background */}
          <div
            style={{
              width: '100%',
              height: isBarHovered || isDragging ? '6px' : '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.24)',
              borderRadius: '99px',
              position: 'relative',
              transition: 'height 0.15s ease',
            }}
          >
            {/* Hover Ghost Fill */}
            {isBarHovered && hoverPct !== null && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${hoverPct * 100}%`,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '99px',
                }}
              />
            )}

            {/* Played Progress Fill */}
            <div
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                height: '100%',
                backgroundColor: 'var(--accent-orange, #ff5500)',
                boxShadow: '0 0 12px rgba(255, 85, 0, 0.8)',
                borderRadius: '99px',
                position: 'relative',
              }}
            />

            {/* Draggable YouTube-Style Round Scrubber Knob */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                width: isBarHovered || isDragging ? '16px' : '13px',
                height: isBarHovered || isDragging ? '16px' : '13px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-orange, #ff5500)',
                border: '2px solid #ffffff',
                boxShadow: '0 0 14px rgba(255, 85, 0, 0.9)',
                transform: 'translate(-50%, -50%)',
                transition: isDragging ? 'none' : 'width 0.15s ease, height 0.15s ease',
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
