const { body } = require('express-validator');
const prisma = require('../../prisma/client');

const validateRegister = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isString().withMessage('Username must be a string')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { username: value } });
            if (user) {
                throw new Error('Username already exists');
            }
            return true;
        }),
    body('name')
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email is invalid')
        .isString().withMessage('Email must be a string')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { email: value } });
            if (user) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phoneNumber')
        .notEmpty().withMessage('Phone number is required')
        .isString().withMessage('Phone number must be a string')
        .isLength({ max: 14 }).withMessage('Phone number must be at most 14 characters long')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { phoneNumber: value } });
            if (user) {
                throw new Error('Phone number already exists');
            }
            return true;
        }),
    body('role')
        .notEmpty().withMessage('Role is required')
        .isString().withMessage('Role must be a string')
        .isIn(['USER_SELF', 'USER_PARENT']).withMessage('Role must be either USER_SELF or USER_PARENT'),
];

const validateLogin = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isString().withMessage('Username must be a string'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .isString().withMessage('Password must be a string'),
];

module.exports = {
    validateRegister,
    validateLogin,
};