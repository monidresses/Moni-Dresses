import { auth, db } from "./common.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export async function saveCompleteOrder(orderData) {
  const user = auth.currentUser;
  if (!user) return { success: false, error: "Please sign in before placing an order." };

  try {
    const orderRef = await addDoc(collection(db, "orders"), {
      customerId: user.uid,
      orderId: orderData.orderId || `MD-${Date.now()}`,
      customer: {
        name: orderData.name || "",
        phone: orderData.phone || "",
        address: orderData.address || "",
        city: orderData.city || "",
        pinCode: orderData.pinCode || ""
      },
      items: Array.isArray(orderData.items) ? orderData.items : [],
      financials: {
        totalAmount: Number(orderData.totalAmount || 0),
        paymentMethod: orderData.paymentMethod || ""
      },
      payment: {
        provider: orderData.paymentMethod === "razorpay" ? "razorpay" : "cod",
        status: "pending"
      },
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
