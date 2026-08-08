require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;
const { ensureSeller } = require('./app');

const startServer = async () => {
  await ensureSeller();
  app.listen(PORT, () => {
    console.log(`XetaCart server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
