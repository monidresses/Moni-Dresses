import { auth, db } from "./common.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export async function saveCompleteOrder(orderData) {
  const user = auth.currentUser;
  if (!user) return { success: false, error: "Please sign in before placing your order." };
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) return { success: false, error: "Your cart is empty." };
  const totalAmount = Number(orderData.totalAmount);
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) return { success: false, error: "Invalid order total." };

  try {
    const method = orderData.paymentMethod === "razorpay" ? "razorpay" : "cod";
    const orderRef = await addDoc(collection(db, "orders"), {
      customerId: user.uid,
      orderId: orderData.orderId || `MD-${Date.now()}`,
      customer: {
        name: String(orderData.name || "").trim(), phone: String(orderData.phone || "").trim(),
        address: String(orderData.address || "").trim(), city: String(orderData.city || "").trim(), pinCode: String(orderData.pinCode || "").trim()
      },
      items: orderData.items.map((item) => ({ productId: item.productId || item.id || null, name: String(item.name || ""), quantity: Math.max(1, Number(item.quantity || 1)), price: Number(item.price || 0), size: item.size || null, color: item.color || null, image: item.image || null })),
      financials: { totalAmount, paymentMethod: method },
      payment: { provider: method, status: method === "cod" ? "pending" : "created", ...(orderData.payment || {}) },
      shipping: { provider: "shiprocket", status: "pending" },
      status: "Pending",
      createdAt: serverTimestamp()
    });
    return { success: true, id: orderRef.id };
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    return { success: false, error: error.message };
  }
}
