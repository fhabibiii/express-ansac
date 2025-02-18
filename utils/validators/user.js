const { body } = require('express-validator');
const prisma = require('../../prisma/client');

const validateUpdateUser = [
    body('username')
        .optional({ checkFalsy: true })
        .custom(async (value, { req }) => {
            const user = await prisma.user.findUnique({ where: { username: value } });
            if (user && user.id !== Number(req.params.id)) {
                throw new Error('Username already exists');
            }
            return true;
        }),
    body('name').optional({ checkFalsy: true }),
    body('email')
        .optional({ checkFalsy: true })
        .isEmail().withMessage('Email is invalid')
        .custom(async (value, { req }) => {
            const user = await prisma.user.findUnique({ where: { email: value } });
            if (user && user.id !== Number(req.params.id)) {
                throw new Error('Email already exists');
            }
            return true;
        }),
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phoneNumber')
        .optional({ checkFalsy: true })
        .isLength({ max: 14 }).withMessage('Phone number must be at most 14 characters long')
        .custom(async (value, { req }) => {
            const user = await prisma.user.findUnique({ where: { phoneNumber: value } });
            if (user && user.id !== Number(req.params.id)) {
                throw new Error('Phone number already exists');
            }
            return true;
        }),
    body('role')
        .optional({ checkFalsy: true })
        .isIn(['USER_SELF', 'USER_PARENT']).withMessage('Role must be either USER_SELF or USER_PARENT'),
];

module.exports = {
    validateUpdateUser,
};