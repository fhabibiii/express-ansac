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

//import blog controller
const blogController = require('../controllers/BlogController');

//import gallery controller
const galleryController = require('../controllers/GalleryController');

//import validate register & login
const authValidators = require('../utils/validators/auth');

//import validate admin
const adminValidators = require('../utils/validators/admin');

//import validate user
const userValidators = require('../utils/validators/user');

//import validate test
const testValidators = require('../utils/validators/test');

//import validate blog
const blogValidators = require('../utils/validators/blog');

//import auth middleware
const verifyToken = require('../middlewares/auth');

//import validate check password
const { validateCheckPassword } = require('../utils/validators/user');

//import file upload middleware
const upload = require('../middlewares/fileUpload');

// Add this with your other imports
const galleryValidators = require('../utils/validators/gallery');

// Import FAQ validators
const faqValidators = require('../utils/validators/faq');

// Import FAQ controller
const faqController = require('../controllers/FAQController');

// Add to your routes/index.js file
const serviceController = require('../controllers/ServiceController');
const serviceValidators = require('../utils/validators/service');

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

//define route for check password
router.post('/check-password', verifyToken, validateCheckPassword, userController.checkPassword);

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

//define route for get all test results by testId
router.get('/admin/test/results/:testId', verifyToken, testValidators.validateGetAllTestResultByTestId, testController.getAllTestResultsByTestId);

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

// BLOG ROUTES
// Image upload route
router.post(
    '/blog/upload-image', 
    verifyToken, 
    ...upload.single('image'), // Spread the array of middleware
    blogController.uploadImage
);

// Blog CRUD operations
router.post('/blog', verifyToken, blogValidators.validateCreateBlog, blogController.createBlog);
router.get('/blog/admin', verifyToken, blogController.getAllBlogs);
router.get('/blog/user', verifyToken, blogController.getUserBlogs);
router.get('/blog/public', blogController.getPublicBlogs);
router.get('/blog/pending', verifyToken, blogController.getAllPendingBlogs); // Move this BEFORE the /:id route
router.get('/blog/:id', verifyToken, blogValidators.validateBlogId, blogController.getBlogById);
router.put('/blog/:id', verifyToken, blogValidators.validateUpdateBlog, blogController.updateBlog);
router.delete('/blog/:id', verifyToken, blogValidators.validateBlogId, blogController.deleteBlog);
router.put('/blog/:id/status', verifyToken, blogValidators.validateChangeBlogStatus, blogController.changeBlogStatus);

// GALLERY ROUTES
// Image upload route
router.post(
    '/gallery/upload-image', 
    verifyToken, 
    ...upload.single('image'), // Reuse the same upload middleware
    galleryValidators.validateUploadImage,
    galleryController.uploadImage
);

// Gallery CRUD operations
router.post('/gallery', verifyToken, galleryValidators.validateCreateGallery, galleryController.createGallery);
router.get('/gallery/admin', verifyToken, galleryController.getAllGallerys);
router.get('/gallery/user', verifyToken, galleryController.getUserGallerys);
router.get('/gallery/public', galleryController.getPublicGallerys);
router.get('/gallery/pending', verifyToken, galleryController.getAllPendingGallerys); 
router.get('/gallery/:id', verifyToken, galleryValidators.validateGalleryId, galleryController.getGalleryById);
router.put('/gallery/:id', verifyToken, galleryValidators.validateUpdateGallery, galleryController.updateGallery);
router.delete('/gallery/:id', verifyToken, galleryValidators.validateGalleryId, galleryController.deleteGallery);
router.put('/gallery/:id/status', verifyToken, galleryValidators.validateChangeGalleryStatus, galleryController.changeGalleryStatus);

// Gallery image operations
router.put('/gallery/:galleryId/thumbnail/:imageId', verifyToken, galleryValidators.validateGalleryImageIds, galleryController.setThumbnail);
router.delete('/gallery/:galleryId/image/:imageId', verifyToken, galleryValidators.validateGalleryImageIds, galleryController.deleteImage);

// FAQ routes with fixes
router.post('/faq', verifyToken, faqValidators.validateCreateFAQ, faqController.createFAQ);
router.post('/faq/answer', verifyToken, faqValidators.validateCreateFAQAnswer, faqController.createFAQAnswer);
router.get('/faq-public', faqController.getPublicFAQs); // Changed route to avoid conflicts
router.get('/faq/admin', verifyToken, faqController.getAllFAQ);
router.get('/faq/answer/:faqId', verifyToken, faqValidators.validateFAQId, faqController.getAllFAQAnswer);
router.get('/faq/pending', verifyToken, faqController.getAllPendingFAQ);
router.get('/faq/:id', verifyToken, faqValidators.validateFAQId, faqController.getFAQById);
router.put('/faq/:id', verifyToken, faqValidators.validateUpdateFAQ, faqController.updateFAQ);
router.put('/faq/answer/:id', verifyToken, faqValidators.validateUpdateFAQAnswer, faqController.updateFAQAnswer);
router.delete('/faq/:id', verifyToken, faqValidators.validateFAQId, faqController.deleteFAQ);
router.delete('/faq/answer/:id', verifyToken, faqValidators.validateFAQAnswerId, faqController.deleteFAQAnswer);
router.put('/faq/:id/status', verifyToken, faqValidators.validateChangeFAQStatus, faqController.changeFAQStatus);
router.put('/faq-order', verifyToken, faqValidators.validateUpdateFAQOrder, faqController.updateFAQOrder); // Changed route to avoid conflicts
router.put('/faq/answer/order/:faqId', verifyToken, faqValidators.validateUpdateFAQAnswerOrder, faqController.updateFAQAnswerOrder);

// SERVICE ROUTES
// Image upload route
router.post(
    '/service/upload-image', 
    verifyToken, 
    upload.single('image'), // Using the same upload middleware
    serviceController.uploadImage
);

// Service CRUD operations
router.post('/service', verifyToken, serviceValidators.validateCreateService, serviceController.createService);
router.get('/service/admin', verifyToken, serviceController.getAllServices);
router.get('/service/pending', verifyToken, serviceController.getAllPendingAndRejectServices);
router.get('/service-public', serviceController.getPublicServices); // Public endpoint without auth
router.get('/service/:id', verifyToken, serviceValidators.validateServiceId, serviceController.getServiceById);
router.put('/service/:id', verifyToken, serviceValidators.validateUpdateService, serviceController.updateService);
router.delete('/service/:id', verifyToken, serviceValidators.validateServiceId, serviceController.deleteService);
router.put('/service/:id/status', verifyToken, serviceValidators.validateChangeServiceStatus, serviceController.changeServiceStatus);

//export router
module.exports = router