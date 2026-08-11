# B2C ↔ Admin integration contract

The customer website and admin application are separate deployments. They communicate through the shared Firebase project rather than through localStorage or direct repository coupling.

## Admin writes
- `products`
- `categories`
- `siteConfig/public`
- `orders` status/payment fields where allowed by server-side rules

## B2C reads
- active products and categories
- public site configuration
- authenticated customer's own profile and orders

## Security
B2C code never grants admin privileges. Admin authorization must be enforced by Firebase Security Rules/claims in addition to the admin UI.

## Deployment
Each repository must be deployed independently and mapped to its dedicated subdomain. Cross-application navigation uses the centralized domain map instead of relative paths across repositories.
