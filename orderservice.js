import { db } from "./db.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export async function saveCompleteOrder(orderData) {
    try {
        const orderRef = await addDoc(collection(db, "orders"), {
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
        return { success: true, id: orderRef.id };
    } catch (error) {
        console.error("Error saving order: ", error);
        return { success: false, error: error.message };
    }
}
