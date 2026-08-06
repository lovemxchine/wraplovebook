// Cover page (/test2). Only job: make the tap feel good, then hand off to the
// real flow. Kept deliberately tiny — no state, no storage.
const cover = document.getElementById('cover');

// hearts flying out of wherever the tap landed
function heartBurst(x, y) {
  for (let i = 0; i < 12; i++) {
    const h = document.createElement('span');
    h.className = 'burst';
    h.style.left = `${x}px`;
    h.style.top = `${y}px`;
    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
    const dist = 70 + Math.random() * 90;
    // append BEFORE animating — a detached element's animation never runs, so
    // onfinish would never fire and the hearts would pile up in the DOM
    document.body.appendChild(h);
    h.animate([
      { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 1 },
      {
        transform: `translate(${Math.cos(angle) * dist - 50}%, ${Math.sin(angle) * dist - 50}%) scale(${0.7 + Math.random() * 0.6}) rotate(${Math.random() * 180 - 90}deg)`,
        opacity: 0,
      },
    ], { duration: 700 + Math.random() * 350, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' })
      .onfinish = () => h.remove();
  }
}

cover.addEventListener('click', (e) => {
  if (cover.classList.contains('opening')) return; // ponytail: one tap only, no double-fire
  heartBurst(e.clientX, e.clientY);
  cover.classList.add('opening');
  // matches the pad-out animation so the page doesn't cut away mid-burst
  setTimeout(() => { location.href = '../index.html'; }, 620);
});
