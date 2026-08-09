const mongoose = require('mongoose');

const uri = "mongodb+srv://qambar:qambar0207@cluster0.sravbfn.mongodb.net/codnexa?retryWrites=true&w=majority";

async function testConnection() {
  console.log("Connecting to MongoDB Atlas...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("SUCCESS: Connected to MongoDB Atlas!");
    console.log("Database name:", mongoose.connection.name);
    console.log("Host:", mongoose.connection.host);
    await mongoose.disconnect();
    console.log("Disconnected.");
  } catch (err) {
    console.error("ERROR: Failed to connect to MongoDB Atlas:", err.message);
  }
}

testConnection();
