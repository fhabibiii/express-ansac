/**
 * Test Routes
 * Defines all routes related to psychological tests
 */

const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const testValidator = require('../validators/test.validator');
const { authenticate } = require('../../../shared/middlewares/auth.middleware');
const { validate } = require('../../../shared/middlewares/validation.middleware');

/* ADMIN AND SUPERADMIN ROUTES */

// Create test
router.post(
  '/',
  authenticate,
  testValidator.validateCreateTest,
  validate,
  testController.createTest.bind(testController)
);

// Create subskala
router.post(
  '/subskala',
  authenticate,
  testValidator.validateCreateSubskala,
  validate,
  testController.createSubskala.bind(testController)
);

// Create question
router.post(
  '/question',
  authenticate,
  testValidator.validateCreateQuestion,
  validate,
  testController.createQuestion.bind(testController)
);

// Save question order
router.post(
  '/question-order',
  authenticate,
  testValidator.validateSaveQuestionOrder,
  validate,
  testController.saveQuestionOrder.bind(testController)
);

// Get all tests
router.get(
  '/',
  authenticate,
  testController.getAllTests.bind(testController)
);

// Get test by ID - tetap menggunakan :id tapi dengan validator validateTestId
router.get(
  '/:id',
  authenticate,
  testValidator.validateTestId,
  validate,
  testController.getTestById.bind(testController)
);

// Update test - tetap menggunakan :id tapi dengan validator validateUpdateTest
router.put(
  '/:id',
  authenticate,
  testValidator.validateUpdateTest,
  validate,
  testController.updateTest.bind(testController)
);

/* Perhatikan order route: endpoint dengan path spesifik harus berada sebelum endpoint dengan parameter dinamis */

// Get all subskala by test ID
router.get(
  '/subskala/by-test/:testId',
  authenticate,
  testValidator.validateTestId,
  validate,
  testController.getAllSubskalaByTestId.bind(testController)
);

// Get all questions by subskala ID
router.get(
  '/question/by-subskala/:subskalaId',
  authenticate,
  testValidator.validateSubskalaId,
  validate,
  testController.getAllQuestionBySubskalaId.bind(testController)
);

// Update subskala
router.put(
  '/subskala/:subskalaId',
  authenticate,
  testValidator.validateUpdateSubskala,
  validate,
  testController.updateSubskala.bind(testController)
);

// Update question
router.put(
  '/question/:questionId',
  authenticate,
  testValidator.validateUpdateQuestion,
  validate,
  testController.updateQuestion.bind(testController)
);

// Get all test results by test ID
router.get(
  '/results/by-test/:testId',
  authenticate,
  testValidator.validateTestId,
  validate,
  testController.getAllTestResultsByTestId.bind(testController)
);

// Get test result for admin
router.get(
  '/result/admin/:resultId',
  authenticate,
  testValidator.validateTestResultId,
  validate,
  testController.getTestResultForAdmin.bind(testController)
);

/* USER ROUTES */

// Get available tests for current user
router.get(
  '/available',
  authenticate,
  testController.getAvailableTests.bind(testController)
);

// Get test results for current user
router.get(
  '/results',
  authenticate,
  testController.getTestResults.bind(testController)
);

// Start a test
router.get(
  '/start/:testId',
  authenticate,
  testValidator.validateTestId,
  validate,
  testController.startTest.bind(testController)
);

// Submit test answers
router.post(
  '/submit',
  authenticate,
  testValidator.validateSubmitAnswers,
  validate,
  testController.submitTest.bind(testController)
);

// Get specific test result
router.get(
  '/result/:id',
  authenticate,
  testValidator.validateTestResultId,
  validate,
  testController.getTestResultById.bind(testController)
);

module.exports = router;