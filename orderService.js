// orderService.js
import { db } from "./db.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Saves the complete customer order to the Firebase Firestore database.
 * @param {Object} orderData - Object containing customer details, items, and payment info.
 * @returns {Object} - Returns success status with Firestore Document ID or error message.
 */
export async function saveCompleteOrder(orderData) {
    try {
        const orderRef = await addDoc(collection(db, "orders"), {
            orderId: orderData.orderId,
            customer: {
                name: orderData.name,
                phone: orderData.phone,
                address: orderData.address,
                city: orderData.city,
                pinCode: orderData.pinCode
            },
            items: orderData.items,
            financials: {
                totalAmount: orderData.totalAmount,
                paymentMethod: orderData.paymentMethod
            },
            status: "Pending",
            createdAt: serverTimestamp()
        });

        console.log("Order saved successfully! Document ID: ", orderRef.id);
        return { success: true, id: orderRef.id };

    } catch (error) {
        console.error("Error saving order to Firestore: ", error);
        return { success: false, error: error.message };
    }
}
