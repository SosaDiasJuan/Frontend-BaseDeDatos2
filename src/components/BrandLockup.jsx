import React from 'react';

export default function BrandLockup({ eyebrow = 'Copa Mundial de la FIFA 2026', compact = false }) {
  return (
    <div className={`brand-lockup ${compact ? 'brand-lockup-compact' : ''}`}>
      <img src="/assets/world-cup-2026-logo.png" alt="Copa Mundial de la FIFA 2026" />
      <div>
        <span>FIFA</span>
        <p>{eyebrow}</p>
      </div>
    </div>
  );
}
