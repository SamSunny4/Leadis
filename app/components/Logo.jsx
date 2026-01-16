'use client';

import React from 'react';

export default function Logo({ size = 32, alt = 'Leadis', className = '', style = {} }) {
  return (
    <img
      src="/logo.svg"
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', width: size, height: size, ...style }}
    />
  );
}
