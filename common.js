/**
 * Moni Dresses B2C shared runtime.
 * Customer UI only; administration is handled by the separate admin application.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { APP_CONFIG } from './app-config.js';

const app = initializeApp(APP_CONFIG.firebase);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { collection, getDocs, doc, getDoc, query, where, orderBy, limit };

let currentUser = null;
let userRole = 'guest';

onAuthStateChanged(auth, async (user) => {
  currentUser = user || null;
  userRole = 'guest';
  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      userRole = userDoc.exists() ? (userDoc.data().role || 'client') : 'client';
    } catch (error) {
      console.error('Unable to load customer profile:', error);
      userRole = 'client';
    }
  }
  updateHeaderCounters();
  document.dispatchEvent(new CustomEvent('moni:auth-ready', { detail: { user: currentUser, role: userRole } }));
});

export const getCurrentUser = () => currentUser;
export const getCurrentRole = () => userRole;

// Customer pages may use this for account-only screens. Admin authorization is never based on this function.
export function requireCustomerAuth(redirect = 'login.html') {
  if (!currentUser) window.location.href = redirect;
  return currentUser;
}

export const CartManager = {
  get: () => JSON.parse(localStorage.getItem('cartItems') || '[]'),
  save: (items) => localStorage.setItem('cartItems', JSON.stringify(items)),
  add: (product) => {
    const cart = CartManager.get();
    const existing = cart.find(item => item.id === product.id && item.size === product.size);
    if (existing) existing.qty = (existing.qty || 1) + (product.qty || 1);
    else cart.push({ ...product, qty: product.qty || 1 });
    CartManager.save(cart);
    updateHeaderCounters();
    showToast('Added to Cart Successfully!');
  }
};

export const WishlistManager = {
  get: () => JSON.parse(localStorage.getItem('wishlistItems') || '[]'),
  toggle: (productId) => {
    const wishlist = WishlistManager.get();
    const index = wishlist.indexOf(productId);
    if (index > -1) {
      wishlist.splice(index, 1);
      showToast('Removed from Wishlist');
    } else {
      wishlist.push(productId);
      showToast('Added to Wishlist ❤️');
    }
    localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
    updateHeaderCounters();
    return wishlist.includes(productId);
  }
};

export function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800 transition-all duration-300 transform translate-y-4 opacity-0';
  const text = document.createElement('span');
  text.className = 'text-xs font-medium tracking-wide';
  text.textContent = message;
  toast.appendChild(text);
  container.appendChild(toast);
  setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 10);
  setTimeout(() => { toast.classList.add('translate-y-4', 'opacity-0'); setTimeout(() => toast.remove(), 300); }, 2500);
}

export function updateHeaderCounters() {
  const cart = CartManager.get();
  const wishlist = WishlistManager.get();
  const cartBadge = document.getElementById('cart-count');
  const wishlistBadge = document.getElementById('wishlist-count');
  if (cartBadge) {
    cartBadge.innerText = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    cartBadge.classList.toggle('hidden', cart.length === 0);
  }
  if (wishlistBadge) {
    wishlistBadge.innerText = wishlist.length;
    wishlistBadge.classList.toggle('hidden', wishlist.length === 0);
  }
}

export function goToAdmin() {
  window.location.href = APP_CONFIG.domains.admin;
}
