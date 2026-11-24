// The Pagaia mark: an ink-outline roundel with a paddle blade, half filled rose.
// Minimal, works from 24px (header) to large. Decorative, so hidden from a11y.
export default function PaddleLogo({ size = 34, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="20" cy="20" r="18" fill="var(--card)" stroke="var(--ink)" strokeWidth="2.5" />
      <path
        d="M20 5.5c5.5 3.4 8 7.6 8 12s-2.5 8.6-8 12c-5.5-3.4-8-7.6-8-12s2.5-8.6 8-12z"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2.5"
      />
      <path d="M20 5.5c5.5 3.4 8 7.6 8 12 0 .9-.1 1.8-.3 2.7H20V5.5z" fill="var(--rose)" />
      <rect x="18.4" y="18" width="3.2" height="15" rx="1.6" fill="var(--ink)" />
    </svg>
  )
}

// The same mark as a static markup string, for the security pages that are
// generated as plain HTML. Keep it in sync with the component above.
export const paddleLogoSvg = (size = 34) =>
  `<svg class="paddle-logo" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">` +
  `<circle cx="20" cy="20" r="18" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"/>` +
  `<path d="M20 5.5c5.5 3.4 8 7.6 8 12s-2.5 8.6-8 12c-5.5-3.4-8-7.6-8-12s2.5-8.6 8-12z" fill="none" stroke="var(--ink)" stroke-width="2.5"/>` +
  `<path d="M20 5.5c5.5 3.4 8 7.6 8 12 0 .9-.1 1.8-.3 2.7H20V5.5z" fill="var(--rose)"/>` +
  `<rect x="18.4" y="18" width="3.2" height="15" rx="1.6" fill="var(--ink)"/></svg>`
