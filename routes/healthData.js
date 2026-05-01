/**
 * Health Data Routes: /api/health-data
 * All routes protected by JWT. Data strictly filtered by req.user.email.
 */
const router = require('express').Router();
const HealthData = require('../models/HealthData');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require auth

// GET  – fetch last 30 days
router.get('/', async (req, res) => {
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const data = await HealthData.find({ userEmail: req.user.email, date: { $gte: thirtyDaysAgo } })
    .sort({ date: -1 });
  res.json({ success: true, data });
});

// POST – log new entry
router.post('/', async (req, res) => {
  try {
    const entry = await HealthData.create({ ...req.body, userEmail: req.user.email });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT – update by id (ownership enforced)
router.put('/:id', async (req, res) => {
  const doc = await HealthData.findOneAndUpdate(
    { _id: req.params.id, userEmail: req.user.email },
    req.body, { new: true }
  );
  if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
  res.json({ success: true, data: doc });
});

// DELETE
router.delete('/:id', async (req, res) => {
  const doc = await HealthData.findOneAndDelete({ _id: req.params.id, userEmail: req.user.email });
  if (!doc) return res.status(404).json({ success: false, message: 'Entry not found' });
  res.json({ success: true, message: 'Deleted' });
});

module.exports = router;
