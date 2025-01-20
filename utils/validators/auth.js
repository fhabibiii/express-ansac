const { body } = require('express-validator');
const prisma = require('../../prisma/client');

const validateRegister = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { username: value } });
            if (user) {
                throw new Error('Username already exists');
            }
            return true;
        }),
    body('name').notEmpty().withMessage('Name is required'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email is invalid')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { email: value } });
            if (user) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phoneNumber')
        .notEmpty().withMessage('Phone number is required')
        .isLength({ max: 15 }).withMessage('Phone number must be at most 15 characters long')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { phoneNumber: value } });
            if (user) {
                throw new Error('Phone number already exists');
            }
            return true;
        }),
];

const validateLogin = [
    body('username')
        .notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

module.exports = {
    validateRegister,
    validateLogin,
};