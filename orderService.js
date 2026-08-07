// orderService.js
import { db } from "./db.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export async function saveCompleteOrder(orderData) {
    try {
        // Checking if data is received
        console.log("Attempting to save order:", orderData);

        const orderRef = await addDoc(collection(db, "orders"), {
            orderId: orderData.orderId || "UNKNOWN",
            customer: {
                name: orderData.name || "",
                phone: orderData.phone || "",
                address: orderData.address || "",
                city: orderData.city || "",
                pinCode: orderData.pinCode || ""
            },
            items: orderData.items || [],
            financials: {
                totalAmount: orderData.totalAmount || 0,
                paymentMethod: orderData.paymentMethod || ""
            },
            status: "Pending",
            createdAt: serverTimestamp()
        });

        // If successful, this alert will show on your mobile screen
        alert("Order successfully saved to Firebase! ID: " + orderRef.id);
        return { success: true, id: orderRef.id };

    } catch (error) {
        // If there is an error, this alert will show the exact reason on your mobile screen
        console.error("Error saving order to Firestore: ", error);
        alert("Firebase Error: " + error.message);
        return { success: false, error: error.message };
    }
}
