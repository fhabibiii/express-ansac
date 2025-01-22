const { body } = require('express-validator');
const prisma = require('../../prisma/client');

const validateUpdateUser = [
    body('username')
        .optional()
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { username: value } });
            if (user) {
                throw new Error('Username already exists');
            }
            return true;
        }),
    body('name').optional(),
    body('email')
        .optional()
        .isEmail().withMessage('Email is invalid')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { email: value } });
            if (user) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phoneNumber')
        .optional()
        .isLength({ max: 15 }).withMessage('Phone number must be at most 15 characters long')
        .custom(async (value) => {
            const user = await prisma.user.findUnique({ where: { phoneNumber: value } });
            if (user) {
                throw new Error('Phone number already exists');
            }
            return true;
        }),
    body('role')
        .custom((value) => {
            if (value) {
                throw new Error('User does not have access to choose role');
            }
            return true;
        }),
];

module.exports = {
    validateUpdateUser,
};