const { body, param } = require('express-validator');
const prisma = require('../../prisma/client');

const validateCreateTest = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isString().withMessage('Title must be a string'),
    body('shortDesc')
        .notEmpty().withMessage('Short description is required')
        .isString().withMessage('Short description must be a string')
        .isLength({ max: 100 }).withMessage('Short description must be at most 100 characters long'),
    body('longDesc')
        .notEmpty().withMessage('Long description is required')
        .isString().withMessage('Long description must be a string'),
    body('minAge')
        .notEmpty().withMessage('Minimum age is required')
        .isInt({ min: 0 }).withMessage('Minimum age must be a positive integer')
        .toInt(),
    body('maxAge')
        .notEmpty().withMessage('Maximum age is required')
        .isInt({ min: 0 }).withMessage('Maximum age must be a positive integer')
        .toInt()
        .custom((value, { req }) => {
            if (value < req.body.minAge) {
                throw new Error('Maximum age must be greater than or equal to minimum age');
            }
            return true;
        }),
    body('target')
        .notEmpty().withMessage('Target is required')
        .isString().withMessage('Target must be a string')
        .isIn(['SELF', 'PARENT']).withMessage('Target must be either SELF or PARENT'),
    body('status')
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Status should not be provided');
            }
            return true;
        }),
];

const validateCreateSubskala = [
    body('testId')
        .notEmpty().withMessage('Test ID is required')
        .isInt().withMessage('Test ID must be an integer')
        .toInt(),
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('description1')
        .notEmpty().withMessage('Description1 is required')
        .isString().withMessage('Description1 must be a string'),
    body('minValue1')
        .notEmpty().withMessage('MinValue1 is required')
        .isInt().withMessage('MinValue1 must be an integer')
        .toInt(),
    body('maxValue1')
        .notEmpty().withMessage('MaxValue1 is required')
        .isInt().withMessage('MaxValue1 must be an integer')
        .toInt(),
    body('description2')
        .notEmpty().withMessage('Description2 is required')
        .isString().withMessage('Description2 must be a string'),
    body('minValue2')
        .notEmpty().withMessage('MinValue2 is required')
        .isInt().withMessage('MinValue2 must be an integer')
        .toInt(),
    body('maxValue2')
        .notEmpty().withMessage('MaxValue2 is required')
        .isInt().withMessage('MaxValue2 must be an integer')
        .toInt(),
    body('description3')
        .notEmpty().withMessage('Description3 is required')
        .isString().withMessage('Description3 must be a string'),
    body('minValue3')
        .notEmpty().withMessage('MinValue3 is required')
        .isInt().withMessage('MinValue3 must be an integer')
        .toInt(),
    body('maxValue3')
        .notEmpty().withMessage('MaxValue3 is required')
        .isInt().withMessage('MaxValue3 must be an integer')
        .toInt(),
    body('label1')
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Label1 should not be provided');
            }
            return true;
        }),
    body('label2')
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Label2 should not be provided');
            }
            return true;
        }),
    body('label3')
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Label3 should not be provided');
            }
            return true;
        }),
];

const validateCreateQuestion = [
    body('subskalaId')
        .notEmpty().withMessage('Subskala ID is required')
        .isInt().withMessage('Subskala ID must be an integer')
        .toInt(),
    body('text')
        .notEmpty().withMessage('Text is required')
        .isString().withMessage('Text must be a string'),
    body('option1Value')
        .notEmpty().withMessage('Option1Value is required')
        .isInt().withMessage('Option1Value must be an integer')
        .toInt(),
    body('option2Value')
        .notEmpty().withMessage('Option2Value is required')
        .isInt().withMessage('Option2Value must be an integer')
        .toInt(),
    body('option3Value')
        .notEmpty().withMessage('Option3Value is required')
        .isInt().withMessage('Option3Value must be an integer')
        .toInt(),
    body('option1Label')
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Option1Label should not be provided');
            }
            return true;
        }),
    body('option2Label')
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Option2Label should not be provided');
            }
            return true;
        }),
    body('option3Label')
        .custom((value) => {
            if (value !== undefined) {
                throw new Error('Option3Label should not be provided');
            }
            return true;
        }),
];

const validateSaveQuestionOrder = [
    body('testId')
        .notEmpty().withMessage('Test ID is required')
        .isInt().withMessage('Test ID must be an integer')
        .toInt(),
];

const validateSubmitAnswers = [
    body('userId')
        .notEmpty().withMessage('User ID is required')
        .isInt().withMessage('User ID must be an integer')
        .toInt(),
    body('testId')
        .notEmpty().withMessage('Test ID is required')
        .isInt().withMessage('Test ID must be an integer')
        .toInt(),
    body('answers')
        .isArray({ min: 1 }).withMessage('Answers must be an array with at least one element'),
    body('answers.*.questionId')
        .notEmpty().withMessage('Question ID is required')
        .isInt().withMessage('Question ID must be an integer')
        .toInt(),
    body('answers.*.value')
        .notEmpty().withMessage('Value is required')
        .isInt().withMessage('Value must be an integer')
        .toInt()
        .isIn([0, 1, 2]).withMessage('Value must be 0, 1, or 2'),
];

const validateGetTestResult = [
    param('userId')
        .notEmpty().withMessage('User ID is required')
        .isInt().withMessage('User ID must be an integer')
        .toInt(),
    param('testResultId')
        .notEmpty().withMessage('Test Result ID is required')
        .isInt().withMessage('Test Result ID must be an integer')
        .toInt(),
];

const validateGetAllTestResult = [
    param('userId')
        .notEmpty().withMessage('User ID is required')
        .isInt().withMessage('User ID must be an integer')
        .toInt(),
];

const validateAcceptTest = [
    param('testId')
        .notEmpty().withMessage('Test ID is required')
        .isInt().withMessage('Test ID must be an integer')
        .toInt(),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isString().withMessage('Status must be a string')
        .isIn(['APPROVED', 'REJECTED']).withMessage('Status must be either APPROVED or REJECTED'),
];

module.exports = {
    validateCreateTest,
    validateCreateSubskala,
    validateCreateQuestion,
    validateSaveQuestionOrder,
    validateSubmitAnswers,
    validateGetTestResult,
    validateGetAllTestResult,
    validateAcceptTest,
};