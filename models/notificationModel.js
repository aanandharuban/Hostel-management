// models/notificationModel.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: String, // e.g., "outing-request"
  message: String,
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  }
});

export default mongoose.model('Notification', notificationSchema);
