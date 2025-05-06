/**
 * SuperAdmin Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const superAdminService = require('../../../services/super-admin.service');

class SuperAdminController extends BaseController {
    constructor() {
        super('user');
    }

    /**
     * Find all SuperAdmins
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async findSuperAdmins(req, res) {
        try {
            const superadmins = await superAdminService.findSuperAdmins(req.user.role);
            return this.sendSuccess(res, 'SuperAdmin accounts retrieved successfully', superadmins);
        } catch (error) {
            console.error('Find SuperAdmins error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve SuperAdmin accounts', error.statusCode);
        }
    }

    /**
     * Find all Admins
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async findAdmins(req, res) {
        try {
            const admins = await superAdminService.findAdmins(req.user.role);
            return this.sendSuccess(res, 'Admin accounts retrieved successfully', admins);
        } catch (error) {
            console.error('Find Admins error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve Admin accounts', error.statusCode);
        }
    }

    /**
     * Find all regular users
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async findUsers(req, res) {
        try {
            const users = await superAdminService.findUsers(req.user.role);
            return this.sendSuccess(res, 'User accounts retrieved successfully', users);
        } catch (error) {
            console.error('Find Users error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve user accounts', error.statusCode);
        }
    }

    /**
     * Create a new user account
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createAccount(req, res) {
        try {
            const { username, name, email, password, phoneNumber, dateOfBirth, role } = req.body;
            
            const userData = { 
                username, 
                name, 
                email, 
                password, 
                phoneNumber, 
                dateOfBirth, 
                role 
            };
            
            const newUser = await superAdminService.createAccount(userData, req.user.role);
            
            return this.sendSuccess(
                res,
                'User created successfully',
                newUser,
                201
            );
        } catch (error) {
            console.error('Create account error:', error);
            return this.sendError(res, error.message || 'Failed to create user account', error.statusCode);
        }
    }

    /**
     * Find user account by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async findAccountById(req, res) {
        try {
            const userId = req.params.id;
            const user = await superAdminService.findAccountById(userId, req.user.role);
            
            return this.sendSuccess(res, `Get user account by ID: ${userId}`, user);
        } catch (error) {
            console.error('Find account error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve user account', error.statusCode);
        }
    }

    /**
     * Update user account
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateAccount(req, res) {
        try {
            const userId = req.params.id;
            const { username, name, email, password, phoneNumber, dateOfBirth, role } = req.body;
            
            const updateData = {
                username,
                name,
                email,
                password,
                phoneNumber,
                dateOfBirth,
                role
            };
            
            const updatedUser = await superAdminService.updateAccount(userId, updateData, req.user.role);
            
            return this.sendSuccess(res, `User account with ID ${userId} updated successfully`, updatedUser);
        } catch (error) {
            console.error('Update account error:', error);
            return this.sendError(res, error.message || 'Failed to update user account', error.statusCode);
        }
    }

    /**
     * Delete user account
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteAccount(req, res) {
        try {
            const userId = req.params.id;
            await superAdminService.deleteAccount(userId, req.user.role);
            
            return this.sendSuccess(res, `User account with ID ${userId} deleted successfully`);
        } catch (error) {
            console.error('Delete account error:', error);
            return this.sendError(res, error.message || 'Failed to delete user account', error.statusCode);
        }
    }
    
    /**
     * Accept or reject a test
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async acceptTest(req, res) {
        try {
            const testId = req.params.testId;
            const { status } = req.body;
            
            const updatedTest = await superAdminService.acceptTest(testId, status, req.user.role);
            
            return this.sendSuccess(res, `Test status updated to ${status}`, updatedTest);
        } catch (error) {
            console.error('Accept test error:', error);
            return this.sendError(res, error.message || 'Failed to update test status', error.statusCode);
        }
    }
    
    /**
     * Delete a test and all related data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteTest(req, res) {
        try {
            const testId = req.params.testId;
            
            await superAdminService.deleteTest(testId, req.user.role);
            
            return this.sendSuccess(res, `Test with ID ${testId} and all related data deleted successfully`);
        } catch (error) {
            console.error('Delete test error:', error);
            return this.sendError(res, error.message || 'Failed to delete test', error.statusCode);
        }
    }
}

module.exports = new SuperAdminController();