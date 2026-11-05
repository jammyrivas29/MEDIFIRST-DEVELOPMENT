const mongoose = require('mongoose');
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Auto-detect: prefer local MongoDB if MONGO_URI_LOCAL is set
const LOCAL_MONGO_URI = process.env.MONGO_URI_LOCAL;
const ATLAS_MONGO_URI = process.env.MONGODB_URI;

// Determine which DB to use based on environment variable
let MONGODB_URI, DB_MODE, DB_DESCRIPTION;

if (LOCAL_MONGO_URI) {
  MONGODB_URI = LOCAL_MONGO_URI;
  DB_MODE = 'offline';
  DB_DESCRIPTION = 'local MongoDB';
} else if (ATLAS_MONGO_URI) {
  MONGODB_URI = ATLAS_MONGO_URI;
  DB_MODE = 'online';
  DB_DESCRIPTION = 'Atlas Cloud';
} else {
  // Fallback to localhost
  MONGODB_URI = 'mongodb://127.0.0.1:27017/medifirst';
  DB_MODE = 'offline';
  DB_DESCRIPTION = 'local MongoDB (fallback)';
}

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log(' MongoDB connected successfully');
    console.log(` Database: ${DB_DESCRIPTION} (${DB_MODE})`);
    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('');
      console.log(' API Endpoints:');
      console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/logout`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/forgot-password`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/reset-password/:token `);
      console.log(`   POST   http://localhost:${PORT}/api/auth/reset-password/:token`);
      console.log(`   GET    http://localhost:${PORT}/api/first-aid`);
      console.log(`   GET    http://localhost:${PORT}/api/hospitals`);
      console.log(`   GET    http://localhost:${PORT}/api/chatbot/match`);
      console.log(`   GET    http://localhost:${PORT}/api/admin/stats`);
      console.log(`   GET    http://localhost:${PORT}/api/admin/activity`);
      console.log('');
      console.log(' MediFirst API is ready!');
    });
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    console.log(' Check your MONGODB_URI in .env file');
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
