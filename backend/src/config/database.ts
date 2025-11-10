import mongoose from 'mongoose';

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/epitrello';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

    await mongoose.connect(mongoUri);

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB. Please verify MONGODB_URI is set correctly and the database is accessible.', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error);
});
