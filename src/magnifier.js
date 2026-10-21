export function setupMagnifier(surface, button, { left: originX = 0, top: originY = 0, width = 340, height = 440, sample = 90 } = {}) {
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
    image.setAttribute('viewBox', `${originX + x * width - sample / 2} ${originY + y * height - sample / 2} ${sample} ${sample}`);
    lens.style.left = `${x * 100}%`;
    lens.style.top = `${y * 100}%`;
  }
  button.addEventListener('click', () => { enabled = !enabled; render(); });
  surface.addEventListener('pointermove', event => {
    if (!enabled) return;
    const bounds = surface.getBoundingClientRect();
    const svg = surface.querySelector('.zoom-art > svg').getBoundingClientRect();
    // Account for SVG's centered, aspect-preserving letterboxing.
    const scale = Math.min(svg.width / width, svg.height / height);
    const left = svg.left + (svg.width - width * scale) / 2;
    const top = svg.top + (svg.height - height * scale) / 2;
    x = Math.max(0, Math.min(1, (event.clientX - left) / (width * scale)));
    y = Math.max(0, Math.min(1, (event.clientY - top) / (height * scale)));
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
