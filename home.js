/**
 * Moni Dresses - Home Page Logic
 * Handles Dynamic Admin Config, Categories, Products, Search, & Drawers
 */

import { CartManager, WishlistManager, showToast, updateHeaderCounters } from './common.js';

// Default Fallback Products Data
const defaultProducts = [
  { id: "P1", name: "Designer Readymade Cotton Blouse", price: 449, originalPrice: 899, size: "34", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" },
  { id: "P2", name: "Printed Silk Festival Blouse", price: 599, originalPrice: 1199, size: "36", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500" },
  { id: "P3", name: "Pure Cotton Boat-Neck Blouse", price: 399, originalPrice: 799, size: "34", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500" },
  { id: "P4", name: "Partywear Embroidered Crop Blouse", price: 699, originalPrice: 1399, size: "38", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" },
  { id: "P5", name: "Traditional Red Bridal Blouse", price: 799, originalPrice: 1599, size: "34", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" },
  { id: "P6", name: "Black Velvet Sleeveless Blouse", price: 549, originalPrice: 1099, size: "36", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500" }
];

let displayLimit = 4;

/**
 * Load dynamic site configuration and banner data from Admin storage
 */
function loadAdminConfig() {
  const siteConfig = JSON.parse(localStorage.getItem('adminSiteConfig')) || {};
  if (siteConfig.brandName) {
    document.getElementById('header-brand-name').innerText = siteConfig.brandName;
    document.getElementById('page-title').innerText = siteConfig.brandName + " — Home";
  }

  const defaultBanner = {
    tag: "Limited Offer",
    title: "FESTIVE<br/>SALE",
    subtitle: "Get Extra 10% OFF on Readymade Blouses",
    buttonText: "Shop Collection",
    buttonLink: "#all-products"
  };
  const banner = JSON.parse(localStorage.getItem('adminBanner')) || defaultBanner;
  
  document.getElementById('banner-tag').innerText = banner.tag;
  document.getElementById('banner-title').innerHTML = banner.title;
  document.getElementById('banner-subtitle').innerText = banner.subtitle;
  const btn = document.getElementById('banner-btn');
  btn.innerText = banner.buttonText;
  btn.href = banner.buttonLink;
}

/**
 * Load Categories dynamically from Admin storage
 */
function loadCategories() {
  const container = document.getElementById('category-container');
  const adminCategories = JSON.parse(localStorage.getItem('adminCategories')) || [
    { name: "Printed", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200" },
    { name: "Designer", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200" },
    { name: "Silk", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" },
    { name: "Cotton", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200" }
  ];

  container.innerHTML = adminCategories.map(cat => `
    <a href="catalog.html?category=${encodeURIComponent(cat.name)}" class="flex flex-col items-center gap-1.5 shrink-0 group">
      <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-200 group-hover:border-primary transition-all shadow-sm">
        <img src="${cat.image}" alt="${cat.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
      </div>
      <span class="text-xs font-semibold text-zinc-700 group-hover:text-primary transition-colors">${cat.name}</span>
    </a>
  `).join('');
}

/**
 * Render Product Grids with distinct Wishlist Active States
 */
function renderProducts(productsToRender = null) {
  const products = productsToRender || JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
  const wishlist = WishlistManager.get();
  
  const recContainer = document.getElementById('recommended-container');
  const allGrid = document.getElementById('all-products-grid');
  const showMoreBtn = document.getElementById('show-more-btn');

  // 1. Recommended Section (First 4)
  recContainer.innerHTML = products.slice(0, 4).map(p => {
    const isWishlisted = wishlist.includes(p.id);
    return `
      <div class="w-40 shrink-0 bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm flex flex-col justify-between relative">
        <button onclick="handleWishlistClick('${p.id}')" aria-label="Wishlist" class="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all">
          <span class="material-symbols-outlined text-base ${isWishlisted ? 'text-primary fill-current font-bold' : 'text-zinc-600'}">favorite</span>
        </button>
        
        <div class="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
          <span class="absolute top-2 left-2 z-10 bg-primary text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">Hot Fit</span>
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover"/>
        </div>
        <div class="p-2.5 space-y-1">
          <h3 class="text-xs font-bold text-zinc-800 line-clamp-1">${p.name}</h3>
          <div class="flex items-baseline gap-1">
            <span class="text-xs font-extrabold text-zinc-900">₹${p.price}</span>
            <span class="text-[9px] text-zinc-400 line-through">₹${p.originalPrice || p.price * 2}</span>
          </div>
          <button onclick="handleAddToCart('${p.id}')" class="w-full py-1.5 bg-primary/10 text-primary font-bold text-[11px] rounded-lg hover:bg-primary hover:text-white transition-all active:scale-95">
            Add
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 2. All Products Grid (Paginated)
  const visibleProducts = products.slice(0, displayLimit);

  allGrid.innerHTML = visibleProducts.map(p => {
    const isWishlisted = wishlist.includes(p.id);
    return `
      <div class="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-sm flex flex-col justify-between relative group">
        <button onclick="handleWishlistClick('${p.id}')" aria-label="Wishlist" class="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-all">
          <span class="material-symbols-outlined text-lg ${isWishlisted ? 'text-primary fill-current font-bold' : 'text-zinc-600'}">favorite</span>
        </button>

        <div class="relative aspect-[3/4] bg-zinc-100 overflow-hidden">
          <span class="absolute top-2 left-2 z-10 bg-yellow-400 text-zinc-900 text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">Lowest Price</span>
          <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
        </div>
        <div class="p-3 space-y-1.5">
          <h3 class="text-xs font-bold text-zinc-800 line-clamp-1">${p.name}</h3>
          <div class="flex items-baseline gap-1.5">
            <span class="text-sm font-extrabold text-zinc-900">₹${p.price}</span>
            <span class="text-[10px] text-zinc-400 line-through">₹${p.originalPrice || p.price * 2}</span>
          </div>
          <button onclick="handleAddToCart('${p.id}')" class="w-full py-2 bg-primary/10 text-primary font-bold text-xs rounded-xl hover:bg-primary hover:text-white transition-all active:scale-95 mt-1">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }).join('');

  if (productsToRender || displayLimit >= products.length) {
    showMoreBtn.classList.add('hidden');
  } else {
    showMoreBtn.classList.remove('hidden');
  }
}

// Global scope bindings for inline HTML onclick events
window.handleWishlistClick = function(productId) {
  WishlistManager.toggle(productId);
  renderProducts();
};

window.handleAddToCart = function(productId) {
  const products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
  const productToAdd = products.find(p => p.id === productId);
  if (productToAdd) {
    CartManager.add({
      id: productToAdd.id,
      name: productToAdd.name,
      price: productToAdd.price,
      size: productToAdd.size || "34",
      qty: 1,
      image: productToAdd.image
    });
  }
};

window.showMoreProducts = function() {
  displayLimit += 4;
  renderProducts();
};

/**
 * Setup Live Search Event Listener
 */
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const products = JSON.parse(localStorage.getItem('adminProducts')) || defaultProducts;
    
    if (query === "") {
      renderProducts();
      return;
    }

    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    renderProducts(filtered);
  });
}

/**
 * Setup Menu & Notification Drawers Toggle Logic
 */
function setupDrawers() {
  const menuBtn = document.getElementById('menu-btn');
  const menuDrawer = document.getElementById('menu-drawer');
  const closeMenu = document.getElementById('close-menu');

  const notifBtn = document.getElementById('notif-btn');
  const notifDrawer = document.getElementById('notif-drawer');
  const closeNotif = document.getElementById('close-notif');

  menuBtn.addEventListener('click', () => menuDrawer.classList.remove('-translate-x-full'));
  closeMenu.addEventListener('click', () => menuDrawer.classList.add('-translate-x-full'));

  notifBtn.addEventListener('click', () => notifDrawer.classList.remove('translate-x-full'));
  closeNotif.addEventListener('click', () => notifDrawer.classList.add('translate-x-full'));
}

// Initialize on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  loadAdminConfig();
  loadCategories();
  renderProducts();
  setupSearch();
  setupDrawers();
  updateHeaderCounters();
});
