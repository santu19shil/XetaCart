require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;
const { ensureSeller } = require('./app');

const startServer = async () => {
  try {
    await ensureSeller();
  } catch (err) {
    console.warn('Seller setup warning (non-fatal):', err.message);
  }
  app.listen(PORT, () => {
    console.log(`XetaCart server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
