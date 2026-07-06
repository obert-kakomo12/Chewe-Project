import React from 'react';
import logoNoBg from './assets/logo_no_bg.png';
import logoWhite from './assets/logo_white.png';

/**
 * CTLogo — Chewe Technology's brand mark
 * variant="light"  → original logo on white/light background
 * variant="dark"   → white logo on navy sidebar/topbar
 * size="sm" | "md" | "lg"
 */
const CTLogo = ({ variant = 'dark', size = 'md' }) => {
  const height = size === 'sm' ? 34 : size === 'lg' ? 70 : 52;
  const logoSrc = variant === 'dark' ? logoWhite : logoNoBg;

  return (
    <img 
      src={logoSrc} 
      alt="Chewe Technology Logo" 
      style={{
        height: `${height}px`,
        width: 'auto',
        display: 'block',
        objectFit: 'contain'
      }}
    />
  );
};

export default CTLogo;

