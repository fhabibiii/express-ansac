/**
 * FAQ Service
 * Handles FAQ-related business logic
 */

const prisma = require('../../prisma/client');
const { HTTP_STATUS } = require('../shared/constants/app.constants');

class FAQService {
  /**
   * Create a new FAQ
   * @param {string} question - FAQ question
   * @param {boolean} isPublished - Whether the FAQ is published
   * @param {number} userId - User ID creating the FAQ
   * @param {string} userRole - Role of the user creating the FAQ
   * @returns {Promise<Object>} - Created FAQ
   */
  async createFAQ(question, isPublished, userId, userRole) {
    // Check if user has admin/superadmin role
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        isPublished,
        createdBy: userId
      }
    });

    return faq;
  }

  /**
   * Get all FAQs (Admin & SuperAdmin only)
   * @param {number} userId - User ID making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Array>} - List of FAQs
   */
  async getAllFAQs(userId, userRole) {
    // Only Admin and SuperAdmin can access this function
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    let whereClause = {};
    
    // Regular admins can only see their own FAQs, SuperAdmin sees all
    if (userRole === 'ADMIN') {
      whereClause.createdBy = userId;
    }

    const faqs = await prisma.faq.findMany({
      where: whereClause,
      include: {
        answers: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return faqs;
  }

  /**
   * Get public (published) FAQs
   * @returns {Promise<Array>} - List of published FAQs
   */
  async getPublicFAQs() {
    const faqs = await prisma.faq.findMany({
      where: {
        isPublished: true
      },
      include: {
        answers: {
          where: {
            isSelected: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return faqs;
  }

  /**
   * Get FAQ by ID
   * @param {number} id - FAQ ID
   * @param {number} userId - User ID making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - FAQ with answers
   */
  async getFAQById(id, userId, userRole) {
    const faq = await prisma.faq.findUnique({
      where: { id: parseInt(id) },
      include: {
        answers: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!faq) {
      const error = new Error(`FAQ with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions
    if (userRole === 'USER_SELF' || userRole === 'USER_PARENT') {
      if (!faq.isPublished) {
        const error = new Error('Access denied');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else if (userRole === 'ADMIN' && faq.createdBy !== userId) {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }
    // SuperAdmin can access any FAQ

    return faq;
  }

  /**
   * Update FAQ
   * @param {number} id - FAQ ID
   * @param {Object} updateData - FAQ update data
   * @param {number} userId - User ID making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Updated FAQ
   */
  async updateFAQ(id, updateData, userId, userRole) {
    const existingFAQ = await prisma.faq.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingFAQ) {
      const error = new Error(`FAQ with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions
    if (userRole === 'SUPERADMIN') {
      // SuperAdmin can edit any FAQ
    } else if (userRole === 'ADMIN') {
      if (existingFAQ.createdBy !== userId) {
        const error = new Error('Access denied. Cannot edit another user\'s FAQ.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const { question, isPublished } = updateData;

    // Update FAQ
    const updateFields = {};
    if (question !== undefined) updateFields.question = question;
    if (isPublished !== undefined) updateFields.isPublished = isPublished;

    const updatedFAQ = await prisma.faq.update({
      where: { id: parseInt(id) },
      data: updateFields
    });

    return updatedFAQ;
  }

  /**
   * Delete FAQ
   * @param {number} id - FAQ ID
   * @param {number} userId - User ID making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<void>}
   */
  async deleteFAQ(id, userId, userRole) {
    const existingFAQ = await prisma.faq.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingFAQ) {
      const error = new Error(`FAQ with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions
    if (userRole === 'SUPERADMIN') {
      // SuperAdmin can delete any FAQ
    } else if (userRole === 'ADMIN') {
      if (existingFAQ.createdBy !== userId) {
        const error = new Error('Access denied. Cannot delete another user\'s FAQ.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    // Delete FAQ and its answers
    await prisma.$transaction([
      prisma.faqAnswer.deleteMany({
        where: { faqId: parseInt(id) }
      }),
      prisma.faq.delete({
        where: { id: parseInt(id) }
      })
    ]);
  }

  /**
   * Create FAQ answer
   * @param {Object} answerData - Answer data
   * @param {number} userId - User ID creating the answer
   * @param {string} userRole - Role of the user creating the answer
   * @returns {Promise<Object>} - Created answer
   */
  async createFAQAnswer(answerData, userId, userRole) {
    // Check if user has admin/superadmin role
    if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const { faqId, answer } = answerData;

    // Check if FAQ exists
    const faq = await prisma.faq.findUnique({
      where: { id: parseInt(faqId) }
    });

    if (!faq) {
      const error = new Error(`FAQ with ID ${faqId} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Create answer
    const faqAnswer = await prisma.faqAnswer.create({
      data: {
        faqId: parseInt(faqId),
        answer,
        createdBy: userId,
        isSelected: false // Default not selected
      }
    });

    return faqAnswer;
  }

  /**
   * Update FAQ answer
   * @param {number} id - Answer ID
   * @param {Object} updateData - Answer update data
   * @param {number} userId - User ID making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<Object>} - Updated answer
   */
  async updateFAQAnswer(id, updateData, userId, userRole) {
    const existingAnswer = await prisma.faqAnswer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnswer) {
      const error = new Error(`FAQ answer with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions
    if (userRole === 'SUPERADMIN') {
      // SuperAdmin can edit any answer
    } else if (userRole === 'ADMIN') {
      if (existingAnswer.createdBy !== userId) {
        const error = new Error('Access denied. Cannot edit another user\'s answer.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    const { answer, isSelected } = updateData;

    // If this answer is being selected, unselect all other answers for this FAQ
    if (isSelected === true) {
      await prisma.faqAnswer.updateMany({
        where: {
          faqId: existingAnswer.faqId,
          id: {
            not: parseInt(id)
          }
        },
        data: {
          isSelected: false
        }
      });
    }

    // Update answer
    const updateFields = {};
    if (answer !== undefined) updateFields.answer = answer;
    if (isSelected !== undefined) updateFields.isSelected = isSelected;

    const updatedAnswer = await prisma.faqAnswer.update({
      where: { id: parseInt(id) },
      data: updateFields
    });

    return updatedAnswer;
  }

  /**
   * Delete FAQ answer
   * @param {number} id - Answer ID
   * @param {number} userId - User ID making the request
   * @param {string} userRole - Role of the user making the request
   * @returns {Promise<void>}
   */
  async deleteFAQAnswer(id, userId, userRole) {
    const existingAnswer = await prisma.faqAnswer.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingAnswer) {
      const error = new Error(`FAQ answer with ID ${id} not found`);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }

    // Check permissions
    if (userRole === 'SUPERADMIN') {
      // SuperAdmin can delete any answer
    } else if (userRole === 'ADMIN') {
      if (existingAnswer.createdBy !== userId) {
        const error = new Error('Access denied. Cannot delete another user\'s answer.');
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }
    } else {
      const error = new Error('Access denied');
      error.statusCode = HTTP_STATUS.FORBIDDEN;
      throw error;
    }

    await prisma.faqAnswer.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new FAQService();