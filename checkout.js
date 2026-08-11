import { saveCompleteOrder } from "./orderService.js";
import { auth } from "./common.js";

const originalProcessOrderSuccess = window.processOrderSuccess;

function readCart() {
  return JSON.parse(localStorage.getItem('cartItems') || '[]');
}

function getAddress() {
  const choice = document.querySelector('input[name="addressSelect"]:checked')?.value;
  if (choice === 'saved') {
    const user = JSON.parse(localStorage.getItem('userProfile') || '{}');
    const address = user.address || {};
    return { name: user.name || '', phone: user.phone || '', address: [address.building, address.area, address.village].filter(Boolean).join(', '), city: address.city || '', pinCode: address.pin || '' };
  }
  return {
    name: document.getElementById('cust-name')?.value.trim() || '',
    phone: document.getElementById('cust-phone')?.value.trim() || '',
    address: [document.getElementById('cust-building')?.value, document.getElementById('cust-area')?.value, document.getElementById('cust-village')?.value].filter(Boolean).join(', '),
    city: document.getElementById('cust-city')?.value.trim() || '',
    pinCode: document.getElementById('cust-pin')?.value.trim() || ''
  };
}

async function persistOrder(orderId, totalPaid, paymentMethod, payment = {}) {
  const address = getAddress();
  const result = await saveCompleteOrder({ orderId, ...address, items: readCart(), totalAmount: totalPaid, paymentMethod, payment });
  if (!result.success) throw new Error(result.error || 'Unable to save order.');
  return result;
}

window.processOrderSuccess = async function(orderId, totalPaid, payment = {}) {
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cod';
  try {
    await persistOrder(orderId, totalPaid, paymentMethod, payment);
    if (typeof originalProcessOrderSuccess === 'function') originalProcessOrderSuccess(orderId, totalPaid);
    else {
      localStorage.setItem('latestOrderId', orderId);
      localStorage.removeItem('cartItems');
      window.location.href = 'order-success.html';
    }
  } catch (error) {
    console.error('Order persistence failed:', error);
    alert(error.message || 'Order could not be completed.');
  }
};

export { persistOrder };
