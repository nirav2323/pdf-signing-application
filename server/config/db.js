const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // const collections = await mongoose.connection.db.collections();

    // for (let collection of collections) {
    //     await collection.drop();
    //     console.log(`Dropped collection: ${collection.collectionName}`);
    // }
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;