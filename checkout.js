import { saveCompleteOrder } from "./orderService.js";
import { auth } from "./common.js";

function readCart() {
  try { return JSON.parse(localStorage.getItem("cartItems") || "[]"); }
  catch { return []; }
}

function getAddress() {
  return {
    name: document.getElementById("cust-name")?.value.trim() || "",
    phone: document.getElementById("cust-phone")?.value.trim() || "",
    address: [document.getElementById("cust-building")?.value, document.getElementById("cust-area")?.value].filter(Boolean).join(", "),
    city: document.getElementById("cust-city")?.value.trim() || "",
    pinCode: document.getElementById("cust-pin")?.value.trim() || ""
  };
}

export async function persistOrder(orderId, totalPaid, paymentMethod, payment = {}) {
  if (!auth.currentUser) throw new Error("Please sign in before placing your order.");
  const items = readCart();
  if (!items.length) throw new Error("Your cart is empty.");
  const address = getAddress();
  if (!address.name || !/^[0-9]{10}$/.test(address.phone) || !address.city || !/^[0-9]{6}$/.test(address.pinCode)) throw new Error("Please enter a valid delivery address.");
  const total = Number(totalPaid);
  if (!Number.isFinite(total) || total <= 0) throw new Error("Invalid order amount.");
  const result = await saveCompleteOrder({ orderId, ...address, items, totalAmount: total, paymentMethod, payment });
  if (!result.success) throw new Error(result.error || "Unable to save order.");
  return result;
}

window.processOrderSuccess = async function(orderId, totalPaid, payment = {}) {
  try {
    await persistOrder(orderId, totalPaid, document.querySelector('input[name="paymentMethod"]:checked')?.value || "cod", payment);
    localStorage.setItem("latestOrderId", orderId);
    localStorage.removeItem("cartItems");
    window.location.href = "order-success.html";
  } catch (error) {
    console.error("Order persistence failed:", error);
    alert(error.message || "Order could not be completed.");
  }
};
