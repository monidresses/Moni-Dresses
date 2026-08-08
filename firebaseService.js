// firebaseService.js - Centralized Firebase Service for Products, Cart, and Orders

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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
const db = getFirestore(app);

export { db };

// ==================== PRODUCTS SERVICE ====================

/**
 * Get all products from Firestore
 * Falls back to default products if Firestore is empty
 */
export async function getAllProducts() {
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log("No products in Firestore. Using default products.");
      return getDefaultProducts();
    }
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log("✅ Loaded", products.length, "products from Firestore");
    return products;
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return getDefaultProducts();
  }
}

/**
 * Get single product by ID
 */
export async function getProductById(productId) {
  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log("Product not found in Firestore. Checking defaults.");
      return getDefaultProducts().find(p => p.id === productId);
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return getDefaultProducts().find(p => p.id === productId);
  }
}

/**
 * Get all categories from Firestore
 */
export async function getCategories() {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);
    
    if (snapshot.empty) {
      console.log("No categories in Firestore. Using defaults.");
      return getDefaultCategories();
    }
    
    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log("✅ Loaded", categories.length, "categories from Firestore");
    return categories;
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    return getDefaultCategories();
  }
}

// ==================== CART SERVICE ====================

/**
 * Get user's cart from Firestore
 */
export async function getUserCart(userId) {
  try {
    const cartsRef = collection(db, "carts");
    const q = query(cartsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("No cart found for user:", userId);
      return [];
    }
    
    let cartItems = [];
    snapshot.forEach((doc) => {
      cartItems = doc.data().items || [];
    });
    
    console.log("✅ Loaded cart from Firestore:", cartItems.length, "items");
    return cartItems;
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    return [];
  }
}

/**
 * Save cart to Firestore
 */
export async function saveCartToFirebase(userId, cartItems) {
  try {
    const cartsRef = collection(db, "carts");
    const q = query(cartsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // Create new cart
      await addDoc(cartsRef, {
        userId: userId,
        items: cartItems,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log("✅ Cart created in Firestore");
    } else {
      // Update existing cart
      const docId = snapshot.docs[0].id;
      const cartDocRef = doc(db, "carts", docId);
      await updateDoc(cartDocRef, {
        items: cartItems,
        updatedAt: serverTimestamp()
      });
      console.log("✅ Cart updated in Firestore");
    }
  } catch (error) {
    console.error("❌ Error saving cart:", error);
  }
}

/**
 * Add item to cart
 */
export async function addToCartFirebase(userId, cartItem) {
  try {
    const cartItems = await getUserCart(userId);
    
    // Check if item already exists
    const existingItemIndex = cartItems.findIndex(item => item.id === cartItem.id && item.size === cartItem.size);
    
    if (existingItemIndex > -1) {
      // Increase quantity
      cartItems[existingItemIndex].qty = (cartItems[existingItemIndex].qty || 1) + (cartItem.qty || 1);
    } else {
      // Add new item
      cartItems.push(cartItem);
    }
    
    await saveCartToFirebase(userId, cartItems);
    console.log("✅ Item added to cart");
    return cartItems;
  } catch (error) {
    console.error("❌ Error adding to cart:", error);
    return [];
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCartFirebase(userId, productId, size) {
  try {
    const cartItems = await getUserCart(userId);
    const filteredItems = cartItems.filter(item => !(item.id === productId && item.size === size));
    
    await saveCartToFirebase(userId, filteredItems);
    console.log("✅ Item removed from cart");
    return filteredItems;
  } catch (error) {
    console.error("❌ Error removing from cart:", error);
    return cartItems;
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(userId, productId, size, newQuantity) {
  try {
    const cartItems = await getUserCart(userId);
    
    const itemIndex = cartItems.findIndex(item => item.id === productId && item.size === size);
    if (itemIndex > -1) {
      if (newQuantity <= 0) {
        cartItems.splice(itemIndex, 1);
      } else {
        cartItems[itemIndex].qty = newQuantity;
      }
    }
    
    await saveCartToFirebase(userId, cartItems);
    console.log("✅ Cart quantity updated");
    return cartItems;
  } catch (error) {
    console.error("❌ Error updating quantity:", error);
    return cartItems;
  }
}

/**
 * Clear entire cart
 */
export async function clearCartFirebase(userId) {
  try {
    await saveCartToFirebase(userId, []);
    console.log("✅ Cart cleared");
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
  }
}

// ==================== DEFAULT DATA (FALLBACK) ====================

function getDefaultProducts() {
  return [
    { 
      id: "P1", 
      name: "Designer Readymade Cotton Blouse", 
      price: 449, 
      originalPrice: 899, 
      size: "34", 
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
      description: "Premium cotton blouse with front hook closure",
      fabric: "100% Pure Cotton",
      category: "Designer"
    },
    { 
      id: "P2", 
      name: "Printed Silk Festival Blouse", 
      price: 599, 
      originalPrice: 1199, 
      size: "36", 
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
      description: "Elegant printed silk blouse perfect for festivals",
      fabric: "Silk Blend",
      category: "Printed"
    },
    { 
      id: "P3", 
      name: "Pure Cotton Boat-Neck Blouse", 
      price: 399, 
      originalPrice: 799, 
      size: "34", 
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
      description: "Comfortable boat-neck cotton blouse",
      fabric: "100% Pure Cotton",
      category: "Cotton"
    },
    { 
      id: "P4", 
      name: "Partywear Embroidered Crop Blouse", 
      price: 699, 
      originalPrice: 1399, 
      size: "38", 
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500",
      description: "Beautiful embroidered crop blouse for parties",
      fabric: "Cotton with Embroidery",
      category: "Designer"
    },
    { 
      id: "P5", 
      name: "Traditional Red Bridal Blouse", 
      price: 799, 
      originalPrice: 1599, 
      size: "34", 
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500",
      description: "Stunning red bridal blouse with traditional designs",
      fabric: "Silk",
      category: "Designer"
    },
    { 
      id: "P6", 
      name: "Black Velvet Sleeveless Blouse", 
      price: 549, 
      originalPrice: 1099, 
      size: "36", 
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500",
      description: "Elegant black velvet sleeveless blouse",
      fabric: "Velvet",
      category: "Designer"
    }
  ];
}

function getDefaultCategories() {
  return [
    { id: "cat1", name: "Printed", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=200" },
    { id: "cat2", name: "Designer", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200" },
    { id: "cat3", name: "Silk", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" },
    { id: "cat4", name: "Cotton", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200" }
  ];
}
