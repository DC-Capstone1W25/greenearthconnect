import mongoose from 'mongoose';

const connectDB = async () => {
    console.log(process.env.DATABASE_URL); // to verify the URI is loaded correctly

  const conn = await mongoose.connect(process.env.DATABASE_URL);
  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold)
};

export default connectDB;
