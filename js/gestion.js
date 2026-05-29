const SUPABASE_URL = 'https://raslnnnqwwilhefygjrm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhc2xubm5xd3dpbGhlZnlnanJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTI2NTUsImV4cCI6MjA5NTQ4ODY1NX0.Z9X08leNDkmEuEjuDskBkKuCjN8mGR0Fg4wbj15eaH4';

const HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// ── ESTADO ──
let allProducts = [];
let editingId = null;
let selectedColors = [];
let uploadedImageUrl = null;

// ── TOAST ──
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (isError ? ' error' : '');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── NAVEGACIÓN ──
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    item.classList.add('active');
    const target = item.dataset.section;
    document.getElementById(target).classList.add('active');
    document.getElementById('pageTitle').textContent = item.dataset.title || 'Admin';

    if (target === 'sec-productos') loadProductos();
    if (target === 'sec-config') loadConfig();
    if (target === 'sec-dashboard') loadDashboard();

    // Cerrar sidebar en mobile
    document.querySelector('.sidebar').classList.remove('open');
  });
});

// Mobile menu
document.getElementById('menuToggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

// ── DASHBOARD ──
async function loadDashboard() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*`, { headers: HEADERS });
  const products = await res.json();

  const caps = products.filter(p => p.tienda === 'caps');
  const tech = products.filter(p => p.tienda === 'tech');
  const inStock = products.filter(p => p.stock);

  document.getElementById('statTotal').textContent = products.length;
  document.getElementById('statCaps').textContent = caps.length;
  document.getElementById('statTech').textContent = tech.length;
  document.getElementById('statStock').textContent = inStock.length;
}

// ── PRODUCTOS ──
async function loadProductos() {
  const search = document.getElementById('searchInput')?.value?.toLowerCase() || '';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?select=*&order=created_at.desc`, { headers: HEADERS });
  allProducts = await res.json();

  let filtered = allProducts;
  if (search) filtered = filtered.filter(p => p.nombre.toLowerCase().includes(search));

  renderTable(filtered);
}

function renderTable(products) {
  const tbody = document.getElementById('productosBody');
  tbody.innerHTML = '';

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--gray)">No hay productos</td></tr>`;
    return;
  }

  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <img class="product-thumb" src="${p.imagen_url || 'assets/cap-placeholder.jpg'}" 
             onerror="this.src='assets/cap-placeholder.jpg'" alt="${p.nombre}">
      </td>
      <td class="td-name">${p.nombre}</td>
      <td><span class="badge badge-${p.tienda}">${p.tienda}</span></td>
      <td>${p.categoria}</td>
      <td class="td-price">$${p.precio.toLocaleString('es-CO')}</td>
      <td><span class="badge ${p.stock ? 'badge-stock' : 'badge-nostock'}">${p.stock ? 'Disponible' : 'Agotado'}</span></td>
      <td class="td-actions">
        <button class="btn btn-outline btn-sm" onclick="editarProducto(${p.id})">
          <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar
        </button>
        <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${p.id}, '${p.nombre}')">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          Eliminar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── DRAWER ──
function openDrawer(titulo) {
  document.getElementById('drawerTitle').textContent = titulo;
  document.getElementById('drawerOverlay').classList.add('open');
}

function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  resetForm();
}

document.getElementById('drawerOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('drawerOverlay')) closeDrawer();
});

document.getElementById('drawerClose').addEventListener('click', closeDrawer);

function resetForm() {
  document.getElementById('productoForm').reset();
  editingId = null;
  selectedColors = [];
  uploadedImageUrl = null;
  renderColorChips();
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('stockToggle').classList.remove('on');
  document.getElementById('nuevoToggle').classList.remove('on');
}

// ── NUEVO PRODUCTO ──
document.getElementById('btnNuevo').addEventListener('click', () => {
  resetForm();
  openDrawer('Nuevo Producto');
});

// ── EDITAR ──
function editarProducto(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;

  editingId = id;
  selectedColors = p.colores || [];
  uploadedImageUrl = p.imagen_url || null;

  document.getElementById('inputNombre').value = p.nombre;
  document.getElementById('inputDescripcion').value = p.descripcion || '';
  document.getElementById('inputPrecio').value = p.precio;
  document.getElementById('inputTienda').value = p.tienda;
  document.getElementById('inputCategoria').value = p.categoria;

  const stockToggle = document.getElementById('stockToggle');
  p.stock ? stockToggle.classList.add('on') : stockToggle.classList.remove('on');

  const nuevoToggle = document.getElementById('nuevoToggle');
  p.es_nuevo ? nuevoToggle.classList.add('on') : nuevoToggle.classList.remove('on');

  if (p.imagen_url) {
    const prev = document.getElementById('imgPreview');
    prev.src = p.imagen_url;
    prev.style.display = 'block';
  }

  renderColorChips();
  openDrawer('Editar Producto');
}

// ── ELIMINAR ──
async function eliminarProducto(id, nombre) {
  if (!confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) return;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS
  });

  if (res.ok) {
    showToast('Producto eliminado');
    loadProductos();
    loadDashboard();
  } else {
    showToast('Error al eliminar', true);
  }
}

// ── GUARDAR ──
document.getElementById('btnGuardar').addEventListener('click', async () => {
  const nombre = document.getElementById('inputNombre').value.trim();
  const descripcion = document.getElementById('inputDescripcion').value.trim();
  const precio = parseInt(document.getElementById('inputPrecio').value);
  const tienda = document.getElementById('inputTienda').value;
  const categoria = document.getElementById('inputCategoria').value.trim();
  const stock = document.getElementById('stockToggle').classList.contains('on');
  const es_nuevo = document.getElementById('nuevoToggle').classList.contains('on');

  if (!nombre || !precio || !tienda || !categoria) {
    showToast('Completa los campos obligatorios', true);
    return;
  }

  const payload = {
    nombre,
    descripcion,
    precio,
    tienda,
    categoria,
    stock,
    es_nuevo,
    colores: selectedColors,
    imagen_url: uploadedImageUrl
  };

  let res;
  if (editingId) {
    res = await fetch(`${SUPABASE_URL}/rest/v1/productos?id=eq.${editingId}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify(payload)
    });
  } else {
    res = await fetch(`${SUPABASE_URL}/rest/v1/productos`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(payload)
    });
  }

  if (res.ok) {
    showToast(editingId ? 'Producto actualizado ✓' : 'Producto creado ✓');
    closeDrawer();
    loadProductos();
    loadDashboard();
  } else {
    showToast('Error al guardar', true);
  }
});

// ── IMAGEN ──
document.getElementById('imgInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}.${ext}`;

  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/productos/${fileName}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type
    },
    body: file
  });

  if (uploadRes.ok) {
    uploadedImageUrl = `${SUPABASE_URL}/storage/v1/object/public/productos/${fileName}`;
    const prev = document.getElementById('imgPreview');
    prev.src = uploadedImageUrl;
    prev.style.display = 'block';
    showToast('Imagen subida ✓');
  } else {
    showToast('Error al subir imagen', true);
  }
});

// ── COLORES ──
document.getElementById('btnAddColor').addEventListener('click', () => {
  const color = document.getElementById('colorPicker').value;
  if (!selectedColors.includes(color)) {
    selectedColors.push(color);
    renderColorChips();
  }
});

function renderColorChips() {
  const wrap = document.getElementById('colorChips');
  wrap.innerHTML = selectedColors.map((c, i) => `
    <div class="color-chip">
      <div class="color-chip-dot" style="background:${c}"></div>
      <span>${c}</span>
      <span class="color-chip-remove" onclick="removeColor(${i})">✕</span>
    </div>
  `).join('');
}

function removeColor(i) {
  selectedColors.splice(i, 1);
  renderColorChips();
}

// ── TOGGLES DEL FORM ──
document.getElementById('stockToggle').addEventListener('click', function() {
  this.classList.toggle('on');
});

document.getElementById('nuevoToggle').addEventListener('click', function() {
  this.classList.toggle('on');
});

// ── BUSCAR ──
document.getElementById('searchInput')?.addEventListener('input', () => loadProductos());

// ── CONFIGURACIÓN ──
async function loadConfig() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/configuracion?select=*`, { headers: HEADERS });
  const data = await res.json();
  if (data[0]) {
    document.getElementById('inputWA').value = data[0].whatsapp || '';
    document.getElementById('inputIGCaps').value = data[0].instagram_caps || '';
    document.getElementById('inputIGTech').value = data[0].instagram_tech || '';
  }
}

document.getElementById('btnGuardarConfig').addEventListener('click', async () => {
  const whatsapp = document.getElementById('inputWA').value.trim();
  const instagram_caps = document.getElementById('inputIGCaps').value.trim();
  const instagram_tech = document.getElementById('inputIGTech').value.trim();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/configuracion?id=eq.1`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify({ whatsapp, instagram_caps, instagram_tech })
  });

  if (res.ok) {
    showToast('Configuración guardada ✓');
  } else {
    showToast('Error al guardar', true);
  }
});

// ── INIT ──
loadDashboard();
