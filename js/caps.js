const products = [
  {
    id: 1,
    name: 'Classic Crown',
    style: 'Snapback',
    price: 85000,
    colors: ['#1a1a1a', '#ffffff', '#C9922A'],
    stock: true,
    isNew: true,
    img: 'assets/cap-placeholder.png',
    desc: 'La gorra que define el estilo. Visera plana, cierre snapback ajustable y bordado premium del logo JLegacy.'
  },
  {
    id: 2,
    name: 'Legacy Trucker',
    style: 'Trucker',
    price: 75000,
    colors: ['#1a1a1a', '#4a3728'],
    stock: true,
    isNew: false,
    img: 'assets/cap-placeholder.png',
    desc: 'Estructura delantera rígida con malla trasera. Fresca, cómoda y con el sello JLegacy.'
  },
  {
    id: 3,
    name: 'Soft Legacy',
    style: 'Dad Hat',
    price: 70000,
    colors: ['#f5f0eb', '#1a1a1a', '#8B6010'],
    stock: true,
    isNew: false,
    img: 'assets/cap-placeholder.png',
    desc: 'Tela suave, visera curva y fit relajado. Para los que llevan el legacy con calma.'
  },
  {
    id: 4,
    name: 'Gold Edition',
    style: 'Snapback',
    price: 110000,
    colors: ['#C9922A', '#1a1a1a'],
    stock: true,
    isNew: true,
    img: 'assets/cap-placeholder.png',
    desc: 'Edición limitada. Detalles dorados, bordado metálico y acabado premium.'
  },
  {
    id: 5,
    name: 'Street Trucker',
    style: 'Trucker',
    price: 72000,
    colors: ['#2d4a2d', '#1a1a1a'],
    stock: false,
    isNew: false,
    img: 'assets/cap-placeholder.png',
    desc: 'El estilo de la calle. Malla trasera y logo bordado al frente.'
  },
  {
    id: 6,
    name: 'Crown Dad',
    style: 'Dad Hat',
    price: 68000,
    colors: ['#3a3a5c', '#1a1a1a', '#ffffff'],
    stock: true,
    isNew: false,
    img: 'assets/cap-placeholder.png',
    desc: 'Minimalismo con carácter. La corona JLegacy bordada en hilo dorado.'
  }
];

let state = {
  style: 'all',
  color: null,
  sort: 'default',
  onlyStock: false
};

const WA_NUMBER = '573001234567'; // ← cambia por tu número real

function buildWALink(product, selectedColor) {
  const colorName = selectedColor || 'sin especificar';
  const msg = `Hola! Me interesa la gorra *${product.name}* (${product.style}) en color ${colorName}. Precio: $${formatPrice(product.price)} COP. ¿Está disponible?`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function formatPrice(n) {
  return n.toLocaleString('es-CO');
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('resultsCount');

  let filtered = [...products];

  if (state.style !== 'all') {
    filtered = filtered.filter(p => p.style === state.style);
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

  const cards = grid.querySelectorAll('.product-card');
  cards.forEach(c => c.remove());

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
        <img src="${product.img}" alt="${product.name}" onerror="this.src='assets/cap-placeholder.png'">
        <div class="card-overlay">
          <button class="quick-view-btn">Ver detalle</button>
        </div>
      </div>
      <div class="card-info">
        <div class="card-style-tag">${product.style}</div>
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

    card.querySelector('.quick-view-btn').addEventListener('click', (e) => {
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

  document.getElementById('modalStyle').textContent = product.style;
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
  const btn = document.getElementById('modalWA');
  btn.href = buildWALink(product, selectedModalColor);
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('modalOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
});

document.getElementById('modalClose').addEventListener('click', closeModal);

document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.style = pill.dataset.style;
    renderProducts();
  });
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

document.getElementById('sortSelect').addEventListener('change', e => {
  state.sort = e.target.value;
  renderProducts();
});

const toggleTrack = document.getElementById('stockToggle');
toggleTrack.addEventListener('click', () => {
  state.onlyStock = !state.onlyStock;
  toggleTrack.classList.toggle('on', state.onlyStock);
  renderProducts();
});

renderProducts();