// Moni Dresses B2C runtime configuration.
// Public Firebase web config is safe to ship; private provider secrets are server-side only.
export const APP_CONFIG = Object.freeze({
  app: 'b2c',
  brandName: 'Moni Dresses',
  domains: {
    b2c: 'https://shop.monidresses.com',
    admin: 'https://admin.monidresses.com',
    branch: 'https://branch.monidresses.com',
    wholesale: 'https://wholesale.monidresses.com',
    creator: 'https://creator.monidresses.com',
    team: 'https://team.monidresses.com'
  },
  firebase: {
    apiKey: 'AIzaSyBZdG23Io-oMElZ5XVmhVLd87-sq136dhY',
    authDomain: 'moni-dresses-db.firebaseapp.com',
    projectId: 'moni-dresses-db',
    storageBucket: 'moni-dresses-db.firebasestorage.app',
    messagingSenderId: '24076547918',
    appId: '1:24076547918:web:6cae50157f9c6749ff501f'
  },
  collections: Object.freeze({
    products: 'products', categories: 'categories', orders: 'orders', users: 'users', siteConfig: 'siteConfig'
  }),
  functions: Object.freeze({
    createRazorpayOrder: 'createRazorpayOrder',
    verifyRazorpayPayment: 'verifyRazorpayPayment'
  })
});

export const B2C_BASE_URL = APP_CONFIG.domains.b2c;
export const ADMIN_BASE_URL = APP_CONFIG.domains.admin;
