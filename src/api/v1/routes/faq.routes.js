/**
 * FAQ Routes
 * Defines all routes related to FAQ management
 */

const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faq.controller');
const faqValidator = require('../validators/faq.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');

// Public routes (no authentication required)
router.get(
  '/public',
  faqController.getPublicFAQs.bind(faqController)
);

// Protected routes (authentication required)
// Create a new FAQ
router.post(
  '/',
  authenticate,
  faqValidator.validateCreateFAQ,
  validate,
  faqController.createFAQ.bind(faqController)
);

// Create a new FAQ answer
router.post(
  '/answer',
  authenticate,
  faqValidator.validateCreateFAQAnswer,
  validate,
  faqController.createFAQAnswer.bind(faqController)
);

// Get all FAQs (Admin and SuperAdmin only)
router.get(
  '/',
  authenticate,
  faqController.getAllFAQs.bind(faqController)
);

// Get all answers for a specific FAQ
router.get(
  '/:faqId/answers',
  authenticate,
  faqValidator.validateFAQId,
  validate,
  faqController.getAllFAQAnswers.bind(faqController)
);

// Get all pending FAQs (Admin and SuperAdmin only)
router.get(
  '/pending',
  authenticate,
  faqController.getAllPendingFAQs.bind(faqController)
);

// Get FAQ by ID
router.get(
  '/:id',
  authenticate,
  faqValidator.validateFAQId,
  validate,
  faqController.getFAQById.bind(faqController)
);

// Update FAQ
router.put(
  '/:id',
  authenticate,
  faqValidator.validateUpdateFAQ,
  validate,
  faqController.updateFAQ.bind(faqController)
);

// Update FAQ answer
router.put(
  '/answer/:id',
  authenticate,
  faqValidator.validateUpdateFAQAnswer,
  validate,
  faqController.updateFAQAnswer.bind(faqController)
);

// Delete FAQ
router.delete(
  '/:id',
  authenticate,
  faqValidator.validateFAQId,
  validate,
  faqController.deleteFAQ.bind(faqController)
);

// Delete FAQ answer
router.delete(
  '/answer/:id',
  authenticate,
  faqValidator.validateAnswerId,
  validate,
  faqController.deleteFAQAnswer.bind(faqController)
);

// Change FAQ status (SuperAdmin only)
router.put(
  '/:id/status',
  authenticate,
  faqValidator.validateChangeFAQStatus,
  validate,
  faqController.changeFAQStatus.bind(faqController)
);

// Update FAQ order
router.put(
  '/order',
  authenticate,
  faqValidator.validateUpdateFAQOrder,
  validate,
  faqController.updateFAQOrder.bind(faqController)
);

// Update FAQ answer order
router.put(
  '/:faqId/answer-order',
  authenticate,
  faqValidator.validateUpdateFAQAnswerOrder,
  validate,
  faqController.updateFAQAnswerOrder.bind(faqController)
);

module.exports = router;