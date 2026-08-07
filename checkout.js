import { saveCompleteOrder } from "./orderService.js";

// Save the original processOrderSuccess function from HTML
const originalProcessOrderSuccess = window.processOrderSuccess;

// Override processOrderSuccess to send order data to Firebase before redirecting
window.processOrderSuccess = async function(orderId, totalPaid) {
    const cart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const addressChoice = document.querySelector('input[name="addressSelect"]:checked').value;
    
    let customerData = {};
    if (addressChoice === 'saved') {
        const savedUser = JSON.parse(localStorage.getItem('userProfile')) || {};
        customerData = {
            name: savedUser.name || "Customer",
            phone: savedUser.phone || "",
            address: (savedUser.address?.building || "") + ", " + (savedUser.address?.area || ""),
            city: savedUser.address?.city || "",
            pinCode: savedUser.address?.pin || ""
        };
    } else {
        customerData = {
            name: document.getElementById('cust-name').value,
            phone: document.getElementById('cust-phone').value,
            address: (document.getElementById('cust-building').value || "") + ", " + (document.getElementById('cust-area').value || ""),
            city: document.getElementById('cust-city').value,
            pinCode: document.getElementById('cust-pin').value
        };
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    // Order payload structure matching orderService.js
    const orderData = {
        orderId: orderId,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        pinCode: customerData.pinCode,
        items: cart,
        totalAmount: totalPaid,
        paymentMethod: paymentMethod
    };

    // Send data to Firebase Firestore
    try {
        const result = await saveCompleteOrder(orderData);
        if (result.success) {
            console.log("Order successfully saved to Firebase! ID:", result.id);
        } else {
            console.error("Failed to save order to Firebase:", result.error);
        }
    } catch (error) {
        console.error("Firebase connection error during order placement:", error);
    }

    // Proceed with the original local success flow (Local Storage & Redirection)
    if (typeof originalProcessOrderSuccess === 'function') {
        originalProcessOrderSuccess(orderId, totalPaid);
    } else {
        const newOrder = {
            orderId: orderId,
            date: new Date().toLocaleDateString('en-IN'),
            items: cart,
            total: totalPaid,
            status: "Processing"
        };
        let orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
        orderHistory.unshift(newOrder);
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        localStorage.removeItem('cartItems');
        localStorage.setItem('latestOrderId', orderId);
        window.location.href = 'order-success.html';
    }
};
