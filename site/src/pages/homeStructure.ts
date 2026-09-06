export const HOME_SECTIONS = [
  'island',
  'credentials',
  'intro',
  'technical-focus',
  'featured',
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];
