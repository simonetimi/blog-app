import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

export async function connect() {
  if (!MONGO_URI) {
    throw new Error("Couldn't find MONGO_URI in env secrets.");
  }
  try {
    await mongoose.connect(MONGO_URI);
    const connection = mongoose.connection;
    connection.on('connected', () => {});
    connection.on('error', () => {
      process.exit();
    });
  } catch (error) {
    throw new Error(`Error connecting to the database: ${String(error)}`);
  }
}
