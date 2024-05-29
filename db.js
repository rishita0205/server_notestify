const mongoose = require("mongoose");
const connectDB = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB Successfully `);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDB;
// https://dribbble.com/shots/6236115-Elephant-Notes-website/attachments/6236115?mode=media
