const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Process mock payment
 * @route   POST /api/payment/process
 * @access  Private
 *
 * Simulates a payment gateway.
 * - Succeeds ~90% of the time (configurable)
 * - Returns a mock paymentId (UUID) on success
 */
const processPayment = async (req, res, next) => {
  try {
    const { amount, cardNumber } = req.body;

    if (!amount || amount <= 0) {
      return next(new ApiError('Valid payment amount is required', 400));
    }

    // Simulate processing delay (200-800ms)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * 600) + 200)
    );

    // Simulate 90% success rate
    const isSuccess = Math.random() < 0.9;

    if (!isSuccess) {
      return res.status(402).json({
        success: false,
        message: 'Payment declined. Please try again or use a different payment method.',
      });
    }

    // Generate mock payment ID
    const paymentId = `PAY_${crypto.randomUUID()}`;

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId,
        amount: Math.round(amount * 100) / 100,
        status: 'completed',
        method: cardNumber ? `Card ending in ${String(cardNumber).slice(-4)}` : 'Mock Payment',
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment };
