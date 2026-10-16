/** Where the bird + wordmark sit on each mockup photo, as % of the image box. */
export const LOGO_SLOTS = {
  can: { top: '33%', left: '24%', width: '52%', height: '36%' },
  bottle: { top: '42%', left: '31%', width: '38%', height: '42%' },
} as const;

export type Slot = { top: string; left: string; width: string; height: string };
