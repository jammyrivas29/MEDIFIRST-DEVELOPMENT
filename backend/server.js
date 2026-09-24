const mongoose = require('mongoose');
const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medifirst';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log(' MongoDB connected successfully');
    await seedReferenceData();
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

// Idempotent seed of reference data so the admin console has live content.
async function seedReferenceData() {
  try {
    const Hospital = require('./src/models/Hospital');
    const ChatbotResponse = require('./src/models/ChatbotResponse');
    const ActivityLog = require('./src/models/ActivityLog');

    await Hospital.deleteMany({});
    await Hospital.insertMany([
      { name: 'Central Emergency Hospital', type: 'hospital', city: 'Manila', address: '123 Rizal Ave', phone: '+6321234567', emergencyRoom: true, location: { type: 'Point', coordinates: [120.9842, 14.5995] } },
      { name: 'St. Luke\'s Medical Center', type: 'hospital', city: 'Quezon City', address: '279 E Rodriguez Sr. Ave', phone: '+63287233101', emergencyRoom: true, location: { type: 'Point', coordinates: [121.0255, 14.6223] } },
      { name: 'Makati Trauma Center', type: 'trauma_center', city: 'Makati', address: '8 Zapote St', phone: '+63288881234', emergencyRoom: true, location: { type: 'Point', coordinates: [121.0244, 14.5547] } },
      { name: 'Barangay Health Clinic', type: 'clinic', city: 'Mandaluyong', address: 'Maysilo Circle', phone: '+63285331234', emergencyRoom: false, location: { type: 'Point', coordinates: [121.0359, 14.5794] } },
    ]);

    await ChatbotResponse.deleteMany({});
    await ChatbotResponse.insertMany([
      { intent: 'cpr', keywords: ['cpr', 'heart', 'cardiac', 'not breathing'], answer: 'If the person is unresponsive and not breathing normally, call emergency services, then begin chest compressions at 100–120/min, 2 inches deep, in the center of the chest. Continue until help arrives.', category: 'cpr', priority: 10 },
      { intent: 'choking', keywords: ['choking', 'can\'t breathe', 'blocked'], answer: 'If the person can\'t speak or breathe, give 5 back blows between the shoulder blades, then 5 abdominal thrusts (Heimlich). Repeat until the object clears or they become unconscious.', category: 'choking', priority: 10 },
      { intent: 'seizure', keywords: ['seizure', 'convulsion', 'fit'], answer: 'Stay with the person, cushion their head, and roll them onto their side. Do NOT restrain them or put anything in their mouth. Call emergency services if it lasts over 5 minutes.', category: 'seizures', priority: 8 },
      { intent: 'burns', keywords: ['burn', 'scald', 'fire'], answer: 'Cool the burn under running cool water for 20 minutes. Do not use ice, butter, or toothpaste. Cover with a clean non-stick dressing and seek care for large or deep burns.', category: 'burns', priority: 7 },
      { intent: 'bleeding', keywords: ['bleeding', 'cut', 'blood'], answer: 'Apply firm direct pressure with a clean cloth until bleeding stops. If blood soaks through, add more layers—do not remove the first. Seek emergency care for severe bleeding.', category: 'bleeding', priority: 9 },
    ]);

    const logCount = await ActivityLog.countDocuments();
    if (logCount === 0) {
      await ActivityLog.insertMany([
        { action: 'system_boot', category: 'system', description: 'Reference data seeded', severity: 'info' },
        { action: 'hospital_created', category: 'hospital', description: 'Seeded 4 hospitals', severity: 'info' },
        { action: 'chatbot_created', category: 'chatbot', description: 'Seeded 5 chatbot intents', severity: 'info' },
      ]);
    }
    console.log(' Reference data seeded (hospitals, chatbot responses, activity logs).');
  } catch (e) {
    console.error('  Reference seed skipped:', e.message);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  process.exit(1);
});
