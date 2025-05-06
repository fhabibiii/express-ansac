/**
 * User Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const userService = require('../../../services/user.service');

class UserController extends BaseController {
    constructor() {
        super('user');
    }

    /**
     * Find account by ID (user's own account)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async findAccountById(req, res) {
        try {
            // UUID dari parameter request
            const uuid = req.params.id;
            
            // Check if the requested UUID matches the authenticated user's UUID
            if (uuid !== req.user.id) {
                return this.forbidden(res, 'Access denied');
            }
            
            // Menggunakan internal user ID untuk query database
            const account = await userService.getProfileByUuid(uuid);
            return this.success(res, account, `Account retrieved successfully`);
        } catch (error) {
            error.context = {
                action: 'find_account_by_id'
            };
            return this.handleError(res, error);
        }
    }

    /**
     * Update user's own account
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateAccount(req, res) {
        try {
            // UUID dari parameter request
            const uuid = req.params.id;
            
            // Check if the requested UUID matches the authenticated user's UUID
            if (uuid !== req.user.id) {
                return this.forbidden(res, 'Access denied');
            }
            
            const { name, phoneNumber, dateOfBirth, address, username, email, role } = req.body;
            
            const updateData = {
                name,
                phoneNumber,
                dateOfBirth,
                address,
                username,
                email,
                role
            };
            
            // Menggunakan UUID untuk update
            const updatedUser = await userService.updateProfileByUuid(uuid, updateData);
            
            return this.success(res, updatedUser, `Account updated successfully`);
        } catch (error) {
            error.context = {
                action: 'update_account'
            };
            return this.handleError(res, error);
        }
    }

    /**
     * Delete user's own account
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteAccount(req, res) {
        try {
            // UUID dari parameter request
            const uuid = req.params.id;
            
            // Check if the requested UUID matches the authenticated user's UUID
            if (uuid !== req.user.id) {
                return this.forbidden(res, 'Access denied');
            }
            
            // Menggunakan internal user ID untuk menghapus profil
            await userService.deleteProfileByUuid(uuid);
            
            return this.success(res, null, `Account deleted successfully`);
        } catch (error) {
            error.context = {
                action: 'delete_account'
            };
            return this.handleError(res, error);
        }
    }

    /**
     * Check if the provided password matches the user's current password
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async checkPassword(req, res) {
        try {
            const { oldPassword } = req.body;
            
            // Menggunakan internal ID dari req.user yang disediakan oleh middleware auth
            const internalUserId = req.user.internalId;
            
            const isValid = await userService.verifyPassword(internalUserId, oldPassword);
            
            return this.success(res, { isValid }, 'Password verification complete');
        } catch (error) {
            error.context = {
                action: 'check_password'
            };
            return this.handleError(res, error);
        }
    }

    /**
     * Change user's password
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            
            // Menggunakan internal ID dari req.user yang disediakan oleh middleware auth
            const internalUserId = req.user.internalId;
            
            await userService.changePassword(internalUserId, oldPassword, newPassword);
            
            return this.success(res, null, 'Password changed successfully');
        } catch (error) {
            error.context = {
                action: 'change_password'
            };
            return this.handleError(res, error);
        }
    }
}

module.exports = new UserController();