//import express
const express = require('express')

//init express router
const router = express.Router();

//import register controller
const registerController = require('../controllers/RegisterController');

//import login controller
const loginController = require('../controllers/LoginController');

//import admin controller
const superAdminController = require('../controllers/SuperAdminController');

//import user controller
const userController = require('../controllers/UserController');

//import test controller
const testController = require('../controllers/TestController');

//import validate register & login
const authValidators = require('../utils/validators/auth');

//import validate admin
const adminValidators = require('../utils/validators/admin');

//import validate user
const userValidators = require('../utils/validators/user');

//import validate test
const testValidators = require('../utils/validators/test');

//import auth middleware
const verifyToken = require('../middlewares/auth');

// LOGIN & REGISTER

//define route for register
router.post('/register', authValidators.validateRegister, registerController.register);

//define route for login
router.post('/login', authValidators.validateLogin, loginController.login);

// SUPERADMIN

//define route for findSuperAdmins
router.get('/superadmin/account/superadmin', verifyToken, superAdminController.findSuperAdmins);

//define route for findAdmins
router.get('/superadmin/account/admin', verifyToken, superAdminController.findAdmins);

//define route for findUsers
router.get('/superadmin/account/user', verifyToken, superAdminController.findUsers);

//define route for create Account
router.post('/superadmin/account', verifyToken, adminValidators.validateAdmin, superAdminController.createAccount);

//define route for find Account by id
router.get('/superadmin/account/:id', verifyToken, superAdminController.findAccountById);

//define route for update Account
router.put('/superadmin/account/:id', verifyToken, adminValidators.validateUpdateAdmin, superAdminController.updateAccount);

//define route for delete Account
router.delete('/superadmin/account/:id', verifyToken, superAdminController.deleteAccount);

//define route for accept test
router.put('/superadmin/test/:testId', verifyToken, testValidators.validateAcceptTest, superAdminController.acceptTest);

//define route for delete test
router.delete('/superadmin/test/:testId', verifyToken, testValidators.validateDeleteTest, superAdminController.deleteTest);

// USER

//define route for find user account by id
router.get('/user/account/:id', verifyToken, userController.findAccountById);

//define route for update user account
router.put('/user/account/:id', verifyToken, userValidators.validateUpdateUser, userController.updateAccount);

//define route for delete user account
router.delete('/user/account/:id', verifyToken, userController.deleteAccount);

// ADMIN

//define route for create test
router.post('/admin/test', verifyToken, testValidators.validateCreateTest, testController.createTest);

//define route for create subskala
router.post('/admin/subskala', verifyToken, testValidators.validateCreateSubskala, testController.createSubskala);

//define route for create question
router.post('/admin/question', verifyToken, testValidators.validateCreateQuestion, testController.createQuestion);

//define route for save question order
router.post('/admin/questionorder', verifyToken, testValidators.validateSaveQuestionOrder, testController.saveQuestionOrder);

//define route for get all test
router.get('/admin/test', verifyToken, testController.getAllTest);

//define route for get test by id
router.get('/admin/test/:testId', verifyToken, testValidators.validateGetTestById, testController.getTestById);

//define route for get all subskala by testId
router.get('/admin/subskala/:testId', verifyToken, testValidators.validateGetAllSubskalaByTestId, testController.getAllSubskalaByTestId);

//define route for get all question by subskalaId
router.get('/admin/question/:subskalaId', verifyToken, testValidators.validateGetAllQuestionBySubskalaId, testController.getAllQuestionBySubskalaId);

//define route for edit test
router.put('/admin/test/:testId', verifyToken, testValidators.validateEditTest, testController.editTest);

//define route for edit subskala
router.put('/admin/subskala/:subskalaId', verifyToken, testValidators.validateEditSubskala, testController.editSubskala);

//define route for edit question
router.put('/admin/question/:questionId', verifyToken, testValidators.validateEditQuestion, testController.editQuestion);

//define route for get all test results
router.get('/admin/test/result', verifyToken, testController.getAllUserTestResults);

//define route for get test result by testResultId
router.get('/admin/test/result/:testResultId', verifyToken, testValidators.validateGetTestResultAdmin, testController.getTestResultAdmin);

// TEST

//define route for get all test results by userId
router.get('/test/result/:userId', verifyToken, testValidators.validateGetAllTestResult, testController.getAllTestResults);

//define route for get test result by userId and testResultId
router.get('/test/result/:userId/:testResultId', verifyToken, testValidators.validateGetTestResult, testController.getTestResultbyId);

//define route for get test by user age
router.get('/test/:userId', verifyToken, testController.getAllTestByAge);

//define route for start test
router.get('/test/:userId/:testId', verifyToken, testController.startTest);

//define route for submit answers
router.post('/test/submit', verifyToken, testValidators.validateSubmitAnswers, testController.submitAnswers);

//export router
module.exports = router