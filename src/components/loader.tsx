import { useMemo } from "react";
interface LoaderProps {
  type: "wave" | "bars" | "line" | "pulse" | "grid" | "random";
  size?: number;
  className?: string;
}

/**
 * Renders a loader animation.
 *
 * @param type - The type of loader. Valid values are: "wave", "bars", "line", "pulse", "grid", or "random". If "random", a random loader is displayed.
 * @param size - The size of the loader. Defaults to 64.
 * @param className - Additional class names to apply to the loader. Defaults to an empty string.
 * @returns A loader component.
 */
export function Loader({ type, size = 64, className = "" }: LoaderProps) {
  const availableTypes = ["wave", "bars", "line", "pulse", "grid"] as const;

  const resolvedType = useMemo(() => {
    if (type === "random") {
      const index = Math.floor(Math.random() * availableTypes.length);
      return availableTypes[index];
    }
    return type;
  }, [type]);

  const loaders = {
    wave: <WaveLoader size={size} />,
    bars: <BarsLoader size={size} />,
    line: <LineLoader size={size} />,
    pulse: <PulseLoader size={size} />,
    grid: <GridLoader size={size} />,
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {loaders[resolvedType]}
    </div>
  );
}

// Wave/Signal Loader - Evokes data streaming
function WaveLoader({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="wave-loader">
      <style>{`
        .wave-loader .wave-line {
          stroke: #06b6d4;
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: wave-draw 2s ease-in-out infinite;
        }
        .wave-loader .wave-line:nth-child(2) {
          stroke: #8b5cf6;
          animation-delay: 0.2s;
        }
        .wave-loader .wave-line:nth-child(3) {
          stroke: #06b6d4;
          opacity: 0.6;
          animation-delay: 0.4s;
        }
        @keyframes wave-draw {
          0%, 100% { stroke-dashoffset: 100; opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
      <path className="wave-line" d="M8 32 Q16 16, 24 32 T40 32 T56 32" />
      <path className="wave-line" d="M8 40 Q16 24, 24 40 T40 40 T56 40" />
      <path className="wave-line" d="M8 24 Q16 8, 24 24 T40 24 T56 24" />
    </svg>
  );
}

// Animated Bar Chart Loader
function BarsLoader({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="bars-loader">
      <style>{`
        .bars-loader .bar {
          fill: #06b6d4;
          transform-origin: bottom;
          animation: bar-grow 1.5s ease-in-out infinite;
        }
        .bars-loader .bar:nth-child(1) { animation-delay: 0s; }
        .bars-loader .bar:nth-child(2) { animation-delay: 0.1s; fill: #8b5cf6; }
        .bars-loader .bar:nth-child(3) { animation-delay: 0.2s; fill: #06b6d4; }
        .bars-loader .bar:nth-child(4) { animation-delay: 0.3s; fill: #14b8a6; }
        .bars-loader .bar:nth-child(5) { animation-delay: 0.4s; fill: #8b5cf6; }
        .bars-loader .bar:nth-child(6) { animation-delay: 0.5s; fill: #06b6d4; }
        @keyframes bar-grow {
          0%, 100% { transform: scaleY(0.2); opacity: 0.4; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
      <rect className="bar" x="6" y="20" width="6" height="36" rx="3" />
      <rect className="bar" x="16" y="12" width="6" height="44" rx="3" />
      <rect className="bar" x="26" y="28" width="6" height="28" rx="3" />
      <rect className="bar" x="36" y="8" width="6" height="48" rx="3" />
      <rect className="bar" x="46" y="24" width="6" height="32" rx="3" />
      <rect className="bar" x="56" y="16" width="6" height="40" rx="3" />
    </svg>
  );
}

// Line Graph Drawing Loader
function LineLoader({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="line-loader">
      <style>{`
        .line-loader .grid-line {
          stroke: #374151;
          stroke-width: 0.5;
          opacity: 0.3;
        }
        .line-loader .data-line {
          stroke: #06b6d4;
          stroke-width: 2.5;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: line-draw 2.5s ease-out infinite;
        }
        .line-loader .data-point {
          fill: #06b6d4;
          r: 0;
          animation: point-appear 2.5s ease-out infinite;
        }
        .line-loader .data-point:nth-child(n+6) { animation-delay: 0.3s; }
        .line-loader .data-point:nth-child(n+7) { animation-delay: 0.6s; }
        .line-loader .data-point:nth-child(n+8) { animation-delay: 0.9s; }
        .line-loader .data-point:nth-child(n+9) { animation-delay: 1.2s; }
        @keyframes line-draw {
          0% { stroke-dashoffset: 200; }
          70% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes point-appear {
          0%, 60% { r: 0; opacity: 0; }
          70% { r: 3; opacity: 1; }
          100% { r: 3; opacity: 1; }
        }
      `}</style>
      {/* Grid lines */}
      <line className="grid-line" x1="8" y1="16" x2="8" y2="48" />
      <line className="grid-line" x1="8" y1="48" x2="56" y2="48" />
      <line className="grid-line" x1="8" y1="32" x2="56" y2="32" />

      {/* Data line */}
      <path className="data-line" d="M8 40 L20 28 L32 36 L44 20 L56 32" />

      {/* Data points */}
      <circle className="data-point" cx="8" cy="40" />
      <circle className="data-point" cx="20" cy="28" />
      <circle className="data-point" cx="32" cy="36" />
      <circle className="data-point" cx="44" cy="20" />
      <circle className="data-point" cx="56" cy="32" />
    </svg>
  );
}

// Pulse/Radar Loader
function PulseLoader({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="pulse-loader"
    >
      <style>{`
        .pulse-loader .pulse-ring {
          fill: none;
          stroke: #06b6d4;
          stroke-width: 1;
          opacity: 0;
          animation: pulse-expand 2s ease-out infinite;
        }
        .pulse-loader .pulse-ring:nth-child(2) {
          stroke: #8b5cf6;
          animation-delay: 0.4s;
        }
        .pulse-loader .pulse-ring:nth-child(3) {
          stroke: #14b8a6;
          animation-delay: 0.8s;
        }
        .pulse-loader .center-dot {
          fill: #f8fafc;
          animation: center-pulse 2s ease-in-out infinite;
        }
        @keyframes pulse-expand {
          0% { r: 4; opacity: 1; }
          100% { r: 28; opacity: 0; }
        }
        @keyframes center-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
      <circle className="pulse-ring" cx="32" cy="32" r="4" />
      <circle className="pulse-ring" cx="32" cy="32" r="4" />
      <circle className="pulse-ring" cx="32" cy="32" r="4" />
      <circle className="center-dot" cx="32" cy="32" r="3" />
    </svg>
  );
}

// Grid/Matrix Loader
function GridLoader({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="grid-loader">
      <style>{`
        .grid-loader .grid-dot {
          fill: #06b6d4;
          opacity: 0.2;
          animation: grid-flash 2s ease-in-out infinite;
        }
        .grid-loader .grid-dot:nth-child(1) { animation-delay: 0s; }
        .grid-loader .grid-dot:nth-child(2) { animation-delay: 0.1s; fill: #8b5cf6; }
        .grid-loader .grid-dot:nth-child(3) { animation-delay: 0.2s; fill: #14b8a6; }
        .grid-loader .grid-dot:nth-child(4) { animation-delay: 0.3s; }
        .grid-loader .grid-dot:nth-child(5) { animation-delay: 0.4s; fill: #8b5cf6; }
        .grid-loader .grid-dot:nth-child(6) { animation-delay: 0.5s; }
        .grid-loader .grid-dot:nth-child(7) { animation-delay: 0.6s; fill: #14b8a6; }
        .grid-loader .grid-dot:nth-child(8) { animation-delay: 0.7s; }
        .grid-loader .grid-dot:nth-child(9) { animation-delay: 0.8s; fill: #8b5cf6; }
        .grid-loader .grid-dot:nth-child(10) { animation-delay: 0.9s; }
        .grid-loader .grid-dot:nth-child(11) { animation-delay: 1s; fill: #14b8a6; }
        .grid-loader .grid-dot:nth-child(12) { animation-delay: 1.1s; }
        .grid-loader .grid-dot:nth-child(13) { animation-delay: 1.2s; fill: #8b5cf6; }
        .grid-loader .grid-dot:nth-child(14) { animation-delay: 1.3s; }
        .grid-loader .grid-dot:nth-child(15) { animation-delay: 1.4s; fill: #14b8a6; }
        .grid-loader .grid-dot:nth-child(16) { animation-delay: 1.5s; }
        @keyframes grid-flash {
          0%, 90% { opacity: 0.2; transform: scale(1); }
          45% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
      {/* 4x4 grid of dots */}
      <circle className="grid-dot" cx="16" cy="16" r="2" />
      <circle className="grid-dot" cx="32" cy="16" r="2" />
      <circle className="grid-dot" cx="48" cy="16" r="2" />
      <circle className="grid-dot" cx="16" cy="28" r="2" />
      <circle className="grid-dot" cx="32" cy="28" r="2" />
      <circle className="grid-dot" cx="48" cy="28" r="2" />
      <circle className="grid-dot" cx="16" cy="40" r="2" />
      <circle className="grid-dot" cx="32" cy="40" r="2" />
      <circle className="grid-dot" cx="48" cy="40" r="2" />
      <circle className="grid-dot" cx="16" cy="52" r="2" />
      <circle className="grid-dot" cx="32" cy="52" r="2" />
      <circle className="grid-dot" cx="48" cy="52" r="2" />
    </svg>
  );
}
