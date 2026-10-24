(function () {
  'use strict';

  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const WA_NUMBER = '573244083274';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Cada módulo corre protegido: si uno falla, los demás siguen funcionando
  function safe(name, fn) {
    try {
      fn();
    } catch (err) {
      console.error('[dev.js] Falló el módulo "' + name + '":', err);
    }
  }

  /* ───────── 1. SCROLL: barra, línea de tiempo y menú activo ───────── */
  safe('scroll', () => {
    const progressBar = $('#scrollProgress');
    const timeline = $('#timeline');
    const timelineFill = $('#timelineFill');
    const navLinks = $$('.nav-links a');
    const navSections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        if (progressBar) progressBar.style.transform = 'scaleX(' + p + ')';

        if (timeline && timelineFill) {
          const r = timeline.getBoundingClientRect();
          const start = window.innerHeight * 0.65;
          const prog = Math.min(1, Math.max(0, (start - r.top) / r.height));
          timelineFill.style.height = (prog * 100) + '%';
        }

        let current = null;
        const line = window.innerHeight * 0.35;
        navSections.forEach(sec => {
          const r = sec.getBoundingClientRect();
          if (r.top <= line && r.bottom > line) current = sec.id;
        });
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));

        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
  });

  /* ───────── 2. APARECER AL HACER SCROLL ───────── */
  safe('reveal', () => {
    const revealEls = $$('.reveal');

    function revealEl(el) {
      const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
      const idx = Math.max(0, siblings.indexOf(el));
      setTimeout(() => el.classList.add('visible'), Math.min(idx, 5) * 90);
    }

    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            revealEl(e.target);
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(el => io.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('visible'));
    }
  });

  /* ───────── 3. EFECTOS DE MOUSE (tilt y luz) ───────── */
  safe('mouse', () => {
    if (finePointer && !reduceMotion) {
      $$('[data-tilt]').forEach(el => {
        el.addEventListener('pointermove', e => {
          const r = el.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg');
          el.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
        });
        el.addEventListener('pointerleave', () => {
          el.style.setProperty('--rx', '0deg');
          el.style.setProperty('--ry', '0deg');
        });
      });
    }

    $$('[data-spot]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  });

  /* ───────── 4. TEXTO QUE SE ESCRIBE SOLO ───────── */
  safe('typed', () => {
    const typedEl = $('#typedText');
    if (!typedEl || reduceMotion) return;

    const phrases = [
      'en internet.',
      'en Google Maps.',
      'con inventario al día.',
      'con reservas online.',
      'con presencia profesional.'
    ];

    let pi = 0;
    let ci = phrases[0].length;
    let deleting = true;

    function tick() {
      const full = phrases[pi];
      typedEl.textContent = full.slice(0, ci);
      let delay = deleting ? 35 : 70;

      if (!deleting && ci === full.length) {
        deleting = true;
        delay = 1600;
      } else if (deleting && ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
        delay = 400;
      } else {
        ci += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    }

    setTimeout(tick, 1800);
  });

  /* ───────── 5. DEMO EN VIVO: pequeña presentación automática ─────────
     El cambio de negocio y de funciones funciona solo con HTML y CSS.
     Aquí solo activamos Maps y QR la primera vez que se ve la demo. */
  safe('demo', () => {
    const stage = $('.demo-stage');
    const maps = $('#feat-maps');
    const qr = $('#feat-qr');
    let touched = false;

    $$('.demo-wrap .demo-input').forEach(i => {
      i.addEventListener('change', () => { touched = true; });
    });

    if (!stage || !maps || !qr || reduceMotion || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(() => { if (!touched) maps.checked = true; }, 900);
      setTimeout(() => { if (!touched) qr.checked = true; }, 1800);
    }, { threshold: 0.4 });

    io.observe(stage);
  });

  /* ───────── 6. CELULAR DE JLIFE ───────── */
  safe('jlife', () => {
    const appOrder = ['menu', 'finanzas', 'gimnasio', 'pendientes'];
    const appScreens = $$('.app-screen');
    const appTabs = $$('.app-tab');
    const appPhone = $('#appPhone');
    let appIndex = 0;
    let appTimer = null;
    let appUser = false;

    function showApp(name) {
      appIndex = Math.max(0, appOrder.indexOf(name));
      appScreens.forEach(s => s.classList.toggle('active', s.dataset.screen === name));
      appTabs.forEach(t => t.classList.toggle('active', t.dataset.app === name));
    }

    function pauseApp() {
      if (appTimer) {
        clearInterval(appTimer);
        appTimer = null;
      }
    }

    function startApp() {
      if (appTimer || appUser || reduceMotion) return;
      appTimer = setInterval(() => {
        showApp(appOrder[(appIndex + 1) % appOrder.length]);
      }, 3500);
    }

    $$('[data-app]').forEach(el => {
      el.addEventListener('click', () => {
        appUser = true;
        pauseApp();
        showApp(el.dataset.app);
      });
    });

    if (appPhone && 'IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) startApp();
        else pauseApp();
      }, { threshold: 0.35 }).observe(appPhone);
    }
  });

  /* ───────── 7. ARMA TU PAQUETE ───────── */
  safe('builder', () => {
    const bizInput = $('#bizType');
    const serviceChips = $$('.service-chip');
    const payRadios = $$('input[name="pago"]');
    const summaryBiz = $('#summaryBiz');
    const summaryList = $('#summaryList');
    const summaryPay = $('#summaryPay');
    const sendWA = $('#sendWA');

    if (!bizInput || !sendWA) return;

    const payLabels = {
      'Pago único': 'Pago: único',
      'Plan mensual': 'Pago: plan mensual',
      'Aún no sé': 'Pago: por definir'
    };

    function updateSummary() {
      const biz = bizInput.value.trim();
      const services = serviceChips.filter(c => c.classList.contains('active')).map(c => c.dataset.service);
      const checked = payRadios.find(r => r.checked);
      const pay = checked ? checked.value : 'Aún no sé';

      summaryBiz.textContent = biz || 'Tu negocio';

      summaryList.textContent = '';
      if (!services.length) {
        const li = document.createElement('li');
        li.className = 'summary-empty';
        li.textContent = 'Aún no has elegido nada';
        summaryList.appendChild(li);
      } else {
        services.forEach(s => {
          const li = document.createElement('li');
          li.textContent = s;
          summaryList.appendChild(li);
        });
      }

      summaryPay.textContent = payLabels[pay] || 'Pago: por definir';

      let text;
      if (!biz && !services.length) {
        text = 'Hola, vi JLegacy Software y quiero más información.';
      } else {
        const lines = ['Hola, vi JLegacy Software y quiero cotizar.'];
        if (biz) lines.push('Negocio: ' + biz);
        if (services.length) {
          lines.push('Me interesa:');
          services.forEach(s => lines.push('- ' + s));
        }
        lines.push(pay === 'Aún no sé' ? 'Aún no sé cómo prefiero pagar.' : 'Pago preferido: ' + pay.toLowerCase());
        text = lines.join('\n');
      }

      sendWA.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
    }

    bizInput.addEventListener('input', updateSummary);

    serviceChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        chip.setAttribute('aria-pressed', chip.classList.contains('active') ? 'true' : 'false');
        updateSummary();
      });
    });

    payRadios.forEach(r => r.addEventListener('change', updateSummary));
    updateSummary();
  });

  /* ───────── 8. FONDO DE PARTÍCULAS ───────── */
  safe('canvas', () => {
    const canvas = $('#bgCanvas');
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, particles = [], raf = null, resizeTimer = null;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(70, Math.floor((w * h) / 24000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.4 + 0.6,
        gold: Math.random() < 0.2
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.gold ? 'rgba(232,184,75,0.7)' : 'rgba(125,180,255,0.7)';
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(125,180,255,' + (0.14 * (1 - dist / 120)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    frame();

    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        frame();
      }
    });
  });

})();