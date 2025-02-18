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
const { validateRegister, validateLogin } = require('../utils/validators/auth');

//import validate admin
const { validateAdmin, validateUpdateAdmin } = require('../utils/validators/admin');

//import validate user
const { validateUpdateUser } = require('../utils/validators/user');

//import validate test
const { validateCreateTest, validateCreateSubskala, validateCreateQuestion, validateSaveQuestionOrder, validateSubmitAnswers, validateGetTestResult } = require('../utils/validators/test');

//import auth middleware
const verifyToken = require('../middlewares/auth');

//define route for register
router.post('/register', validateRegister, registerController.register);

//define route for login
router.post('/login', validateLogin, loginController.login);

//define route for findSuperAdmins
router.get('/superadmin/account/superadmin', verifyToken, superAdminController.findSuperAdmins);

//define route for findAdmins
router.get('/superadmin/account/admin', verifyToken, superAdminController.findAdmins);

//define route for findUsers
router.get('/superadmin/account/user', verifyToken, superAdminController.findUsers);

//define route for create Account
router.post('/superadmin/account', verifyToken, validateAdmin, superAdminController.createAccount);

//define route for find Account by id
router.get('/superadmin/account/:id', verifyToken, superAdminController.findAccountById);

//define route for update Account
router.put('/superadmin/account/:id', verifyToken, validateUpdateAdmin, superAdminController.updateAccount);

//define route for delete Account
router.delete('/superadmin/account/:id', verifyToken, superAdminController.deleteAccount);

//define route for find user account by id
router.get('/user/account/:id', verifyToken, userController.findAccountById);

//define route for update user account
router.put('/user/account/:id', verifyToken, validateUpdateUser, userController.updateAccount);

//define route for delete user account
router.delete('/user/account/:id', verifyToken, userController.deleteAccount);

//define route for create test
router.post('/admin/test', verifyToken, validateCreateTest, testController.createTest);

//define route for create subskala
router.post('/admin/subskala', verifyToken, validateCreateSubskala, testController.createSubskala);

//define route for create question
router.post('/admin/question', verifyToken, validateCreateQuestion, testController.createQuestion);

//define route for save question order
router.post('/admin/question-order', verifyToken, validateSaveQuestionOrder, testController.saveQuestionOrder);

//define route for submit answers
router.post('/admin/submit-answers', verifyToken, validateSubmitAnswers, testController.submitAnswers);

//define route for get test result
router.get('/admin/test-result/:userId/:testId', verifyToken, validateGetTestResult, testController.getTestResult);

//export router
module.exports = router