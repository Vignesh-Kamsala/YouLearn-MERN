import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // Ensures no duplicate emails
      trim: true, // Removes whitespace
      lowercase: true // Stores email in lowercase
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [3, 'Password must be at least 3 characters'] // Basic validation
    }
  }, {
    timestamps: true // Adds createdAt, updatedAt fields automatically
  });

  const User = mongoose.model('User', userSchema);
//   module.exports = mongoose.model('User', userSchema);
export default User;