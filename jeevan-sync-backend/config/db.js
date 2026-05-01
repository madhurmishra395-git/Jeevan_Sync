const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/jeevan_sync';
  const hasExplicitMongoUri = Boolean(process.env.MONGO_URI);

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);

    if (hasExplicitMongoUri) {
      process.exit(1);
    }

    console.warn('Continuing without MongoDB. Set MONGO_URI to enable persistent API data.');
  }
};

module.exports = connectDB;
