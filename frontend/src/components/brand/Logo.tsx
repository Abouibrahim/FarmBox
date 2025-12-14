'use client';

import Link from 'next/link';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const sizes = {
  sm: { text: 'text-xl', tagline: 'text-xs' },
  md: { text: 'text-2xl', tagline: 'text-sm' },
  lg: { text: 'text-4xl', tagline: 'text-base' },
};

export function Logo({ variant = 'default', size = 'md', showTagline = false }: LogoProps) {
  const textColor = variant === 'white' ? 'text-white' : 'text-brand-green';
  const taglineColor = variant === 'white' ? 'text-white/80' : 'text-brand-brown';
  const sizeConfig = sizes[size];

  return (
    <Link href="/" className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        {/* Stylized olive leaf icon */}
        <svg
          className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} ${textColor}`}
          viewBox="0 0 40 40"
          fill="currentColor"
        >
          <path d="M20 4C12 4 6 10 6 18c0 6 4 11 9 14 1 0.5 2 1 3 1.5V36c0 1 1 2 2 2s2-1 2-2v-2.5c1-0.5 2-1 3-1.5 5-3 9-8 9-14 0-8-6-14-14-14zm0 4c2 0 4 1 5 3-2 1-4 2-5 4-1-2-3-3-5-4 1-2 3-3 5-3zm-8 6c2 1 4 3 5 5-1 2-2 4-2 6 0 1 0 2 0.5 3-3-2-5.5-5-5.5-9 0-2 1-4 2-5zm16 0c1 1 2 3 2 5 0 4-2.5 7-5.5 9 0.5-1 0.5-2 0.5-3 0-2-1-4-2-6 1-2 3-4 5-5z"/>
        </svg>
        <span className={`font-display font-bold ${sizeConfig.text} ${textColor}`}>
          Borgdanet
        </span>
      </div>
      {showTagline && (
        <span className={`${sizeConfig.tagline} ${taglineColor} mt-1`}>
          Local food. Trusted farms. Shared abundance.
        </span>
      )}
    </Link>
  );
}

export default Logo;
