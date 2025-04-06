import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: String, // Matches email from User model
    required: [true, 'User ID is required'],
    ref: 'User' // References User model (not enforced as ObjectId here for simplicity)
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    match: [/^https:\/\/(www\.)?youtube\.com\/watch\?v=.+$/, 'Must be a valid YouTube URL'] // Basic URL validation
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now // Sets current date if not provided
  }
}, {
  timestamps: true // Adds createdAt, updatedAt
});
const History = mongoose.model('History', historySchema);
export default History;