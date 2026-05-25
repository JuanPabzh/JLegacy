document.querySelectorAll('.store-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    createGoldBurst(e.clientX, e.clientY);
  });

  btn.addEventListener('touchstart', function (e) {
    const touch = e.touches[0];
    createGoldBurst(touch.clientX, touch.clientY);
  }, { passive: true });
});

function createGoldBurst(x, y) {
  const colors = ['#FFE566', '#E8B84B', '#C9922A', '#F5D070'];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(particle);

    const angle = (i / count) * Math.PI * 2;
    const distance = Math.random() * 80 + 40;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance;

    particle.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
    ], {
      duration: 600 + Math.random() * 400,
      easing: 'cubic-bezier(0, 0.9, 0.57, 1)',
      fill: 'forwards'
    }).onfinish = () => particle.remove();
  }
}

// Cursor personalizado (solo desktop)
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 8px;
    height: 8px;
    background: #E8B84B;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transition: transform 0.15s ease, opacity 0.3s ease;
    transform: translate(-50%, -50%);
    mix-blend-mode: difference;
  `;
  document.body.appendChild(cursor);

  const cursorRing = document.createElement('div');
  cursorRing.style.cssText = `
    position: fixed;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(201,146,42,0.5);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9997;
    transition: transform 0.35s ease, width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(cursorRing);

  let mx = 0, my = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
    cursorRing.style.left = mx + 'px';
    cursorRing.style.top  = my + 'px';
  });

  document.querySelectorAll('.store-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      cursorRing.style.width  = '56px';
      cursorRing.style.height = '56px';
      cursorRing.style.borderColor = 'rgba(232,184,75,0.8)';
      cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
    });
    btn.addEventListener('mouseleave', () => {
      cursorRing.style.width  = '32px';
      cursorRing.style.height = '32px';
      cursorRing.style.borderColor = 'rgba(201,146,42,0.5)';
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}