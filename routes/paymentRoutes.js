const router = require('express').Router();
const { processPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/process', protect, processPayment);

module.exports = router;
