/**
 * User Service
 * Handles user management business logic
 */

const { USER_ROLES } = require('../shared/constants/app.constants');
const {
  findUserById,
  findUserByUuid,
  isUsernameExists,
  isEmailExists,
  isPhoneNumberExists,
  updateUserById,
  updateUserByUuid,
  verifyPassword,
  hashPassword,
  transformUserForPublicApi
} = require('../shared/utils/user-queries.utils');
const prisma = require('../config/database.config');

class UserService {
  /**
   * Get user profile by ID (for user's own profile)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - User profile data
   */
  async getProfileById(userId) {
    // Find user by ID
    const user = await findUserById(userId);
    
    if (!user) {
      const error = new Error(`Account with ID ${userId} not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Transform response to use UUID as public ID
    return transformUserForPublicApi(user);
  }

  /**
   * Get user profile by UUID (for public API)
   * @param {string} uuid - User UUID
   * @returns {Promise<Object>} - User profile data
   */
  async getProfileByUuid(uuid) {
    // Find user by UUID
    const user = await findUserByUuid(uuid);
    
    if (!user) {
      const error = new Error(`Account not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Transform response to use UUID as public ID
    return transformUserForPublicApi(user);
  }
  
  /**
   * Update user profile (for user's own profile)
   * @param {number} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateProfile(userId, userData) {
    const { username, name, email, password, phoneNumber, dateOfBirth, role, address } = userData;
    
    // Check if user exists
    const existingUser = await findUserById(userId);
    
    if (!existingUser) {
      const error = new Error(`User not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Prepare update data
    const updateData = {};
    
    // Check for username uniqueness if changed
    if (username && username !== existingUser.username) {
      if (await isUsernameExists(username, userId)) {
        const error = new Error(`Username already exists`);
        error.statusCode = 409;
        throw error;
      }
      updateData.username = username;
    }
    
    // Check for email uniqueness if changed
    if (email && email !== existingUser.email) {
      if (await isEmailExists(email, userId)) {
        const error = new Error(`Email already exists`);
        error.statusCode = 409;
        throw error;
      }
      updateData.email = email;
    }
    
    // Check for phone number uniqueness if changed
    if (phoneNumber && phoneNumber !== existingUser.phoneNumber) {
      if (await isPhoneNumberExists(phoneNumber, userId)) {
        const error = new Error(`Phone number already exists`);
        error.statusCode = 409;
        throw error;
      }
      updateData.phoneNumber = phoneNumber;
    }
    
    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    // Add other fields to update data
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (role) updateData.role = role;
    if (address) updateData.address = address;
    
    // Update user data
    const updatedUser = await updateUserById(userId, updateData);
    
    // Transform response to use UUID as public ID
    return transformUserForPublicApi(updatedUser);
  }

  /**
   * Update user profile by UUID (for public API)
   * @param {string} uuid - User UUID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} - Updated user data
   */
  async updateProfileByUuid(uuid, userData) {
    const { username, name, email, password, phoneNumber, dateOfBirth, role, address } = userData;
    
    // Check if user exists
    const existingUser = await findUserByUuid(uuid);
    
    if (!existingUser) {
      const error = new Error(`User not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Prepare update data
    const updateData = {};
    
    // Check for username uniqueness if changed
    if (username && username !== existingUser.username) {
      if (await isUsernameExists(username, existingUser.id)) {
        const error = new Error(`Username already exists`);
        error.statusCode = 409;
        throw error;
      }
      updateData.username = username;
    }
    
    // Check for email uniqueness if changed
    if (email && email !== existingUser.email) {
      if (await isEmailExists(email, existingUser.id)) {
        const error = new Error(`Email already exists`);
        error.statusCode = 409;
        throw error;
      }
      updateData.email = email;
    }
    
    // Check for phone number uniqueness if changed
    if (phoneNumber && phoneNumber !== existingUser.phoneNumber) {
      if (await isPhoneNumberExists(phoneNumber, existingUser.id)) {
        const error = new Error(`Phone number already exists`);
        error.statusCode = 409;
        throw error;
      }
      updateData.phoneNumber = phoneNumber;
    }
    
    // Hash password if provided
    if (password) {
      updateData.password = await hashPassword(password);
    }
    
    // Add other fields to update data
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (role) updateData.role = role;
    if (address) updateData.address = address;
    
    // Update user data
    const updatedUser = await updateUserByUuid(uuid, updateData);
    
    // Transform response to use UUID as public ID
    return transformUserForPublicApi(updatedUser);
  }
  
  /**
   * Delete user profile (for user's own profile)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteProfile(userId) {
    // Check if user exists
    const userToDelete = await findUserById(userId);
    
    if (!userToDelete) {
      const error = new Error(`User not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Delete user - must delete related records first
    await prisma.$transaction(async (prisma) => {
      // Delete test results and subskala results (if they exist)
      await prisma.testResultSubskala.deleteMany({
        where: {
          testResult: {
            userId: parseInt(userId)
          }
        }
      });
      
      await prisma.testResult.deleteMany({
        where: { userId: parseInt(userId) }
      });
      
      // Delete the user
      await prisma.user.delete({
        where: { id: parseInt(userId) }
      });
    });
  }

  /**
   * Delete user profile by UUID (for public API)
   * @param {string} uuid - User UUID
   * @returns {Promise<void>}
   */
  async deleteProfileByUuid(uuid) {
    // Check if user exists and get internal ID
    const userToDelete = await findUserByUuid(uuid, { select: { id: true } });
    
    if (!userToDelete) {
      const error = new Error(`User not found`);
      error.statusCode = 404;
      throw error;
    }
    
    // Use the internal ID for deletion process
    await this.deleteProfile(userToDelete.id);
  }
  
  /**
   * Verify user password
   * @param {number} userId - User ID
   * @param {string} password - Password to verify
   * @returns {Promise<boolean>} - Whether password is correct
   */
  async verifyPassword(userId, password) {
    // Find user by ID with password
    const user = await findUserById(userId, { includePassword: true });
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Check password
    const isMatch = await verifyPassword(password, user.password);
    
    if (!isMatch) {
      const error = new Error('Invalid password');
      error.statusCode = 401;
      throw error;
    }
    
    return true;
  }
  
  /**
   * Change user password
   * @param {number} userId - User ID
   * @param {string} oldPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} - Success message
   */
  async changePassword(userId, oldPassword, newPassword) {
    // Find user with password
    const user = await findUserById(userId, { includePassword: true });
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Verify current password
    const isPasswordValid = await verifyPassword(oldPassword, user.password);
    
    if (!isPasswordValid) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      throw error;
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword, 12);
    
    // Update password
    await updateUserById(userId, { password: hashedPassword });
    
    return { message: 'Password changed successfully' };
  }
}

module.exports = new UserService();