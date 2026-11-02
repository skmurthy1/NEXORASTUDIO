/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface NexoraLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

/**
 * Nexora Books Brand Logo
 * Official insignia: Rounded quadrilateral with Red, Navy, Yellow, and Green quadrants,
 * enclosing a white chamber with a bold navy 'N' topped by an upward-pointing red growth arrow.
 */
export const NexoraLogo: React.FC<NexoraLogoProps> = ({ size = 36, className = '', showText = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
        aria-label="Nexora Logo"
      >
        {/* Clip path for outer squircle */}
        <defs>
          <clipPath id="squircleClip">
            <rect width="180" height="180" rx="42" />
          </clipPath>
        </defs>

        {/* 4 Colored Outer Quadrants */}
        <g clipPath="url(#squircleClip)">
          {/* Top-Left: Vibrant Red */}
          <rect x="0" y="0" width="90" height="90" fill="#DC2626" />
          {/* Top-Right: Deep Navy Indigo */}
          <rect x="90" y="0" width="90" height="90" fill="#2B3A87" />
          {/* Bottom-Right: Rich Golden Amber */}
          <rect x="90" y="90" width="90" height="90" fill="#FBBF24" />
          {/* Bottom-Left: Vibrant Emerald Green */}
          <rect x="0" y="90" width="90" height="90" fill="#059669" />
        </g>

        {/* Inner White Squircle */}
        <rect x="18" y="18" width="144" height="144" rx="36" fill="#FFFFFF" />

        {/* Bold Central "N" in Deep Navy (#2B3A87) */}
        {/* Left vertical pillar */}
        <rect x="61" y="62" width="19" height="57" rx="3" fill="#2B3A87" />
        
        {/* Diagonal stroke of N */}
        <path
          d="M62 64 L100 118 L117 118 L79 64 Z"
          fill="#2B3A87"
        />

        {/* Right vertical pillar */}
        <rect x="98" y="62" width="19" height="57" rx="3" fill="#2B3A87" />

        {/* Red Growth Arrow Triangle on top-right of N */}
        <path
          d="M89 57 L127 40 L127 82 Z"
          fill="#DC2626"
        />
      </svg>

      {showText && (
        <span className="font-extrabold tracking-tight text-white whitespace-nowrap text-lg">
          Nexora Books
        </span>
      )}
    </div>
  );
};
