// backend\config\db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.DATABASE_URL); // Verify the URI is loaded
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
    process.exit(1);
  }
};

export default connectDB;
