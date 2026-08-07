<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Checkout - Moni Dresses</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f9; padding: 20px; }
        .checkout-container { max-width: 500px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .submit-btn { background: #28a745; color: white; padding: 12px; border: none; width: 100%; border-radius: 4px; font-size: 16px; cursor: pointer; }
        .submit-btn:hover { background: #218838; }
    </style>
</head>
<body>

    <div class="checkout-container">
        <h2>Checkout Details</h2>
        <form id="orderForm">
            <div class="form-group">
                <label for="customerName">Full Name</label>
                type="text" id="customerName" required placeholder="Enter your name">
            </div>

            <div class="form-group">
                <label for="customerPhone">Phone Number</label>
                <input type="tel" id="customerPhone" required placeholder="Enter phone number">
            </div>

            <div class="form-group">
                <label for="customerAddress">Delivery Address</label>
                <textarea id="customerAddress" required placeholder="House no, Street, Area"></textarea>
            </div>

            <div class="form-group">
                <label for="customerCity">City</label>
                <input type="text" id="customerCity" required placeholder="Enter city">
            </div>

            <div class="form-group">
                <label for="customerPin">Pin Code</label>
                <input type="text" id="customerPin" required placeholder="Enter pin code">
            </div>

            <button type="submit" class="submit-btn">Place Order (COD)</button>
        </form>
    </div>

    <!-- JavaScript for Firebase Integration -->
    <script type="module">
        import { saveCompleteOrder } from "./orderService.js";

        document.getElementById("orderForm").addEventListener("submit", async function(e) {
            e.preventDefault();

            // Collecting input values
            const orderData = {
                name: document.getElementById("customerName").value,
                phone: document.getElementById("customerPhone").value,
                address: document.getElementById("customerAddress").value,
                city: document.getElementById("customerCity").value,
                pinCode: document.getElementById("customerPin").value,
                items: [
                    { sku: "BLOUSE-01", name: "Cotton Designer Blouse", size: "34", quantity: 1, price: 850 }
                ],
                totalAmount: 850,
                paymentMethod: "COD",
                source: "Website"
            };

            // Call function to save data in Firebase
            const result = await saveCompleteOrder(orderData);

            if (result.success) {
                alert("Order placed successfully! Order ID: " + result.id);
                document.getElementById("orderForm").reset();
            } else {
                alert("Failed to place order. Please try again.");
            }
        });
    </script>

</body>
</html>
