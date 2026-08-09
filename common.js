/**
 * Moni Dresses - Common Utility Script
 * Firebase Integration & Global State Management
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBZdG23Io-oMElZ5XVmhVLd87-sq136dhY",
    authDomain: "moni-dresses-db.firebaseapp.com",
    projectId: "moni-dresses-db",
    storageBucket: "moni-dresses-db.firebasestorage.app",
    messagingSenderId: "24076547918",
    appId: "1:24076547918:web:6cae50157f9c6749ff501f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Global User & Role State
let currentUser = null;
let userRole = 'guest';

// Monitor Auth State and fetch user role from Firestore database
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                userRole = userDoc.data().role || 'client';
            } else {
                userRole = 'client';
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
            userRole = 'client';
        }
    } else {
        currentUser = null;
        userRole = 'guest';
    }
    updateHeaderCounters();
});

// Role-based Access Control Utility
window.checkAccess = function(allowedRoles) {
    if (!allowedRoles.includes(userRole)) {
        window.location.href = "login.html";
    }
};

// Global Cart Management
window.CartManager = {
    get: () => JSON.parse(localStorage.getItem('cartItems')) || [],
    save: (items) => localStorage.setItem('cartItems', JSON.stringify(items)),
    add: (product) => {
        let cart = CartManager.get();
        cart.push(product);
        CartManager.save(cart);
        updateHeaderCounters();
        showToast("Added to Cart Successfully!");
    }
};

// Global Wishlist Management
window.WishlistManager = {
    get: () => JSON.parse(localStorage.getItem('wishlistItems')) || [],
    toggle: (productId) => {
        let wishlist = WishlistManager.get();
        const index = wishlist.indexOf(productId);
        if (index > -1) {
            wishlist.splice(index, 1);
            showToast("Removed from Wishlist");
        } else {
            wishlist.push(productId);
            showToast("Added to Wishlist ❤️");
        }
        localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
        updateHeaderCounters();
    }
};

// Toast Notification Helper
window.showToast = function(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-zinc-800 transition-all duration-300";
    toast.innerHTML = `<span class="material-symbols-outlined text-emerald-400">check</span> <span class="text-xs font-medium">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
};

// Update Header Counters for Cart and Wishlist
function updateHeaderCounters() {
    const cart = CartManager.get();
    const wishlist = WishlistManager.get();
    
    const cartBadge = document.getElementById('cart-count');
    const wishlistBadge = document.getElementById('wishlist-count');
    
    if (cartBadge) {
        if (cart.length > 0) {
            cartBadge.innerText = cart.length;
            cartBadge.classList.remove('hidden');
        } else {
            cartBadge.classList.add('hidden');
        }
    }

    if (wishlistBadge) {
        if (wishlist.length > 0) {
            wishlistBadge.innerText = wishlist.length;
            wishlistBadge.classList.remove('hidden');
        } else {
            wishlistBadge.classList.add('hidden');
        }
    }
}

// Initialize on DOM Load
window.addEventListener('DOMContentLoaded', () => {
    updateHeaderCounters();
});
