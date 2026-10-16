import type { SVGProps } from 'react';

/** 1.25px line icons on a 32px grid, drawn in currentColor. Decorative by default. */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const DesignIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M6 26 22 10l4 4-16 16H6z" />
    <path d="m19 13 4 4" />
    <circle cx="9" cy="8" r="3" />
  </Icon>
);

export const ProductionIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M11 6h10M12 6v3a4 4 0 0 0-2 3.5V27h12V12.5A4 4 0 0 0 20 9V6" />
    <path d="M10 16h12M10 22h12" />
  </Icon>
);

export const DeliveryIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M3 9h16v13H3zM19 13h5l5 5v4h-10z" />
    <circle cx="8" cy="24" r="2.5" />
    <circle cx="24" cy="24" r="2.5" />
  </Icon>
);

export const StorageIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M4 12 16 5l12 7v15H4z" />
    <path d="M9 27v-9h14v9M9 22h14" />
  </Icon>
);

export const RecyclingIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M24.5 11A10 10 0 0 0 7 9.5" />
    <path d="M7 4.5v5h5" />
    <path d="M7.5 21A10 10 0 0 0 25 22.5" />
    <path d="M25 27.5v-5h-5" />
  </Icon>
);

export const MenuIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M5 12h22M5 20h22" />
  </Icon>
);

export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="m8 8 16 16M24 8 8 24" />
  </Icon>
);

export const DropIcon = (p: SVGProps<SVGSVGElement>) => (
  <Icon {...p}>
    <path d="M16 4c4 6 7 10 7 14a7 7 0 0 1-14 0c0-4 3-8 7-14z" />
  </Icon>
);
