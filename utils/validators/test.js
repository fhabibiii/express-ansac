const { body } = require('express-validator');
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
];

module.exports = {
    validateCreateTest,
};