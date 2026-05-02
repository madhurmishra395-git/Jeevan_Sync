/**
 * Prescription Model
 * Linked strictly to userEmail – users can only access their own prescriptions.
 */
const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Prescription title is required'],
    trim: true,
  },
  doctor: { type: String, trim: true },
  notes: { type: String, trim: true },
  imageURL: { type: String, default: '' },
  medicines: [{ name: String, dosage: String, duration: String }],
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
