const products = [
  {
    id: 1,
    name: 'AirCharge Pro',
    category: 'Cargadores',
    price: 45000,
    colors: ['#1a1a1a', '#ffffff'],
    stock: true,
    isNew: true,
    img: 'assets/tech-placeholder.png',
    desc: 'Cargador rápido 20W compatible con iPhone y Android. Cable USB-C incluido. Carga tu dispositivo en tiempo récord.'
  },
  {
    id: 2,
    name: 'Legacy Buds',
    category: 'Audífonos',
    price: 85000,
    colors: ['#1a1a1a', '#ffffff', '#C9922A'],
    stock: true,
    isNew: true,
    img: 'assets/tech-placeholder.png',
    desc: 'Audífonos inalámbricos con cancelación de ruido. Batería de 24 horas y sonido premium.'
  },
  {
    id: 3,
    name: 'Wire Pro',
    category: 'Audífonos',
    price: 35000,
    colors: ['#1a1a1a', '#ffffff'],
    stock: true,
    isNew: false,
    img: 'assets/tech-placeholder.png',
    desc: 'Audífonos alámbricos de alta fidelidad. Jack 3.5mm universal con micrófono integrado.'
  },
  {
    id: 4,
    name: 'Crown Diadema',
    category: 'Diademas',
    price: 120000,
    colors: ['#1a1a1a', '#C9922A'],
    stock: true,
    isNew: false,
    img: 'assets/tech-placeholder.png',
    desc: 'Diadema inalámbrica over-ear con bass potente. Plegable, cómoda y con autonomía de 30 horas.'
  },
  {
    id: 5,
    name: 'Legacy Mouse',
    category: 'Mouse',
    price: 55000,
    colors: ['#1a1a1a', '#ffffff'],
    stock: true,
    isNew: false,
    img: 'assets/tech-placeholder.png',
    desc: 'Mouse inalámbrico silencioso con DPI ajustable. Batería recargable vía USB-C.'
  },
  {
    id: 6,
    name: 'Crown Keys',
    category: 'Teclados',
    price: 95000,
    colors: ['#1a1a1a'],
    stock: false,
    isNew: false,
    img: 'assets/tech-placeholder.png',
    desc: 'Teclado mecánico compacto TKL. Retroiluminación RGB y conexión inalámbrica Bluetooth.'
  },
  {
    id: 7,
    name: 'BoomLegacy',
    category: 'Parlantes',
    price: 150000,
    colors: ['#1a1a1a', '#C9922A'],
    stock: true,
    isNew: true,
    img: 'assets/tech-placeholder.png',
    desc: 'Parlante bluetooth portátil resistente al agua. Sonido 360° con graves profundos.'
  },
  {
    id: 8,
    name: 'SmartWatch J1',
    category: 'Relojes',
    price: 185000,
    colors: ['#1a1a1a', '#C9922A', '#8B6010'],
    stock: true,
    isNew: true,
    img: 'assets/tech-placeholder.png',
    desc: 'Reloj inteligente con monitor de salud, notificaciones y GPS. Resistente al agua IP67.'
  },
  {
    id: 9,
    name: 'Shield Case',
    category: 'Forros',
    price: 25000,
    colors: ['#1a1a1a', '#ffffff', '#C9922A', '#3a3a5c', '#2d4a2d'],
    stock: true,
    isNew: false,
    img: 'assets/tech-placeholder.png',
    desc: 'Forro de silicona premium con protección para cámara. Disponible para los modelos más populares.'
  }
];

const categories = ['Todos', 'Cargadores', 'Audífonos', 'Diademas', 'Mouse', 'Teclados', 'Parlantes', 'Relojes', 'Forros'];

let state = {
  category: 'Todos',
  color: null,
  sort: 'default',
  onlyStock: false
};

const WA_NUMBER = '573244083274';

function buildWALink(product, selectedColor) {
  const colorName = selectedColor || 'sin especificar';
  const msg = `Hola! Me interesa *${product.name}* (${product.category}) en color ${colorName}. Precio: $${formatPrice(product.price)} COP. ¿Está disponible?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function formatPrice(n) {
  return n.toLocaleString('es-CO');
}

function renderCategoryPills() {
  const container = document.getElementById('categoryPills');
  container.innerHTML = categories.map(cat =>
    `<button class="pill${cat === 'Todos' ? ' active' : ''}" data-cat="${cat}">${cat}</button>`
  ).join('');

  container.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.category = pill.dataset.cat;
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('resultsCount');

  let filtered = [...products];

  if (state.category !== 'Todos') {
    filtered = filtered.filter(p => p.category === state.category);
  }

  if (state.color) {
    filtered = filtered.filter(p => p.colors.includes(state.color));
  }

  if (state.onlyStock) {
    filtered = filtered.filter(p => p.stock);
  }

  if (state.sort === 'asc')  filtered.sort((a, b) => a.price - b.price);
  if (state.sort === 'desc') filtered.sort((a, b) => b.price - a.price);
  if (state.sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

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

    const colorDots = product.colors.map(c =>
      `<div class="card-color-dot" style="background:${c}"></div>`
    ).join('');

    const badge = product.isNew
      ? `<div class="card-badge badge-new">Nuevo</div>`
      : !product.stock
      ? `<div class="card-badge badge-out">Agotado</div>`
      : '';

    card.innerHTML = `
      ${badge}
      <div class="card-img-wrap">
        <img src="${product.img}" alt="${product.name}" onerror="this.style.display='none'">
        <div class="card-overlay">
          <button class="quick-view-btn">Ver detalle</button>
        </div>
      </div>
      <div class="card-info">
        <div class="card-style-tag">${product.category}</div>
        <div class="card-name">${product.name}</div>
        <div class="card-bottom">
          <div class="card-price">$${formatPrice(product.price)}</div>
          <div class="card-colors">${colorDots}</div>
        </div>
        <a class="card-wa" href="${buildWALink(product)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Pedir por WhatsApp
        </a>
      </div>
    `;

    card.querySelector('.quick-view-btn').addEventListener('click', e => {
      e.stopPropagation();
      openModal(product);
    });

    card.querySelector('.card-img-wrap').addEventListener('click', () => openModal(product));

    grid.insertBefore(card, emptyState);
  });
}

let selectedModalColor = null;

function openModal(product) {
  selectedModalColor = product.colors[0];

  document.getElementById('modalCategory').textContent = product.category;
  document.getElementById('modalName').textContent = product.name;
  document.getElementById('modalPrice').textContent = `$${formatPrice(product.price)} COP`;
  document.getElementById('modalDesc').textContent = product.desc;
  document.getElementById('modalImg').src = product.img;
  document.getElementById('modalImg').alt = product.name;

  const colorsEl = document.getElementById('modalColors');
  colorsEl.innerHTML = product.colors.map((c, i) =>
    `<div class="modal-color${i === 0 ? ' active' : ''}" style="background:${c}" data-color="${c}"></div>`
  ).join('');

  colorsEl.querySelectorAll('.modal-color').forEach(dot => {
    dot.addEventListener('click', () => {
      colorsEl.querySelectorAll('.modal-color').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      selectedModalColor = dot.dataset.color;
      updateModalWA(product);
    });
  });

  updateModalWA(product);
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateModalWA(product) {
  document.getElementById('modalWA').href = buildWALink(product, selectedModalColor);
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
  renderProducts();
});

document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    if (dot.classList.contains('active')) {
      dot.classList.remove('active');
      state.color = null;
    } else {
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      state.color = dot.dataset.color;
    }
    renderProducts();
  });
});

const toggleTrack = document.getElementById('stockToggle');
toggleTrack.addEventListener('click', () => {
  state.onlyStock = !state.onlyStock;
  toggleTrack.classList.toggle('on', state.onlyStock);
  renderProducts();
});

renderCategoryPills();
renderProducts();