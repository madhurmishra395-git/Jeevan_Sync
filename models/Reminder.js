/**
 * Reminder Model – Medication reminders tied to userEmail.
 */
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, lowercase: true, index: true },
  medicineName: { type: String, required: [true, 'Medicine name is required'], trim: true },
  dosage: { type: String, required: true, trim: true },
  times: [{ type: String }], // e.g. ["08:00", "14:00", "20:00"]
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily',
  },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
