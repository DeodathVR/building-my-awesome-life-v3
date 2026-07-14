import React, { useMemo } from 'react';
import mandalaBackdrop from '@/assets/candle-mandala.png';

/**
 * Candle Flame Flicker — mindful focus exercise
 * All-SVG scene: sacred mandala backdrop + realistic dripping candle + animated flame + sparks.
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
        background: 'radial-gradient(ellipse at 50% 62%, #0F1E33 0%, #060B18 90%)',
      }}
    >
      {/* Warm ambient glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)',
          width: 640, height: 640, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,183,77,0.30) 0%, rgba(255,152,64,0.14) 30%, transparent 72%)',
          filter: 'blur(24px)', pointerEvents: 'none',
          animation: isPlaying ? 'candle-glow 4.5s ease-in-out infinite' : 'none',
        }}
      />

      {/* Mandala backdrop — warm-tinted geometric sacred pattern */}
      <img
        src={mandalaBackdrop}
        alt=""
        aria-hidden="true"
        data-testid="candle-mandala-backdrop"
        style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: 560, height: 'auto',
          opacity: 0.55, mixBlendMode: 'screen',
          filter: 'sepia(0.5) hue-rotate(-15deg) saturate(1.5) brightness(1.1) drop-shadow(0 0 40px rgba(255,183,77,0.5))',
          animation: isPlaying ? 'candle-mandala-spin 90s linear infinite' : 'none',
          pointerEvents: 'none',
        }}
      />

      {/* Candle scene (SVG) */}
      <svg
        data-testid="candle-svg"
        viewBox="0 0 260 460"
        style={{
          position: 'absolute', left: '50%', top: '54%', transform: 'translate(-50%, -50%)',
          width: 260, filter: 'drop-shadow(0 26px 32px rgba(0,0,0,0.55))', pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Candle body — soft ivory to warm shadow */}
          <linearGradient id="candle-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5A4A38" />
            <stop offset="18%" stopColor="#D8C8AE" />
            <stop offset="52%" stopColor="#FFF3D8" />
            <stop offset="80%" stopColor="#C9B592" />
            <stop offset="100%" stopColor="#5A4A38" />
          </linearGradient>
          <linearGradient id="candle-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B39770" />
            <stop offset="100%" stopColor="#FFF3D8" />
          </linearGradient>
          <radialGradient id="flame-outer" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="rgba(255,220,140,0.85)" />
            <stop offset="45%" stopColor="rgba(255,152,64,0.42)" />
            <stop offset="100%" stopColor="rgba(255,120,50,0)" />
          </radialGradient>
          <radialGradient id="flame-mid" cx="50%" cy="75%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,235,1)" />
            <stop offset="55%" stopColor="rgba(255,213,79,0.9)" />
            <stop offset="100%" stopColor="rgba(255,152,0,0)" />
          </radialGradient>
          <radialGradient id="flame-core" cx="50%" cy="65%" r="45%">
            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
            <stop offset="60%" stopColor="rgba(255,240,190,0.85)" />
            <stop offset="100%" stopColor="rgba(255,213,79,0)" />
          </radialGradient>
          <linearGradient id="wick-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B0B0B" />
            <stop offset="60%" stopColor="#3B2A18" />
            <stop offset="100%" stopColor="#8B6440" />
          </linearGradient>
        </defs>

        {/* Candle top pool (melted wax) */}
        <ellipse cx="130" cy="150" rx="55" ry="9" fill="url(#candle-top)" opacity="0.95" />

        {/* Body */}
        <path
          d="M75,155
             Q68,155 68,165
             L72,432
             Q72,448 88,449
             L172,449
             Q188,448 188,432
             L192,165
             Q192,155 185,155
             Z"
          fill="url(#candle-body)"
        />

        {/* Wax drips (left) */}
        <path d="M76,192 Q73,215 76,238 Q79,225 82,222 Q79,208 78,196 Z" fill="#F3E4C2" opacity="0.95" />
        <path d="M80,258 Q77,285 81,312 Q84,300 87,296 Q83,282 82,265 Z" fill="#F3E4C2" opacity="0.95" />
        <path d="M75,352 Q72,378 76,398 Q79,385 82,382 Q79,368 77,356 Z" fill="#F3E4C2" opacity="0.95" />

        {/* Wax drips (right) */}
        <path d="M182,180 Q186,208 182,232 Q179,220 176,218 Q179,200 180,184 Z" fill="#F3E4C2" opacity="0.95" />
        <path d="M186,275 Q190,300 186,332 Q183,318 180,315 Q184,300 185,278 Z" fill="#F3E4C2" opacity="0.95" />

        {/* Highlight down the middle */}
        <rect x="120" y="155" width="20" height="290" fill="#FFFAEC" opacity="0.55" rx="4" />

        {/* Base shadow */}
        <ellipse cx="130" cy="449" rx="65" ry="6" fill="rgba(0,0,0,0.5)" />

        {/* Wick */}
        <rect x="128" y="118" width="3" height="34" fill="url(#wick-grad)" rx="1" />

        {/* Flame group — animated */}
        <g
          style={{
            transformOrigin: '130px 118px',
            animation: isPlaying ? 'candle-flame-flicker 0.22s ease-in-out infinite alternate' : 'none',
          }}
        >
          <ellipse cx="130" cy="80" rx="42" ry="66" fill="url(#flame-outer)" />
          <path d="M130,20 C148,55 156,80 148,110 C142,124 118,124 112,110 C104,80 112,55 130,20 Z" fill="url(#flame-mid)" opacity="0.95" />
          <path d="M130,38 C140,64 145,86 138,108 C134,116 126,116 122,108 C115,86 120,64 130,38 Z" fill="url(#flame-core)" />
          <ellipse cx="130" cy="92" rx="4" ry="18" fill="rgba(255,255,255,0.95)" />
        </g>
      </svg>

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
        color: 'rgba(224,242,241,0.55)', fontSize: 12, fontWeight: 500,
        letterSpacing: 1, textAlign: 'center', maxWidth: 280, margin: 0,
        fontStyle: 'italic',
      }}>
        Gaze softly at the flame. Let thoughts drift by like sparks.
      </p>

      <style>{`
        @keyframes candle-flame-flicker {
          0%   { transform: rotate(-2deg) scaleY(0.96) scaleX(1.02); }
          50%  { transform: rotate(0.5deg) scaleY(1.03) scaleX(0.99); }
          100% { transform: rotate(1.5deg) scaleY(1) scaleX(1); }
        }
        @keyframes candle-glow {
          0%, 100% { opacity: 0.75; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.06); }
        }
        @keyframes candle-mandala-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes candle-spark {
          0%   { transform: translate(0, 0) scale(0.6); opacity: 0; }
          10%  { opacity: 1; }
          70%  { opacity: 0.85; }
          100% { transform: translate(var(--drift), -320px) scale(0.15); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .candle-scene *, .candle-scene g { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
