const SUPABASE_URL = 'https://raslnnnqwwilhefygjrm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhc2xubm5xd3dpbGhlZnlnanJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTI2NTUsImV4cCI6MjA5NTQ4ODY1NX0.Z9X08leNDkmEuEjuDskBkKuCjN8mGR0Fg4wbj15eaH4';

let WA_NUMBER = '';

async function cargarConfiguracion() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/configuracion?select=*`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  const data = await res.json();
  if (data[0]) {
    WA_NUMBER = data[0].whatsapp;
    document.querySelectorAll('.ig-link').forEach(a => {
      a.href = `https://instagram.com/${data[0].instagram_tech}`;
    });
    document.querySelectorAll('.wa-link').forEach(a => {
      a.href = `https://wa.me/${data[0].whatsapp}`;
    });
  }
}

async function cargarProductos() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?tienda=eq.tech&select=*`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });
  return await res.json();
}

let state = {
  sort: 'default',
  onlyStock: false
};

function buildIGMessage(product) {
  return `Estoy interesado en "${product.nombre}"`;
}

function showToast(msg) {
  let toast = document.getElementById('igToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'igToast';
    toast.style.cssText = `
      position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
      background: #1a1a1a; color: #fff; padding: 12px 20px; border-radius: 10px;
      font-family: 'Rajdhani', sans-serif; font-size: 13px; letter-spacing: 0.05em;
      border: 1px solid rgba(201,146,42,0.3); z-index: 2000; opacity: 0;
      transition: opacity 0.3s; pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

async function contactarPorInstagram(product) {
  const msg = buildIGMessage(product);
  try {
    await navigator.clipboard.writeText(msg);
    showToast('Mensaje copiado, pégalo en el chat');
  } catch (err) {
    showToast('No se pudo copiar el mensaje');
  }
  window.open('https://ig.me/m/jlegacytech_', '_blank');
}

function formatPrice(n) {
  return n.toLocaleString('es-CO');
}

function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('resultsCount');

  let filtered = [...products];

  if (state.onlyStock) {
    filtered = filtered.filter(p => p.stock);
  }

  if (state.sort === 'asc')  filtered.sort((a, b) => a.precio - b.precio);
  if (state.sort === 'desc') filtered.sort((a, b) => b.precio - a.precio);
  if (state.sort === 'name') filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));

  countEl.textContent = `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`;

  grid.querySelectorAll('.product-card').forEach(c => c.remove());

  if (filtered.length === 0) {
    emptyState.classList.add('visible');
    return;
  }

  emptyState.classList.remove('visible');

  filtered.forEach((product, i) => {
    const card = document.createElement('div');
    card.className = 'product-card' + (product.stock ? '' : ' out-of-stock');
    card.style.animationDelay = `${i * 0.07}s`;

    const badge = product.es_nuevo
      ? `<div class="card-badge badge-new">Nuevo</div>`
      : !product.stock
      ? `<div class="card-badge badge-out">Agotado</div>`
      : '';

    const imgSrc = product.imagen_url || 'assets/tech-placeholder.jpg';

    card.innerHTML = `
      ${badge}
      <div class="card-img-wrap">
        <img src="${imgSrc}" alt="${product.nombre}" onerror="this.src='assets/tech-placeholder.jpg'">
        <div class="card-overlay">
          <button class="quick-view-btn">Ver detalle</button>
        </div>
      </div>
      <div class="card-info">
        <div class="card-style-tag">${product.categoria}</div>
        <div class="card-name">${product.nombre}</div>
        <div class="card-bottom">
          <div class="card-price">$${formatPrice(product.precio)}</div>
        </div>
        <button class="card-wa card-ig-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/></svg>
          Preguntar por Instagram
        </button>
      </div>
    `;

    card.querySelector('.quick-view-btn').addEventListener('click', e => {
      e.stopPropagation();
      openModal(product);
    });

    card.querySelector('.card-img-wrap').addEventListener('click', () => openModal(product));

    card.querySelector('.card-ig-btn').addEventListener('click', e => {
      e.stopPropagation();
      contactarPorInstagram(product);
    });

    grid.insertBefore(card, emptyState);
  });
}

function openModal(product) {
  document.getElementById('modalCategory').textContent = product.categoria;
  document.getElementById('modalName').textContent = product.nombre;
  document.getElementById('modalPrice').textContent = `$${formatPrice(product.precio)} COP`;
  document.getElementById('modalDesc').textContent = product.descripcion;
  document.getElementById('modalImg').src = product.imagen_url || 'assets/tech-placeholder.jpg';
  document.getElementById('modalImg').alt = product.nombre;

  updateModalWA(product);
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateModalWA(product) {
  const btn = document.getElementById('modalWA');
  btn.onclick = (e) => {
    e.preventDefault();
    contactarPorInstagram(product);
  };
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

document.getElementById('modalClose').addEventListener('click', closeModal);

document.getElementById('sortSelect').addEventListener('change', e => {
  state.sort = e.target.value;
  renderProducts(window._products || []);
});

const toggleTrack = document.getElementById('stockToggle');
const toggleTrackInner = toggleTrack.querySelector('.toggle-track');
toggleTrack.addEventListener('click', () => {
  state.onlyStock = !state.onlyStock;
  toggleTrackInner.classList.toggle('on', state.onlyStock);
  renderProducts(window._products || []);
});

async function init() {
  await cargarConfiguracion();
  const products = await cargarProductos();
  window._products = products;
  renderProducts(products);
}

init();
