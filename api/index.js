// Vercel serverless entry point.
// It wraps the reusable Express app (backend/app.js) as a single serverless function.
const app = require('../backend/app');

// Kick off idempotent database seeds (seller account + customer IDs) on cold
// start. This is fire-and-forget; requests are not blocked on it.
require('../backend/app').ensureSeller().catch((err) => {
  console.error('Seller account setup failed in serverless:', err.message);
});

// Vercel will invoke this handler for every request matched by vercel.json rewrites.
module.exports = app;
