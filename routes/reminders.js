/**
 * Reminder Routes: /api/reminders
 */
const router = require('express').Router();
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/',    async (req, res) => {
  const items = await Reminder.find({ userEmail: req.user.email }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
});

router.post('/',   async (req, res) => {
  try {
    const item = await Reminder.create({ ...req.body, userEmail: req.user.email });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const doc = await Reminder.findOneAndUpdate(
    { _id: req.params.id, userEmail: req.user.email }, req.body, { new: true }
  );
  if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: doc });
});

router.delete('/:id', async (req, res) => {
  await Reminder.findOneAndDelete({ _id: req.params.id, userEmail: req.user.email });
  res.json({ success: true, message: 'Deleted' });
});

module.exports = router;
