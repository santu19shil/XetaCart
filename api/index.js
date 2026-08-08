// Vercel serverless entry point.
// It wraps the reusable Express app (backend/app.js) as a single serverless function.
const app = require('../backend/app');

// Vercel will invoke this handler for every request matched by vercel.json rewrites.
module.exports = app;
