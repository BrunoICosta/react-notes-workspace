import type { SVGProps } from 'react';

/** Stroke icons (24x24 grid) drawn inline so the app ships without an icon dependency. */
const PATHS = {
  sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z',
  plus: 'M12 5v14M5 12h14',
  chevronRight: 'm9 6 6 6-6 6',
  more: 'M5 12h.01M12 12h.01M19 12h.01',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  star: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z',
  search: 'm20 20-4.2-4.2M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M18 6 6 18M6 6l12 12',
  grip: 'M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5',
  indent: 'M3 6h18M11 12h10M11 18h10M3 10l4 3-4 3',
  outdent: 'M3 6h18M11 12h10M11 18h10M7 10l-4 3 4 3',
  pencil: 'm4 20 4.5-1L19 8.5a2.1 2.1 0 0 0-3-3L5.5 16 4 20Z',
  smile: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3.5-7a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5',
} as const;

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  filled?: boolean;
}

export function Icon({ name, size = 16, filled = false, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={name === 'more' || name === 'grip' ? 3 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
