import type { IconType } from 'react-icons';
import { SiJavascript, SiNuxt, SiPython, SiPytorch, SiReact, SiVuedotjs } from 'react-icons/si';
import type { profile } from '../data/profile';

type Technology = (typeof profile.tech)[number];

export const technologyIcons: Record<Exclude<Technology, 'Playwright'>, IconType> = {
  JavaScript: SiJavascript,
  Python: SiPython,
  React: SiReact,
  Nuxt: SiNuxt,
  Vue: SiVuedotjs,
  PyTorch: SiPytorch,
};
