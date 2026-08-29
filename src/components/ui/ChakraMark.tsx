import React from 'react';

export interface ChakraMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showShield?: boolean;
  'aria-label'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}

const sizeMap = {
  sm: { dimension: 28, iconSize: 14 },
  md: { dimension: 36, iconSize: 18 },
  lg: { dimension: 48, iconSize: 24 },
  xl: { dimension: 64, iconSize: 32 },
};

export const ChakraMark: React.FC<ChakraMarkProps> = ({
  size = 'md',
  className = '',
  showShield = true,
  'aria-label': ariaLabel = 'Cyber Rakshak chakra emblem',
  'aria-hidden': ariaHidden,
}) => {
  const { dimension, iconSize } = sizeMap[size];
  const radius = dimension / 2;
  const innerRadius = radius - 3.5;
  const isHidden = ariaHidden === true || ariaHidden === 'true';

  return (
    <div
      role={isHidden ? undefined : 'img'}
      aria-label={isHidden ? undefined : ariaLabel}
      aria-hidden={isHidden ? 'true' : undefined}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full select-none ${className}`}
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        className="absolute inset-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer saffron ring */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius + 1.5}
          stroke="#FF8F1F"
          strokeWidth="2"
          strokeOpacity="0.4"
        />

        {/* Center Saffron Gradient Emblem Disk */}
        <defs>
          <linearGradient id={`markGrad-${dimension}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA24C" />
            <stop offset="100%" stopColor="#FF8F1F" />
          </linearGradient>
        </defs>
        <circle cx={radius} cy={radius} r={innerRadius} fill={`url(#markGrad-${dimension})`} />

        {/* 12 Stylized Spokes */}
        {Array.from({ length: 12 }).map((_, index) => {
          const angle = (index * 360) / 12;
          const rad = (angle * Math.PI) / 180;
          const x1 = radius + (innerRadius - 4) * Math.cos(rad);
          const y1 = radius + (innerRadius - 4) * Math.sin(rad);
          const x2 = radius + innerRadius * Math.cos(rad);
          const y2 = radius + innerRadius * Math.sin(rad);

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {showShield && (
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative z-10 drop-shadow-sm"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )}
    </div>
  );
};
