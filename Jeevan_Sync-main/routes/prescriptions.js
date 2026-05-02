/**
 * Prescription Routes: /api/prescriptions
 */
const router = require('express').Router();
const Prescription = require('../models/Prescription');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  const items = await Prescription.find({ userEmail: req.user.email }).sort({ date: -1 });
  res.json({ success: true, data: items });
});

router.post('/', async (req, res) => {
  try {
    const item = await Prescription.create({ ...req.body, userEmail: req.user.email });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await Prescription.findOneAndDelete({ _id: req.params.id, userEmail: req.user.email });
  res.json({ success: true, message: 'Deleted' });
});

module.exports = router;
