import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  duration: {
    type: Number, // duration in minutes or hours
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const TimeEntry = mongoose.model("TimeEntry", timeEntrySchema);
export default TimeEntry;
