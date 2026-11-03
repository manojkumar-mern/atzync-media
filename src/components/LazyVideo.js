'use client';

import { useRef, useEffect } from 'react';
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
  ...props
}) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  // HLS.js / Native HLS lifecycle
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

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
  );
}
