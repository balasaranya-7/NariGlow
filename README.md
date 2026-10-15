# NariGlow

NariGlow is a single-page storefront served by its Express API. The API stores accounts, products, carts, wishlists, newsletter subscriptions, and orders in MongoDB.

## Run locally

1. Install Node.js 18 or newer and start a local MongoDB server, or set `MONGO_URI` to a MongoDB Atlas database.
2. Copy `backend/.env.local.example` to `backend/.env.local` (PowerShell: `Copy-Item backend/.env.local.example backend/.env.local`). Replace `YOUR_DB_PASSWORD` in `MONGO_URI` (URL-encode special characters in the password), and replace `JWT_SECRET` with a long random secret. Keep credentials in this ignored local file; do not commit them.
3. In a terminal, run:

   ```powershell
   cd backend
   npm install
   npm run seed
   npm start
   ```

4. Open <http://localhost:5000>. Do not open `frontend/nariglow.html` directly; the Express server provides the API routes used by the page.

`npm run seed` replaces the product and category collections with the demo catalogue. Run it only when you intend to reset those collections.

## Password reset email

Password reset links are sent through Resend. Add `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (an address on a verified Resend domain), and `APP_URL` to `backend/.env.local`. Without these values, password reset returns a configuration message; normal sign-in, shopping, and checkout still work.

## Deploy

Deploy the `backend` folder as a Node.js web service and serve the included frontend from that same service. Add the values in `backend/.env.production.example` to the hosting provider's secret environment settings. Use a MongoDB Atlas URI with a database user restricted to the NariGlow database, a unique random `JWT_SECRET`, HTTPS `APP_URL`, and a verified Resend sender. Configure Atlas Network Access for the hosting provider, then deploy and open the HTTPS site URL.

The checkout records orders in MongoDB. Card and UPI choices are not yet processed by a payment gateway, so orders remain marked `Pending`; connect a payment provider before accepting live online payments.
