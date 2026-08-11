/** Moni Dresses B2C home: reads products/content directly from Firestore controlled by Admin. */
import { CartManager, WishlistManager, showToast, updateHeaderCounters, db, collection, getDocs, doc, getDoc, query, where, orderBy, limit } from './common.js';

const fallbackProducts = [
  { id: 'fallback-1', name: 'Designer Readymade Cotton Blouse', price: 449, originalPrice: 899, size: '34', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500', active: true },
  { id: 'fallback-2', name: 'Printed Silk Festival Blouse', price: 599, originalPrice: 1199, size: '36', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500', active: true },
  { id: 'fallback-3', name: 'Pure Cotton Boat-Neck Blouse', price: 399, originalPrice: 799, size: '34', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500', active: true }
];

let products = [];
let displayLimit = 4;

const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

async function loadSiteContent() {
  try {
    const snap = await getDoc(doc(db, 'siteConfig', 'public'));
    const data = snap.exists() ? snap.data() : {};
    if (data.brandName) {
      const brand = document.getElementById('header-brand-name');
      const title = document.getElementById('page-title');
      if (brand) brand.textContent = data.brandName;
      if (title) title.textContent = `${data.brandName} — Home`;
    }
    const banner = data.homeBanner || {};
    const tag = document.getElementById('banner-tag');
    const heading = document.getElementById('banner-title');
    const subtitle = document.getElementById('banner-subtitle');
    const button = document.getElementById('banner-btn');
    if (tag) tag.textContent = banner.tag || 'Limited Offer';
    if (heading) heading.textContent = banner.title || 'FESTIVE SALE';
    if (subtitle) subtitle.textContent = banner.subtitle || 'Shop the latest collection';
    if (button) { button.textContent = banner.buttonText || 'Shop Collection'; button.href = banner.buttonLink || '#all-products'; }
  } catch (error) {
    console.warn('Site content unavailable; using existing page defaults.', error);
  }
}

async function loadCategories() {
  const container = document.getElementById('category-container');
  if (!container) return;
  try {
    const snap = await getDocs(query(collection(db, 'categories'), where('active', '==', true), orderBy('sortOrder')));
    const categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (categories.length) {
      container.innerHTML = categories.map(cat => `
        <a href="catalog.html?category=${encodeURIComponent(cat.slug || cat.name)}" class="flex flex-col items-center gap-1.5 shrink-0 group">
          <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-200 group-hover:border-primary transition-all shadow-sm">
            <img src="${esc(cat.image || '')}" alt="${esc(cat.name)}" class="w-full h-full object-cover" loading="lazy"/>
          </div>
          <span class="text-xs font-semibold text-zinc-700">${esc(cat.name)}</span>
        </a>`).join('');
    }
  } catch (error) {
    console.warn('Categories could not be loaded from Admin data.', error);
  }
}

async function loadProducts() {
  try {
    const snap = await getDocs(query(collection(db, 'products'), where('active', '==', true), orderBy('sortOrder'), limit(100)));
    products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn('Dynamic products unavailable; using fallback data.', error);
    products = fallbackProducts;
  }
  renderProducts();
}

function card(p, compact = false) {
  const wishlist = WishlistManager.get();
  const isWishlisted = wishlist.includes(p.id);
  return `<div class="${compact ? 'w-40 shrink-0' : ''} bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm flex flex-col justify-between relative group">
    <button onclick="handleWishlistClick('${esc(p.id)}')" aria-label="Wishlist" class="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
      <span class="material-symbols-outlined text-lg ${isWishlisted ? 'text-primary font-bold' : 'text-zinc-600'}">favorite</span>
    </button>
    <a href="product-details.html?id=${encodeURIComponent(p.id)}" class="relative aspect-[3/4] bg-zinc-100 overflow-hidden block">
      <img src="${esc(p.image || '')}" alt="${esc(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy"/>
    </a>
    <div class="p-3 space-y-1.5">
      <h3 class="text-xs font-bold text-zinc-800 line-clamp-1">${esc(p.name)}</h3>
      <div class="flex items-baseline gap-1.5"><span class="text-sm font-extrabold text-zinc-900">₹${Number(p.price || 0)}</span>${p.originalPrice ? `<span class="text-[10px] text-zinc-400 line-through">₹${Number(p.originalPrice)}</span>` : ''}</div>
      <button onclick="handleAddToCart('${esc(p.id)}')" class="w-full py-2 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all">Add to Cart</button>
    </div>
  </div>`;
}

function renderProducts(filtered = null) {
  const list = filtered || products;
  const rec = document.getElementById('recommended-container');
  const grid = document.getElementById('all-products-grid');
  const more = document.getElementById('show-more-btn');
  if (rec) rec.innerHTML = list.slice(0, 4).map(p => card(p, true)).join('');
  if (grid) grid.innerHTML = list.slice(0, displayLimit).map(p => card(p)).join('');
  if (more) more.classList.toggle('hidden', displayLimit >= list.length);
}

window.handleWishlistClick = (id) => { WishlistManager.toggle(id); renderProducts(); };
window.handleAddToCart = (id) => {
  const p = products.find(item => item.id === id);
  if (!p) return;
  CartManager.add({ id: p.id, name: p.name, price: Number(p.price || 0), size: p.size || (p.sizes?.[0] || 'Free Size'), qty: 1, image: p.image });
};
window.showMoreProducts = () => { displayLimit += 4; renderProducts(); };

function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', e => {
    const q = e.target.value.toLowerCase().trim();
    renderProducts(q ? products.filter(p => `${p.name || ''} ${p.sku || ''} ${p.category || ''}`.toLowerCase().includes(q)) : null);
  });
}

function setupDrawers() {
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const closeMenu = document.getElementById('close-menu');
  const notifBtn = document.getElementById('notif-btn');
  const notifDrawer = document.getElementById('notif-drawer');
  const closeNotif = document.getElementById('close-notif');
  menuBtn?.addEventListener('click', () => menuDrawer?.classList.remove('-translate-x-full'));
  closeMenu?.addEventListener('click', () => menuDrawer?.classList.add('-translate-x-full'));
  notifBtn?.addEventListener('click', () => notifDrawer?.classList.remove('translate-x-full'));
  closeNotif?.addEventListener('click', () => notifDrawer?.classList.add('translate-x-full'));
}

window.addEventListener('DOMContentLoaded', async () => {
  setupSearch();
  setupDrawers();
  updateHeaderCounters();
  await Promise.all([loadSiteContent(), loadCategories(), loadProducts()]);
});
