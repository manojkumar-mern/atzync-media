'use client';

import { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js';
import { soundManager } from '@/lib/audioManager';

export default function VideoModal({ isOpen, onClose, videoSrc, posterSrc, title = 'SHOWREEL 2026' }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContentRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const activeVideo = videoSrc || '/videos/showreel.mp4';
  const activePoster = posterSrc || '/images/hero-poster.webp';

  useEffect(() => {
    if (!isOpen) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video || !activeVideo) return;

    const isHls = typeof activeVideo === 'string' && activeVideo.includes('.m3u8');
    const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // Safari Native HLS
    if (isHls && isSafari && video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== activeVideo) {
        video.src = activeVideo;
      }
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
        capLevelToPlayerSize: false, // Ensures full 4K UHD presentation
      });

      hls.loadSource(activeVideo);
      hls.attachMedia(video);

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
    else if (video.src !== activeVideo) {
      video.src = activeVideo;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isOpen, activeVideo]);



  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      soundManager.playSubBoom();
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      soundManager.playClick();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      soundManager.playClick();
    }
  };

  const toggleFullscreen = () => {
    soundManager.playClick();
    const container = modalContentRef.current;

    if (!document.fullscreenElement && !document.webkitFullscreenElement && !isFullscreen) {
      if (container?.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else if (container?.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (videoRef.current?.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => setIsFullscreen(false));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else {
        setIsFullscreen(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const frames = Math.floor((timeInSeconds % 1) * 24);
    return `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="video-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.94)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? '0' : 'var(--space-md)',
        animation: 'fadeIn 0.3s ease-out forwards',
      }}
      onClick={onClose}
    >
      <div
        ref={modalContentRef}
        className={`video-modal-content film-crop-marks silver-sheen ${isFullscreen ? 'video-modal-fullscreen' : ''}`}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isFullscreen ? '100vw' : '1100px',
          backgroundColor: '#0a0a0c',
          border: isFullscreen ? 'none' : '1px solid var(--border-strong)',
          borderRadius: isFullscreen ? '0' : '16px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.95)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: isFullscreen ? '100vh' : 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className="flex-row items-center justify-between"
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(15, 15, 18, 0.9)',
          }}
        >
          <div className="flex-row items-center" style={{ gap: '0.75rem' }}>
            <span className="status-dot"></span>
            <span className="badge-tag video-modal-header-badge">CINEMATIC REAL PLAYER</span>
            <span className="meta-tag video-modal-title" style={{ color: 'var(--text-primary)' }}>{title}</span>
          </div>

          <button
            onClick={() => { soundManager.playClick(); onClose(); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem 0.5rem',
            }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div
          className="video-stage-container"
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: isFullscreen ? 'auto' : '16/9',
            maxHeight: isFullscreen ? 'none' : '65vh',
            flex: isFullscreen ? 1 : 'none',
            backgroundColor: '#05060a',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Ambient Blurred Pillarbox/Letterbox Backdrop */}
          {activePoster && (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 0,
              }}
            >
              <img
                src={activePoster}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(45px) brightness(0.25)',
                  transform: 'scale(1.2)',
                  opacity: 0.75,
                }}
              />
            </div>
          )}

          <video
            ref={videoRef}
            poster={activePoster}
            autoPlay
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: 'pointer',
            }}
          />

          {/* Vignette Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />

          {/* Center Play/Pause Overlay */}
          {!isPlaying && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 3,
              }}
              onClick={togglePlay}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: '6px',
                  boxShadow: '0 0 40px rgba(255,255,255,0.4)',
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div
          className="video-modal-control-bar flex-col"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'rgba(12, 12, 15, 0.95)',
            borderTop: '1px solid var(--border-subtle)',
            gap: '0.75rem',
          }}
        >
          {/* Progress Timeline */}
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              position: 'relative',
              cursor: 'pointer',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
            onClick={(e) => {
              if (videoRef.current && duration > 0) {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const pct = clickX / rect.width;
                videoRef.current.currentTime = pct * duration;
              }
            }}
          >
            <div
              style={{
                width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                height: '100%',
                backgroundColor: 'var(--text-primary)',
                boxShadow: '0 0 10px rgba(255,255,255,0.8)',
              }}
            />
          </div>

          <div className="video-modal-controls flex-row items-center justify-between">
            <div className="flex-row items-center video-modal-buttons-group" style={{ gap: '0.65rem' }}>
              <button
                onClick={togglePlay}
                className="btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '20px', whiteSpace: 'nowrap' }}
              >
                {isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                onClick={toggleMute}
                className="btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '20px', whiteSpace: 'nowrap' }}
              >
                {isMuted ? 'UNMUTE' : 'MUTE 🔊'}
              </button>
            </div>

            <div className="video-modal-timecode-container">
              <span className="timecode-tag video-modal-timecode" style={{ whiteSpace: 'nowrap' }}>
                {formatTime(currentTime)} // {formatTime(duration)}
              </span>
            </div>

            <div className="flex-row items-center video-modal-right-controls" style={{ gap: '0.75rem' }}>
              <span className="meta-tag video-modal-meta" style={{ whiteSpace: 'nowrap' }}>4K DCI // 24FPS</span>
              <span className="badge-tag video-modal-editorial-tag" style={{ borderRadius: '20px', whiteSpace: 'nowrap' }}>REAL EDITORIAL CUT</span>
              <button
                onClick={toggleFullscreen}
                className="video-control-fullscreen-btn"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                aria-label="Toggle Fullscreen"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '20px',
                  padding: '0.38rem 0.65rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                {isFullscreen ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

