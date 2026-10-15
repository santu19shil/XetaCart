// Vercel serverless entry point.
const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);
const missingConfiguration = [];

if (!process.env.SUPABASE_URL) missingConfiguration.push('SUPABASE_URL');
if (!hasSupabaseKey) missingConfiguration.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY');

if (missingConfiguration.length > 0) {
  // Database configuration is required for all API routes. Auth secrets are
  // checked by auth-only routes so public product browsing can remain available.
  module.exports = (req, res) => res.status(503).json({
    code: 'API_CONFIGURATION_REQUIRED',
    message: `Configure these Production environment variables in Vercel: ${missingConfiguration.join(', ')}.`,
  });
} else {
  const app = require('../backend/app');

  // Create the seller account if needed without delaying the first request.
  app.ensureSeller().catch((err) => {
    console.error('Seller account setup failed in serverless:', err.message);
  });

  module.exports = app;
}
