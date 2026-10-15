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

## Deploy (Render backend + Vercel frontend)

The repository includes a Render Blueprint (`render.yaml`) and Vercel configuration (`vercel.json`). The frontend uses a Vercel function to proxy `/api/*` to Render, so the browser keeps using same-origin API requests.

1. In Render, create a new Blueprint from this GitHub repository and the `master` branch. Enter the Atlas connection string when prompted for `MONGO_URI`; Render generates `JWT_SECRET` automatically. Allow the Render service to connect to your Atlas cluster in Atlas Network Access. Wait for the web service to finish deploying and copy its `https://...onrender.com` URL.
2. In Vercel, import the same GitHub repository. Keep the project root at the repository root so Vercel sees `vercel.json` and `api/proxy.js`.
3. In the Vercel project environment variables, add `NARIGLOW_API_URL` with the Render service URL (no trailing slash), then redeploy. The root URL will serve `frontend/nariglow.html`.
4. If password reset email is configured, set `APP_URL` on Render to the Vercel HTTPS URL and add `RESEND_API_KEY` plus `RESEND_FROM_EMAIL`. These email settings are optional for registration, sign-in, shopping, and checkout.

The checkout records orders in MongoDB. Card and UPI choices are not processed by a payment gateway, so orders remain marked `Pending`; connect a payment provider before accepting live online payments.

The checkout records orders in MongoDB. Card and UPI choices are not yet processed by a payment gateway, so orders remain marked `Pending`; connect a payment provider before accepting live online payments.
