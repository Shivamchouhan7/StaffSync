const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.error('================================================================');
    console.error('[StaffSync Configuration Error]');
    console.error('MONGODB_URI is missing or empty in your environment variables.');
    console.error('Please configure MONGODB_URI in server/.env with your local MongoDB');
    console.error('or MongoDB Atlas connection string.');
    console.error('Example: MONGODB_URI=mongodb://127.0.0.1:27017/staffsync');
    console.error('Or Atlas: MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/staffsync');
    console.error('================================================================');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[StaffSync Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('================================================================');
    console.error('[StaffSync Database Connection Failure]');
    console.error(`Failed to connect to MongoDB: ${error.message}`);
    console.error('Please verify your database service is running and credentials are valid.');
    console.error('================================================================');
    process.exit(1);
  }
};

module.exports = connectDB;
