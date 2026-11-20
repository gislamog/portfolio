import type { IconType } from 'react-icons';
import { SiJavascript, SiNuxt, SiPython, SiPytorch, SiReact, SiVuedotjs } from 'react-icons/si';
import godotLogo from '../assets/brands/godot.png';
import playwrightLogo from '../assets/brands/playwright.png';
import type { profile } from '../data/profile';

type Technology = (typeof profile.tech)[number];

export const technologyIcons = {
  JavaScript: SiJavascript,
  Python: SiPython,
  React: SiReact,
  Nuxt: SiNuxt,
  Vue: SiVuedotjs,
  Playwright: playwrightLogo,
  PyTorch: SiPytorch,
  Godot: godotLogo,
} satisfies Record<Technology, IconType | string>;

export function TechnologyIcon({ technology, className }: { technology: Technology; className: string }) {
  const Icon = technologyIcons[technology];
  return typeof Icon === 'string'
    ? <img src={Icon} className={className} alt="" />
    : <Icon className={className} aria-hidden="true" focusable="false" />;
}
