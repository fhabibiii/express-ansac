/**
 * SuperAdmin Service
 * Handles SuperAdmin-related business logic
 */

const bcrypt = require('bcryptjs');
const prisma = require('../../prisma/client');
const { HTTP_STATUS } = require('../shared/constants/app.constants');

class SuperAdminService {
  /**
   * Find all SuperAdmins
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Array>} - List of SuperAdmin users
   */
  async findSuperAdmins(userRole) {
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Get all users with role SUPERADMIN
    const superadmins = await prisma.user.findMany({
      where: {
        role: 'SUPERADMIN',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phoneNumber: true,
      }
    });

    return superadmins;
  }

  /**
   * Find all Admins
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Array>} - List of Admin users
   */
  async findAdmins(userRole) {
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Get all users with role ADMIN
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phoneNumber: true,
      }
    });

    return admins;
  }

  /**
   * Find all regular users
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Array>} - List of regular users
   */
  async findUsers(userRole) {
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Get all users with roles USER_PARENT or USER_SELF
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['USER_PARENT', 'USER_SELF'],
        },
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phoneNumber: true,
        role: true,
      }
    });

    return users;
  }

  /**
   * Create a new user account
   * @param {Object} userData - User data to create
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Object>} - Created user
   */
  async createAccount(userData, userRole) {
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const { username, name, email, password, phoneNumber, dateOfBirth, role } = userData;

    // Check if username exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUsername) {
      const error = new Error('Username already taken');
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }
    
    // Check if email exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingEmail) {
      const error = new Error('Email already registered');
      error.statusCode = HTTP_STATUS.CONFLICT;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth),
        role,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        dateOfBirth: true,
        role: true,
      }
    });

    return newUser;
  }

  /**
   * Find user account by ID
   * @param {number} userId - ID of the user to find
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Object>} - User account
   */
  async findAccountById(userId, userRole) {
    // Check if ID is a number
    userId = parseInt(userId);
    if (isNaN(userId)) {
      const error = new Error('Invalid ID format');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
    
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
    
    // Find user without returning password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        dateOfBirth: true,
        role: true,
      }
    });
    
    if (!user) {
      const error = new Error(`User with ID ${userId} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    
    return user;
  }

  /**
   * Update user account
   * @param {number} userId - ID of the user to update
   * @param {Object} updateData - User data to update
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Object>} - Updated user
   */
  async updateAccount(userId, updateData, userRole) {
    // Check if ID is a number
    userId = parseInt(userId);
    if (isNaN(userId)) {
      const error = new Error('Invalid ID format');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
    
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
    
    // Find user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      const error = new Error(`User with ID ${userId} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    
    const { username, name, email, password, phoneNumber, dateOfBirth, role } = updateData;
    
    // Prepare update data
    const updateFields = {};
    
    if (username) updateFields.username = username;
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;
    if (dateOfBirth) updateFields.dateOfBirth = new Date(dateOfBirth);
    if (role) updateFields.role = role;
    
    // If changing password, hash it
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }
    
    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateFields,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        dateOfBirth: true,
        role: true,
      }
    });
    
    return updatedUser;
  }

  /**
   * Delete user account
   * @param {number} userId - ID of the user to delete
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<void>}
   */
  async deleteAccount(userId, userRole) {
    // Check if ID is a number
    userId = parseInt(userId);
    if (isNaN(userId)) {
      const error = new Error('Invalid ID format');
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
      throw error;
    }
    
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
    
    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!userToDelete) {
      const error = new Error(`User with ID ${userId} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    
    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });
  }
  
  /**
   * Accept or reject a test
   * @param {number} testId - ID of the test
   * @param {string} status - New status for the test
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<Object>} - Updated test
   */
  async acceptTest(testId, status, userRole) {
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
    
    // Check if test exists
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) }
    });
    
    if (!test) {
      const error = new Error('Test not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    
    // Update test status
    const updatedTest = await prisma.test.update({
      where: { id: parseInt(testId) },
      data: { status },
      select: {
        id: true,
        title: true,
        shortDesc: true,
        longDesc: true,
        minAge: true,
        maxAge: true,
        target: true,
        status: true,
      }
    });
    
    return updatedTest;
  }
  
  /**
   * Delete a test and all related data
   * @param {number} testId - ID of the test to delete
   * @param {string} userRole - Role of the requesting user
   * @returns {Promise<void>}
   */
  async deleteTest(testId, userRole) {
    // Check if user is a SUPERADMIN
    if (userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
    
    // Check if test exists
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) }
    });
    
    if (!test) {
      const error = new Error('Test not found');
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
    
    // Delete test and related data (transaction)
    await prisma.$transaction(async (tx) => {
      // Delete testResultSubskala related to testResult
      await tx.testResultSubskala.deleteMany({
        where: {
          testResult: {
            testId: parseInt(testId)
          }
        }
      });
      
      // Delete testResult related to testId
      await tx.testResult.deleteMany({
        where: { testId: parseInt(testId) }
      });
      
      // Delete questionOrder related to testId
      await tx.questionOrder.deleteMany({
        where: { testId: parseInt(testId) }
      });
      
      // Find all subskala IDs
      const subskalas = await tx.subskala.findMany({
        where: { testId: parseInt(testId) },
        select: { id: true }
      });
      
      const subskalaIds = subskalas.map(subskala => subskala.id);
      
      // Delete questions related to subskalaIds
      await tx.question.deleteMany({
        where: {
          subskalaId: { in: subskalaIds }
        }
      });
      
      // Delete subskala related to testId
      await tx.subskala.deleteMany({
        where: { testId: parseInt(testId) }
      });
      
      // Delete test
      await tx.test.delete({
        where: { id: parseInt(testId) }
      });
    });
  }
}

module.exports = new SuperAdminService();