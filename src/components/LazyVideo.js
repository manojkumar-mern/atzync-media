'use client';

import { useRef, useEffect, useState } from 'react';
import Hls from 'hls.js';

export default function LazyVideo({
  src,
  poster,
  style,
  className,
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  preload = 'auto',
  isPortrait = false,
  showLoadingIndicator = true,
  ...props
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // HLS.js / Native HLS lifecycle
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      setIsLoading(false);
      setHasError(false);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    // Set loading true while waiting for actual frames, unless already pre-buffered
    if (video.readyState >= 2) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    setHasError(false);

    const isHlsSource = typeof src === 'string' && src.includes('.m3u8');
    const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // 1. Safari / iOS Native HLS
    if (isHlsSource && isSafari && video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.src !== src) {
        video.src = src;
      }
    }
    // 2. Chromium / Firefox MSE with Hls.js
    else if (isHlsSource && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 15,
        maxBufferLength: 20,
        maxMaxBufferLength: 30,
        maxBufferSize: 30 * 1000 * 1000,
        capLevelToPlayerSize: false, // Preserves 4K UHD renditions
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (video.readyState >= 2) {
          setIsLoading(false);
        }
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
    // 3. Fallback for standard MP4 files or direct sources
    else if (video.src !== src) {
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Video element media event listeners for accurate loading & buffering state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => {
      if (src && autoPlay) {
        setIsLoading(true);
      }
    };

    const onStalled = () => {
      if (src && autoPlay && video.readyState < 3) {
        setIsLoading(true);
      }
    };

    const onPlaying = () => {
      setIsLoading(false);
    };

    const onCanPlay = () => {
      if (video.readyState >= 2) {
        setIsLoading(false);
      }
    };

    const onLoadedData = () => {
      if (video.readyState >= 2) {
        setIsLoading(false);
      }
    };

    const onError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    const onEmptied = () => {
      setIsLoading(false);
    };

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onError);
    video.addEventListener('emptied', onEmptied);

    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onError);
      video.removeEventListener('emptied', onEmptied);
    };
  }, [src, autoPlay]);

  // Handle Play / Pause based on autoPlay & src presence
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (autoPlay && src) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented or interrupted, silence safely
        });
      }
    } else {
      video.pause();
    }
  }, [autoPlay, src]);

  return (
    <div
      className="lazy-video-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        poster={poster}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        preload={preload}
        className={className}
        style={{
          ...style,
          objectFit: style?.objectFit || (isPortrait ? 'contain' : 'contain'),
        }}
        {...props}
      />

      {/* Cinematic Video Loading Indicator */}
      {showLoadingIndicator && src && isLoading && !hasError && (
        <div
          className="video-loading-overlay"
          aria-live="polite"
          aria-label="Loading video"
        >
          <div className="video-loading-spinner" />
          <span className="video-loading-text">LOADING VIDEO</span>
        </div>
      )}
    </div>
  );
}
