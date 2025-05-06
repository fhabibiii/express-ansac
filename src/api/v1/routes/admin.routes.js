/**
 * Admin routes
 */
const express = require('express');
const router = express.Router();

// Import controllers
const superAdminController = require('../controllers/superAdmin.controller');
const testController = require('../controllers/test.controller');

// Import middleware
const { authenticate } = require('../../../shared/middlewares/auth.middleware');

// Import validators
const adminValidator = require('../validators/admin.validator');
const testValidator = require('../validators/test.validator');

// ===== Super Admin Account Management =====
router.get('/account/superadmin', authenticate, superAdminController.findSuperAdmins);
router.get('/account/admin', authenticate, superAdminController.findAdmins);
router.get('/account/user', authenticate, superAdminController.findUsers);
router.post('/account', authenticate, adminValidator.validateAdmin, superAdminController.createAccount);
router.get('/account/:id', authenticate, superAdminController.findAccountById);
router.put('/account/:id', authenticate, adminValidator.validateUpdateAdmin, superAdminController.updateAccount);
router.delete('/account/:id', authenticate, superAdminController.deleteAccount);

// ===== Super Admin Test Management =====
router.put('/test/:testId', authenticate, testValidator.validateAcceptTest, superAdminController.acceptTest);
router.delete('/test/:testId', authenticate, testValidator.validateDeleteTest, superAdminController.deleteTest);

// ===== Admin Test Management =====
// Test CRUD
router.post('/test', authenticate, testValidator.validateCreateTest, testController.createTest);
router.get('/test', authenticate, testController.getAllTest);
router.get('/test/:testId', authenticate, testValidator.validateGetTestById, testController.getTestById);
router.put('/test/:testId', authenticate, testValidator.validateEditTest, testController.editTest);

// Subskala CRUD
router.post('/subskala', authenticate, testValidator.validateCreateSubskala, testController.createSubskala);
router.get('/subskala/:testId', authenticate, testValidator.validateGetAllSubskalaByTestId, testController.getAllSubskalaByTestId);
router.put('/subskala/:subskalaId', authenticate, testValidator.validateEditSubskala, testController.editSubskala);

// Question CRUD
router.post('/question', authenticate, testValidator.validateCreateQuestion, testController.createQuestion);
router.get('/question/:subskalaId', authenticate, testValidator.validateGetAllQuestionBySubskalaId, testController.getAllQuestionBySubskalaId);
router.put('/question/:questionId', authenticate, testValidator.validateEditQuestion, testController.editQuestion);
router.post('/questionorder', authenticate, testValidator.validateSaveQuestionOrder, testController.saveQuestionOrder);

// Test Results
router.get('/test/results/:testId', authenticate, testValidator.validateGetAllTestResultByTestId, testController.getAllTestResultsByTestId);
router.get('/test/result/:testResultId', authenticate, testValidator.validateGetTestResultAdmin, testController.getTestResultAdmin);

module.exports = router;