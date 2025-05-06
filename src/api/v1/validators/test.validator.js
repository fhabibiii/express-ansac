/**
 * Test Validators
 * Validation rules for test-related endpoints
 */

const { body, param } = require('express-validator');

// Validate create test input
const validateCreateTest = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('shortDesc')
    .notEmpty().withMessage('Short description is required')
    .isString().withMessage('Short description must be a string')
    .isLength({ max: 200 }).withMessage('Short description cannot exceed 200 characters'),
  
  body('longDesc')
    .notEmpty().withMessage('Long description is required')
    .isString().withMessage('Long description must be a string'),
  
  body('minAge')
    .notEmpty().withMessage('Minimum age is required')
    .isInt({ min: 1, max: 100 }).withMessage('Minimum age must be between 1 and 100'),
  
  body('maxAge')
    .notEmpty().withMessage('Maximum age is required')
    .isInt({ min: 1, max: 100 }).withMessage('Maximum age must be between 1 and 100')
    .custom((value, { req }) => {
      if (value < req.body.minAge) {
        throw new Error('Maximum age must be greater than or equal to minimum age');
      }
      return true;
    }),
  
  body('target')
    .notEmpty().withMessage('Target is required')
    .isIn(['SELF', 'PARENT']).withMessage('Target must be either SELF or PARENT')
];

// Validate create subskala input
const validateCreateSubskala = [
  body('testId')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer'),
  
  body('name')
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('description1')
    .notEmpty().withMessage('Description 1 is required')
    .isString().withMessage('Description 1 must be a string'),
  
  body('minValue1')
    .notEmpty().withMessage('Min value 1 is required')
    .isInt({ min: 0 }).withMessage('Min value 1 must be a non-negative integer'),
  
  body('maxValue1')
    .notEmpty().withMessage('Max value 1 is required')
    .isInt({ min: 0 }).withMessage('Max value 1 must be a non-negative integer')
    .custom((value, { req }) => {
      if (value < req.body.minValue1) {
        throw new Error('Max value 1 must be greater than or equal to min value 1');
      }
      return true;
    }),
  
  body('description2')
    .notEmpty().withMessage('Description 2 is required')
    .isString().withMessage('Description 2 must be a string'),
  
  body('minValue2')
    .notEmpty().withMessage('Min value 2 is required')
    .isInt({ min: 0 }).withMessage('Min value 2 must be a non-negative integer')
    .custom((value, { req }) => {
      if (value <= req.body.maxValue1) {
        throw new Error('Min value 2 must be greater than max value 1');
      }
      return true;
    }),
  
  body('maxValue2')
    .notEmpty().withMessage('Max value 2 is required')
    .isInt({ min: 0 }).withMessage('Max value 2 must be a non-negative integer')
    .custom((value, { req }) => {
      if (value < req.body.minValue2) {
        throw new Error('Max value 2 must be greater than or equal to min value 2');
      }
      return true;
    }),
  
  body('description3')
    .notEmpty().withMessage('Description 3 is required')
    .isString().withMessage('Description 3 must be a string'),
  
  body('minValue3')
    .notEmpty().withMessage('Min value 3 is required')
    .isInt({ min: 0 }).withMessage('Min value 3 must be a non-negative integer')
    .custom((value, { req }) => {
      if (value <= req.body.maxValue2) {
        throw new Error('Min value 3 must be greater than max value 2');
      }
      return true;
    }),
  
  body('maxValue3')
    .notEmpty().withMessage('Max value 3 is required')
    .isInt({ min: 0 }).withMessage('Max value 3 must be a non-negative integer')
    .custom((value, { req }) => {
      if (value < req.body.minValue3) {
        throw new Error('Max value 3 must be greater than or equal to min value 3');
      }
      return true;
    })
];

// Validate create question input
const validateCreateQuestion = [
  body('subskalaId')
    .notEmpty().withMessage('Subskala ID is required')
    .isInt({ min: 1 }).withMessage('Subskala ID must be a positive integer'),
  
  body('text')
    .notEmpty().withMessage('Question text is required')
    .isString().withMessage('Question text must be a string')
    .isLength({ min: 5 }).withMessage('Question text must be at least 5 characters'),
  
  body('option1Value')
    .notEmpty().withMessage('Option 1 value is required')
    .isInt().withMessage('Option 1 value must be an integer'),
  
  body('option2Value')
    .notEmpty().withMessage('Option 2 value is required')
    .isInt().withMessage('Option 2 value must be an integer'),
  
  body('option3Value')
    .notEmpty().withMessage('Option 3 value is required')
    .isInt().withMessage('Option 3 value must be an integer')
];

// Validate save question order input
const validateSaveQuestionOrder = [
  body('testId')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer')
];

// Validate test ID parameter
const validateTestId = [
  param('id')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer')
];

// Validate subskala ID parameter
const validateSubskalaId = [
  param('subskalaId')
    .notEmpty().withMessage('Subskala ID is required')
    .isInt({ min: 1 }).withMessage('Subskala ID must be a positive integer')
];

// Validate question ID parameter
const validateQuestionId = [
  param('questionId')
    .notEmpty().withMessage('Question ID is required')
    .isInt({ min: 1 }).withMessage('Question ID must be a positive integer')
];

// Validate test result ID parameter
const validateTestResultId = [
  param('id')
    .notEmpty().withMessage('Test result ID is required')
    .isInt({ min: 1 }).withMessage('Test result ID must be a positive integer')
];

// Validate update test input
const validateUpdateTest = [
  param('testId')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer'),
  
  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
  
  body('shortDesc')
    .optional()
    .isString().withMessage('Short description must be a string')
    .isLength({ max: 200 }).withMessage('Short description cannot exceed 200 characters'),
  
  body('longDesc')
    .optional()
    .isString().withMessage('Long description must be a string'),
  
  body('minAge')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Minimum age must be between 1 and 100'),
  
  body('maxAge')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Maximum age must be between 1 and 100')
    .custom((value, { req }) => {
      if (req.body.minAge && value < req.body.minAge) {
        throw new Error('Maximum age must be greater than or equal to minimum age');
      }
      return true;
    }),
  
  body('target')
    .optional()
    .isIn(['SELF', 'PARENT']).withMessage('Target must be either SELF or PARENT')
];

// Validate update subskala input
const validateUpdateSubskala = [
  param('subskalaId')
    .notEmpty().withMessage('Subskala ID is required')
    .isInt({ min: 1 }).withMessage('Subskala ID must be a positive integer'),
  
  body('name')
    .optional()
    .isString().withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('description1').optional().isString().withMessage('Description 1 must be a string'),
  body('minValue1').optional().isInt({ min: 0 }).withMessage('Min value 1 must be a non-negative integer'),
  body('maxValue1').optional().isInt({ min: 0 }).withMessage('Max value 1 must be a non-negative integer'),
  body('description2').optional().isString().withMessage('Description 2 must be a string'),
  body('minValue2').optional().isInt({ min: 0 }).withMessage('Min value 2 must be a non-negative integer'),
  body('maxValue2').optional().isInt({ min: 0 }).withMessage('Max value 2 must be a non-negative integer'),
  body('description3').optional().isString().withMessage('Description 3 must be a string'),
  body('minValue3').optional().isInt({ min: 0 }).withMessage('Min value 3 must be a non-negative integer'),
  body('maxValue3').optional().isInt({ min: 0 }).withMessage('Max value 3 must be a non-negative integer')
];

// Validate update question input
const validateUpdateQuestion = [
  param('questionId')
    .notEmpty().withMessage('Question ID is required')
    .isInt({ min: 1 }).withMessage('Question ID must be a positive integer'),
  
  body('text')
    .optional()
    .isString().withMessage('Question text must be a string')
    .isLength({ min: 5 }).withMessage('Question text must be at least 5 characters'),
  
  body('option1Value')
    .optional()
    .isInt().withMessage('Option 1 value must be an integer'),
  
  body('option2Value')
    .optional()
    .isInt().withMessage('Option 2 value must be an integer'),
  
  body('option3Value')
    .optional()
    .isInt().withMessage('Option 3 value must be an integer')
];

// Validate submit answers input
const validateSubmitAnswers = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  
  body('testId')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer'),
  
  body('answers')
    .notEmpty().withMessage('Answers are required')
    .isArray().withMessage('Answers must be an array')
    .custom(answers => {
      if (!answers.every(a => a.questionId && a.value !== undefined)) {
        throw new Error('Each answer must have questionId and value properties');
      }
      return true;
    })
];

// Validate user ID parameter
const validateUserId = [
  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer')
];

// Validate user test result input
const validateUserTestResult = [
  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  
  param('testResultId')
    .notEmpty().withMessage('Test result ID is required')
    .isInt({ min: 1 }).withMessage('Test result ID must be a positive integer')
];

// Validate user test input
const validateUserTest = [
  param('userId')
    .notEmpty().withMessage('User ID is required')
    .isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  
  param('testId')
    .notEmpty().withMessage('Test ID is required')
    .isInt({ min: 1 }).withMessage('Test ID must be a positive integer')
];

module.exports = {
  validateCreateTest,
  validateCreateSubskala,
  validateCreateQuestion,
  validateSaveQuestionOrder,
  validateTestId,
  validateSubskalaId,
  validateQuestionId,
  validateTestResultId,
  validateUpdateTest,
  validateUpdateSubskala,
  validateUpdateQuestion,
  validateSubmitAnswers,
  validateUserId,
  validateUserTestResult,
  validateUserTest
};