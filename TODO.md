# XetaCart – Migration to Single Seller + WhatsApp Orders + Supabase

## Backend ✅
- [x] Add `@supabase/supabase-js` dependency
- [x] Rewrite `config/db.js` to use Supabase client
- [x] Add `config/seller.js` for predefined seller config + WhatsApp number
- [x] Rewrite `routes/auth.js` (buyer-only registration, seller login via predefined creds)
- [x] Rewrite `routes/products.js` to Supabase queries
- [x] Rewrite `routes/cart.js` to Supabase queries
- [x] Rewrite `middleware/auth.js` to Supabase queries
- [x] Remove `routes/orders.js`, add `routes/config.js` (seller WhatsApp/config)
- [x] Update `server.js` (remove order route, add config route, remove pg initDB, seed seller)

## Database ✅
- [x] Update `schema.sql` (remove orders/order_items, apply in Supabase)

## Frontend ✅
- [x] Update `api.js` (remove orders create, add config fetch, register buyer-only)
- [x] Update `Login.jsx` (buyer signup without role, seller login info)
- [x] Rewrite `Checkout.jsx` (WhatsApp order flow, no DB order)
- [x] Update `Navbar.jsx` (hide seller panel for customers, seller header)
- [x] Add `.env.example` for backend and frontend

## Docs ✅
- [x] Update `README.md` for new flow + Supabase setup
