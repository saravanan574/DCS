import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({


  // Request details
  hospital: String,
  type:String,
  bloodGroup: String, // for blood request
  organType: String,  // for organ request
  message:String,
  contact: String,
  email: String,
  urgent:String,
  location: String,
  deadline: Date,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
