/**
 * Appointment Model – Telemedicine/in-person bookings tied to userEmail.
 */
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, lowercase: true, index: true },
  doctorName: { type: String, required: true, trim: true },
  specialty: { type: String, trim: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['telemedicine', 'in-person'], default: 'telemedicine' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String },
  meetingLink: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
