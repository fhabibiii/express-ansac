/**
 * Authentication Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const authService = require('../../../services/auth.service');

class AuthController extends BaseController {
    constructor() {
        super('auth');
    }

    /**
     * Register a new user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async register(req, res) {
        try {
            const { username, name, email, password, phoneNumber, dateOfBirth, role, address } = req.body;
            
            const userData = {
                username,
                name,
                email,
                password,
                phoneNumber,
                dateOfBirth,
                role,
                address
            };
            
            const user = await authService.register(userData);
            
            return this.created(
                res, 
                user,
                'Register successfully, please login with your credentials'
            );
        } catch (error) {
            // Menambahkan konteks tambahan ke error untuk logging di BaseController
            error.context = {
                username: req.body.username,
                email: req.body.email,
                action: 'user_registration'
            };
            
            return this.handleError(res, error);
        }
    }

    /**
     * User login
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            const loginData = await authService.login(username, password);
            
            return this.success(res, loginData, 'Login successful');
        } catch (error) {
            // Menambahkan konteks tambahan ke error untuk logging di BaseController
            error.context = {
                username: req.body.username,
                action: 'user_login'
            };
            
            return this.handleError(res, error);
        }
    }

    /**
     * Refresh access token using refresh token
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            
            if (!refreshToken) {
                return this.badRequest(res, null, 'Refresh token is required');
            }
            
            const result = await authService.refreshToken(refreshToken);
            
            return this.success(res, result, 'Token refreshed successfully');
        } catch (error) {
            // Menambahkan konteks tambahan ke error untuk logging di BaseController
            error.context = {
                action: 'refresh_token'
            };
            
            return this.handleError(res, error);
        }
    }
}

module.exports = new AuthController();