const { body } = require('express-validator');
const prisma = require('../../prisma/client');

const validateAdmin = [
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
        .isIn(['USER_SELF', 'USER_PARENT', 'ADMIN', 'SUPERADMIN']).withMessage('Invalid role'),
];

const validateUpdateAdmin = [
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
        .isIn(['USER_SELF', 'USER_PARENT', 'ADMIN', 'SUPERADMIN']).withMessage('Invalid role'),
];

module.exports = {
    validateAdmin,
    validateUpdateAdmin,
};