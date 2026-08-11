# Moni Dresses — B2C Customer Website

This repository contains only the customer-facing B2C website.

## Architecture
- Customer UI: this repository
- Admin control plane: `monidresses/moni-dresses-admin`
- Shared data: Firebase Authentication + Firestore + Storage
- Product/category/homepage content is read from Firestore and can be managed from the Admin application.
- Each application is designed for its own subdomain.

## Canonical subdomains
- B2C: `shop.monidresses.com`
- Admin: `admin.monidresses.com`
- Branch: `branch.monidresses.com`
- Wholesale: `wholesale.monidresses.com`
- Creator: `creator.monidresses.com`
- Team: `team.monidresses.com`

## Firestore contract used by B2C
- `products` — active customer-visible products
- `categories` — active customer-visible categories
- `siteConfig/public` — public brand and homepage configuration
- `users/{uid}` — customer profile/role
- `orders` — customer orders (subject to Firebase Security Rules)

Do not put admin pages or privileged credentials in this repository.
