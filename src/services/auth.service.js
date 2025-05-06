/**
 * Auth Service
 * Handles authentication and authorization business logic
 */

const jwt = require('jsonwebtoken');
const config = require('../config/app.config');
const { USER_ROLES } = require('../shared/constants/app.constants');
const { generateToken, generateRefreshToken } = require('../shared/utils/jwt.utils');
const prisma = require('../config/database.config');
const {
  findUserByUsername,
  findUserByEmail,
  findUserByPhoneNumber,
  findUserById,
  isUsernameExists,
  isEmailExists,
  isPhoneNumberExists,
  hashPassword,
  verifyPassword,
  transformUserForPublicApi
} = require('../shared/utils/user-queries.utils');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Created user object (without password)
   */
  async register(userData) {
    const { username, name, email, password, phoneNumber, dateOfBirth, role, address } = userData;
    
    try {
      // Check if user already exists by username, email, or phone number
      if (username && await isUsernameExists(username)) {
        const error = new Error('User with this username already exists');
        error.statusCode = 409;
        throw error;
      }
      
      if (email && await isEmailExists(email)) {
        const error = new Error('User with this email already exists');
        error.statusCode = 409;
        throw error;
      }
      
      if (phoneNumber && await isPhoneNumberExists(phoneNumber)) {
        const error = new Error('User with this phone number already exists');
        error.statusCode = 409;
        throw error;
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          username,
          name,
          email,
          password: hashedPassword,
          phoneNumber,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          role: role || USER_ROLES.USER_SELF,
          address: address || 'No address provided'
        },
        select: {
          id: true,
          uuid: true,
          username: true,
          name: true,
          email: true,
          phoneNumber: true,
          dateOfBirth: true,
          role: true,
          address: true,
          createdAt: true
        }
      });
      
      // Transform response to use UUID as public ID
      return transformUserForPublicApi(newUser);
    } catch (error) {
      // Check for Prisma unique constraint errors
      if (error.code === 'P2002') {
        const fieldName = error.meta?.target?.[0] || 'field';
        const customError = new Error(`User with this ${fieldName} already exists`);
        customError.statusCode = 409;
        throw customError;
      }
      
      // Re-throw with appropriate status code
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      throw error;
    }
  }
  
  /**
   * Login a user
   * @param {string} username - Username
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data with access token and refresh token
   */
  async login(username, password) {
    if (!username) {
      const error = new Error('Username is required');
      error.statusCode = 400;
      throw error;
    }

    // Find user by username with password
    const user = await findUserByUsername(username, { includePassword: true });
    
    if (!user) {
      const error = new Error('Invalid username or password');
      error.statusCode = 401;
      throw error;
    }
    
    // Check password
    const isPasswordValid = await verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      const error = new Error('Invalid username or password');
      error.statusCode = 401;
      throw error;
    }
    
    // Generate JWT tokens
    const tokenPayload = { id: user.id, uuid: user.uuid };
    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken({ ...tokenPayload, type: 'refresh' });
    
    // Prepare public user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    const publicUser = transformUserForPublicApi(userWithoutPassword);
    
    return {
      accessToken,
      refreshToken,
      user: publicUser
    };
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New access token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      
      // Check if it's a refresh token
      if (!decoded.type || decoded.type !== 'refresh') {
        const error = new Error('Invalid refresh token');
        error.statusCode = 401;
        throw error;
      }

      // Find user
      const user = await findUserById(decoded.id);

      if (!user) {
        const error = new Error('User not found');
        error.statusCode = 401;
        throw error;
      }

      // Generate new access token
      const accessToken = generateToken({ id: user.id, uuid: user.uuid });
      
      return {
        accessToken
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        const customError = new Error('Refresh token has expired, please login again');
        customError.statusCode = 401;
        throw customError;
      }
      
      if (error.name === 'JsonWebTokenError') {
        const customError = new Error('Invalid refresh token');
        customError.statusCode = 401;
        throw customError;
      }
      
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      
      throw error;
    }
  }
  
  /**
   * Get user profile
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile(userId) {
    const user = await findUserById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Transform response to use UUID as public ID
    return transformUserForPublicApi(user);
  }
}

module.exports = new AuthService();