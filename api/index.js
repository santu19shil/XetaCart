// Vercel serverless entry point.
const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);
const missingConfiguration = [];

if (!process.env.SUPABASE_URL) missingConfiguration.push('SUPABASE_URL');
if (!hasSupabaseKey) missingConfiguration.push('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY');
for (const key of ['JWT_SECRET', 'REFRESH_SECRET']) {
  if (!process.env[key] || process.env[key].length < 32) missingConfiguration.push(`${key} (at least 32 characters)`);
}

if (missingConfiguration.length > 0) {
  // Return a readable setup error instead of a Vercel FUNCTION_INVOCATION_FAILED.
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
