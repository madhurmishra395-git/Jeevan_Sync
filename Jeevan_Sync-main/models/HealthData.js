/**
 * HealthData Model – Daily health metrics tied to userEmail.
 */
const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, lowercase: true, index: true },
  date: { type: Date, default: Date.now },
  heartRate: { type: Number, min: 30, max: 250 }, // bpm
  steps: { type: Number, min: 0 },
  sleep: { type: Number, min: 0, max: 24 }, // hours
  calories: { type: Number, min: 0 },
  waterIntake: { type: Number, min: 0 }, // ml
  weight: { type: Number, min: 0 }, // kg
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number },
  },
  bloodSugar: { type: Number }, // mg/dL
  mood: { type: String, enum: ['great', 'good', 'okay', 'bad', 'awful', ''] },
}, { timestamps: true });

// One entry per day per user
healthDataSchema.index({ userEmail: 1, date: 1 });

module.exports = mongoose.model('HealthData', healthDataSchema);
