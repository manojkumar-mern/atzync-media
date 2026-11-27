/**
 * Network-aware HLS streaming configuration shared across LazyVideo and VideoModal.
 * Prevents slow 3-5s cold starts and blurry 144p/270p initial segments across Wi-Fi, 4G, and 3G.
 */

export function isConstrainedConnection() {
  if (typeof navigator === 'undefined') return false;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return false;
  if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.effectiveType === '3g') {
    return true;
  }
  return typeof conn.downlink === 'number' && conn.downlink > 0 && conn.downlink < 2.5;
}

export function createHlsConfig({ mode = 'preview', isActive = true } = {}) {
  const conn =
    typeof navigator !== 'undefined'
      ? navigator.connection || navigator.mozConnection || navigator.webkitConnection
      : null;

  const constrained = isConstrainedConnection();
  let initialBandwidth = 4_000_000; // 4 Mbps default -> crisp 720p/1080p startup

  if (conn) {
    if (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g') {
      initialBandwidth = 900_000;
    } else if (constrained) {
      initialBandwidth = 1_600_000;
    } else if (typeof conn.downlink === 'number' && conn.downlink >= 5) {
      initialBandwidth = Math.min(Math.round(conn.downlink * 1_000_000 * 0.85), 12_000_000);
    }
  }

  const isPreview = mode === 'preview';

  return {
    enableWorker: true,
    lowLatencyMode: false,
    startFragPrefetch: true,
    capLevelToPlayerSize: isPreview,
    capLevelOnFPSDrop: true,
    abrEwmaDefaultEstimate: initialBandwidth,
    abrEwmaFastLive: 3.0,
    abrEwmaSlowLive: 9.0,
    abrBandWidthFactor: 0.9,
    abrBandWidthUpFactor: 0.85,
    abrMaxWithRealBitrate: true,
    maxBufferHole: 0.5,
    backBufferLength: isPreview ? 10 : 30,
    maxBufferLength: !isActive ? 4 : isPreview ? (constrained ? 8 : 12) : constrained ? 12 : 20,
    maxMaxBufferLength: !isActive ? 6 : isPreview ? 20 : 40,
    maxBufferSize: isPreview ? 25 * 1000 * 1000 : 60 * 1000 * 1000,
    fragLoadingMaxRetry: 4,
    manifestLoadingMaxRetry: 4,
    levelLoadingMaxRetry: 4,
  };
}

/**
 * Selects a crisp initial HLS rendition (>= 720p on normal broadband/4G, >= 480p on constrained mobile)
 * instead of hls.js's default lowest-resolution first fragment.
 */
export function applyOptimalStartLevel(hls) {
  if (!hls || !Array.isArray(hls.levels) || hls.levels.length === 0) return;

  const constrained = isConstrainedConnection();
  const targetMinHeight = constrained ? 480 : 720;
  const targetMaxHeight = constrained ? 720 : 1080;

  let bestIdx = -1;
  for (let i = 0; i < hls.levels.length; i++) {
    const lvl = hls.levels[i];
    const minDim = Math.min(lvl.width || 0, lvl.height || 0);
    if (minDim >= targetMinHeight && minDim <= targetMaxHeight) {
      bestIdx = i;
    }
  }

  // Fallback to highest level below targetMaxHeight if exact range isn't present
  if (bestIdx === -1) {
    bestIdx = hls.levels.findIndex((lvl) => Math.min(lvl.width || 0, lvl.height || 0) >= targetMinHeight);
  }

  if (bestIdx !== -1) {
    hls.startLevel = bestIdx;
    hls.nextLevel = bestIdx;
  }
}
