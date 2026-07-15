import React, { useMemo } from 'react';
import mandalaBackdrop from '@/assets/candle-mandala.png';
import candleFlameLayer from '@/assets/candle-flame-layer.png';
import candleBodyLayer from '@/assets/candle-body-layer.png';

/**
 * Candle Flame Flicker — mindful focus exercise.
 * The mandala PNG is used as the FULL PAGE background (cover); the candle SVG
 * with animated flame + sparks is layered on top, positioned in the center.
 */
export const CandleFlame = ({ isPlaying }) => {
  const sparks = useMemo(
    () => Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      leftPct: 45 + Math.random() * 10,
      delay: (Math.random() * 3).toFixed(2),
      duration: (3.2 + Math.random() * 2.8).toFixed(2),
      size: (2 + Math.random() * 3).toFixed(1),
      drift: (Math.random() * 24 - 12).toFixed(1),
    })),
    []
  );

  return (
    <div
      className="candle-scene"
      data-testid="candle-scene"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        // Full-page mandala background — the PNG fills the entire viewport.
        backgroundColor: '#0B1830',
        backgroundImage: `url(${mandalaBackdrop})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Slow rotation of the mandala background */}
      <div
        aria-hidden="true"
        data-testid="candle-mandala-backdrop"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${mandalaBackdrop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          animation: isPlaying ? 'candle-mandala-spin 90s linear infinite' : 'none',
          transformOrigin: 'center center',
          pointerEvents: 'none',
        }}
      />

      {/* Subtle vignette — dark at top (for title) and bottom (for controls card) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background:
            'linear-gradient(180deg, rgba(11,24,48,0.55) 0%, rgba(11,24,48,0) 18%, rgba(11,24,48,0) 62%, rgba(11,24,48,0.55) 100%)',
        }}
      />

      {/* Corner vignette — softens the edges into the navy */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(11,24,48,0.45) 100%)',
        }}
      />

      {/* Warm ambient glow around the flame */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)',
          width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,183,77,0.32) 0%, rgba(255,152,64,0.14) 30%, transparent 72%)',
          filter: 'blur(24px)', pointerEvents: 'none',
          animation: isPlaying ? 'candle-glow 4.5s ease-in-out infinite' : 'none',
        }}
      />

      {/* Candle — split into two photorealistic layers so ONLY the flame flickers.
          Both layers are cropped from the same Gemini-Nano-Banana image, aligned
          via a 50px overlap zone so they seamlessly reconstruct the whole candle.
          Container preserves the original 491:1171 aspect ratio. */}
      <div
        data-testid="candle-photo"
        style={{
          position: 'absolute',
          left: '50%',
          top: '54%',
          transform: 'translate(-50%, -50%)',
          height: '78%',
          maxHeight: 720,
          aspectRatio: '491 / 1171',
          pointerEvents: 'none',
          filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.65))',
          mixBlendMode: 'screen',
        }}
      >
        {/* Static candle body (wax + drips) */}
        <img
          src={candleBodyLayer}
          alt=""
          aria-hidden="true"
          data-testid="candle-body-layer"
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            top: '38%',
            height: '62%',
          }}
        />
        {/* Animated flame layer (flame + wick tip + halo + tiny sparks) */}
        <img
          src={candleFlameLayer}
          alt=""
          aria-hidden="true"
          data-testid="candle-flame-layer"
          style={{
            position: 'absolute',
            left: 0,
            width: '100%',
            top: 0,
            height: '42.27%',
            transformOrigin: '50% 92%', // pivot near the wick base
            animation: isPlaying
              ? 'candle-flame-flicker 2.4s ease-in-out infinite'
              : 'none',
            willChange: 'transform, filter',
          }}
        />
      </div>

      {/* Sparks */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {sparks.map(s => (
          <span
            key={s.id}
            data-testid="candle-spark"
            style={{
              position: 'absolute',
              left: `${s.leftPct}%`, top: '30%',
              width: `${s.size}px`, height: `${s.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,236,179,1), rgba(255,183,77,0))',
              boxShadow: '0 0 8px rgba(255,213,79,0.95)',
              opacity: 0,
              animation: isPlaying ? `candle-spark ${s.duration}s ease-out ${s.delay}s infinite` : 'none',
              '--drift': `${s.drift}px`,
            }}
          />
        ))}
      </div>

      {/* Soft instruction (bottom, non-overlapping with header) */}
      <p style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        color: 'rgba(224,242,241,0.7)', fontSize: 12, fontWeight: 500,
        letterSpacing: 1, textAlign: 'center', maxWidth: 280, margin: 0,
        fontStyle: 'italic',
      }}>
        Gaze softly at the flame. Let thoughts drift by like sparks.
      </p>

      <style>{`
        @keyframes candle-flame-flicker {
          /* Very subtle flicker — barely perceptible sway, gentle brightness pulse. */
          0%   { transform: rotate(-1deg)    translateX(-0.5px) scaleY(0.985) scaleX(1.01); filter: brightness(0.97); }
          15%  { transform: rotate(0.7deg)   translateX(0.3px)  scaleY(1.015) scaleX(0.99); filter: brightness(1.03); }
          30%  { transform: rotate(-0.5deg)  translateX(-0.2px) scaleY(1.00)  scaleX(1.00); filter: brightness(1.00); }
          45%  { transform: rotate(1.2deg)   translateX(0.5px)  scaleY(1.02)  scaleX(0.99); filter: brightness(1.05); }
          60%  { transform: rotate(-0.3deg)  translateX(0)      scaleY(0.99)  scaleX(1.005);filter: brightness(0.98); }
          75%  { transform: rotate(0.9deg)   translateX(0.3px)  scaleY(1.01)  scaleX(0.995);filter: brightness(1.02); }
          90%  { transform: rotate(-0.7deg)  translateX(-0.3px) scaleY(1.00)  scaleX(1.00); filter: brightness(1.00); }
          100% { transform: rotate(0.5deg)   translateX(0.2px)  scaleY(1.005) scaleX(0.995);filter: brightness(1.02); }
        }
        @keyframes candle-glow {
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.06); }
        }
        @keyframes candle-mandala-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes candle-spark {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          10%  { opacity: 1; }
          70%  { opacity: 0.85; }
          100% { transform: translate(var(--drift), -320px) scale(0.15); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          /* Keep the flame flicker — it's essential to the meditation exercise.
             Only disable the decorative mandala spin, spark drift, and glow pulse. */
          [data-testid="candle-mandala-backdrop"],
          [data-testid="candle-spark"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
