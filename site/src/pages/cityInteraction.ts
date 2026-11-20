export function isCityBackdrop(target: EventTarget | null) {
  return target instanceof Element
    && !target.closest('.city-nav, .rain-controls, a, button, input, select, textarea, label, summary, [role="button"], [contenteditable]');
}
