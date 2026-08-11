import { db } from './db.js';
import { collection, getDocs, limit, orderBy, query } from 'https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js';

const views = [...document.querySelectorAll('.view')];
const buttons = [...document.querySelectorAll('[data-view]')];
const title = document.getElementById('pageTitle');
const status = document.getElementById('dataStatus');
const state = { products: [], orders: [], customers: [], branches: [] };

buttons.forEach(button => button.addEventListener('click', () => {
  const view = button.dataset.view;
  buttons.forEach(item => item.classList.toggle('active', item === button));
  views.forEach(item => item.classList.toggle('active', item.id === view));
  title.textContent = button.textContent;
}));

document.getElementById('refreshBtn')?.addEventListener('click', loadData);
document.getElementById('productSearch')?.addEventListener('input', event => renderProducts(event.target.value));

const text = value => value == null ? '—' : String(value);
const money = value => typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : text(value);
const date = value => { try { return value?.toDate ? value.toDate().toLocaleString('en-IN') : new Date(value).toLocaleString('en-IN'); } catch { return text(value); } };
const cell = value => `<td>${text(value).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</td>`;

async function readCollection(name, options = {}) {
  const ref = collection(db, name);
  const q = options.orderBy ? query(ref, orderBy(options.orderBy, options.direction || 'desc'), limit(options.limit || 100)) : query(ref, limit(options.limit || 100));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

function renderProducts(filter = '') {
  const needle = filter.trim().toLowerCase();
  const rows = state.products.filter(p => `${p.name || ''} ${p.title || ''} ${p.category || ''}`.toLowerCase().includes(needle));
  document.getElementById('productsTable').innerHTML = rows.length ? rows.map(p => `<tr>${cell(p.name || p.title || p.id)}${cell(p.category)}${cell(money(p.price))}${cell(p.stock ?? p.quantity)}</tr>`).join('') : '<tr><td colspan="4" class="empty">No products found.</td></tr>';
}

function renderOrders() {
  const rows = state.orders;
  const html = rows.length ? rows.map(o => `<tr>${cell(o.orderNumber || o.orderId || o.id)}${cell(o.customerName || o.name || o.customerId)}${cell(money(o.total || o.amount))}<td><span class="badge">${text(o.status || 'pending')}</span></td>${cell(date(o.createdAt || o.date))}</tr>`).join('') : '<tr><td colspan="5" class="empty">No orders found.</td></tr>';
  document.getElementById('ordersTable').innerHTML = html;
  document.getElementById('recentOrders').innerHTML = rows.slice(0, 5).length ? rows.slice(0, 5).map(o => `<tr>${cell(o.orderNumber || o.orderId || o.id)}${cell(o.customerName || o.name || o.customerId)}${cell(money(o.total || o.amount))}<td><span class="badge">${text(o.status || 'pending')}</span></td></tr>`).join('') : '<tr><td colspan="4" class="empty">No recent orders.</td></tr>';
}

function renderCustomers() {
  const rows = state.customers;
  document.getElementById('customersTable').innerHTML = rows.length ? rows.map(c => `<tr>${cell(c.name || c.displayName || c.id)}${cell(c.email)}${cell(c.phone || c.phoneNumber)}</tr>`).join('') : '<tr><td colspan="3" class="empty">No customers found.</td></tr>';
}

async function loadData() {
  status.textContent = 'Loading store data…';
  try {
    const [products, orders, customers, branches] = await Promise.all([
      readCollection('products'),
      readCollection('orders', { orderBy: 'createdAt', direction: 'desc', limit: 100 }),
      readCollection('customers'),
      readCollection('branches')
    ]);
    Object.assign(state, { products, orders, customers, branches });
    document.getElementById('metricProducts').textContent = products.length;
    document.getElementById('metricOrders').textContent = orders.length;
    document.getElementById('metricCustomers').textContent = customers.length;
    document.getElementById('metricBranches').textContent = branches.length;
    renderProducts(document.getElementById('productSearch')?.value || '');
    renderOrders();
    renderCustomers();
    status.textContent = 'Live Firestore data';
  } catch (error) {
    console.error(error);
    status.textContent = 'Data access needs Firebase rules/auth';
    ['metricProducts','metricOrders','metricCustomers','metricBranches'].forEach(id => document.getElementById(id).textContent = '—');
    document.getElementById('recentOrders').innerHTML = '<tr><td colspan="4" class="empty">Connect Firebase Authentication and secure Firestore rules to load admin data.</td></tr>';
    document.getElementById('productsTable').innerHTML = '<tr><td colspan="4" class="empty">Admin data access is not configured yet.</td></tr>';
    document.getElementById('ordersTable').innerHTML = '<tr><td colspan="5" class="empty">Admin data access is not configured yet.</td></tr>';
    document.getElementById('customersTable').innerHTML = '<tr><td colspan="3" class="empty">Admin data access is not configured yet.</td></tr>';
  }
}

loadData();