export function setupMagnifier(surface, button) {
  const lens = surface.querySelector('.inspection-lens');
  const image = lens.querySelector('svg');
  let enabled = false;
  let x = 0.5;
  let y = 0.5;
  function render() {
    lens.hidden = !enabled;
    button.setAttribute('aria-pressed', String(enabled));
    surface.classList.toggle('magnifying', enabled);
    // The lens samples the original vector artwork, not an enlarged bitmap.
    image.setAttribute('viewBox', `${x * 340 - 45} ${y * 440 - 45} 90 90`);
    lens.style.left = `${x * 100}%`;
    lens.style.top = `${y * 100}%`;
  }
  button.addEventListener('click', () => { enabled = !enabled; render(); });
  surface.addEventListener('pointermove', event => {
    if (!enabled) return;
    const bounds = surface.getBoundingClientRect();
    const svg = surface.querySelector('.zoom-art > svg').getBoundingClientRect();
    // Account for SVG's centered, aspect-preserving letterboxing.
    const scale = Math.min(svg.width / 340, svg.height / 440);
    const left = svg.left + (svg.width - 340 * scale) / 2;
    const top = svg.top + (svg.height - 440 * scale) / 2;
    x = Math.max(0, Math.min(1, (event.clientX - left) / (340 * scale)));
    y = Math.max(0, Math.min(1, (event.clientY - top) / (440 * scale)));
    render();
    lens.style.left = `${Math.max(0, Math.min(bounds.width, event.clientX - bounds.left))}px`;
    lens.style.top = `${Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))}px`;
  });
  surface.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    enabled = true;
    x = Math.max(0, Math.min(1, x + ({ ArrowLeft: -0.05, ArrowRight: 0.05 }[event.key] || 0)));
    y = Math.max(0, Math.min(1, y + ({ ArrowUp: -0.05, ArrowDown: 0.05 }[event.key] || 0)));
    render();
  });
  render();
}
