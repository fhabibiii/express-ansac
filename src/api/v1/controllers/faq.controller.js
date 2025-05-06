/**
 * FAQ Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const faqService = require('../../../services/faq.service');

class FAQController extends BaseController {
    constructor() {
        super('faq');
    }

    /**
     * Create a new FAQ
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createFAQ(req, res) {
        try {
            const { question } = req.body;
            
            const newFAQ = await faqService.createFAQ(
                question,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(
                res,
                'FAQ created successfully',
                newFAQ,
                201
            );
        } catch (error) {
            console.error('Create FAQ error:', error);
            return this.sendError(res, error.message || 'Failed to create FAQ', error.statusCode);
        }
    }

    /**
     * Create a new FAQ answer
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createFAQAnswer(req, res) {
        try {
            const { faqId, content } = req.body;
            
            const newAnswer = await faqService.createFAQAnswer(
                faqId,
                content,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(
                res,
                'FAQ answer created successfully',
                newAnswer,
                201
            );
        } catch (error) {
            console.error('Create FAQ answer error:', error);
            return this.sendError(res, error.message || 'Failed to create FAQ answer', error.statusCode);
        }
    }

    /**
     * Get all FAQs (Admin & SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllFAQs(req, res) {
        try {
            const faqs = await faqService.getAllFAQs(req.user.role);
            
            return this.sendSuccess(res, 'FAQs retrieved successfully', faqs);
        } catch (error) {
            console.error('Get FAQs error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve FAQs', error.statusCode);
        }
    }

    /**
     * Get all answers for a specific FAQ
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllFAQAnswers(req, res) {
        try {
            const faqId = req.params.faqId;
            
            const answers = await faqService.getAllFAQAnswers(
                faqId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, `Answers for FAQ ID ${faqId} retrieved successfully`, answers);
        } catch (error) {
            console.error('Get FAQ answers error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve FAQ answers', error.statusCode);
        }
    }

    /**
     * Get all pending FAQs (Admin & SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllPendingFAQs(req, res) {
        try {
            const faqs = await faqService.getAllPendingFAQs(req.user.role);
            
            return this.sendSuccess(res, 'Pending FAQs retrieved successfully', faqs);
        } catch (error) {
            console.error('Get pending FAQs error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve pending FAQs', error.statusCode);
        }
    }

    /**
     * Get FAQ by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getFAQById(req, res) {
        try {
            const faqId = req.params.id;
            
            const faq = await faqService.getFAQById(
                faqId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'FAQ retrieved successfully', faq);
        } catch (error) {
            console.error('Get FAQ error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve FAQ', error.statusCode);
        }
    }

    /**
     * Update FAQ
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateFAQ(req, res) {
        try {
            const faqId = req.params.id;
            const { question } = req.body;
            
            const updatedFAQ = await faqService.updateFAQ(
                faqId,
                question,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'FAQ updated successfully', updatedFAQ);
        } catch (error) {
            console.error('Update FAQ error:', error);
            return this.sendError(res, error.message || 'Failed to update FAQ', error.statusCode);
        }
    }

    /**
     * Update FAQ answer
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateFAQAnswer(req, res) {
        try {
            const answerId = req.params.id;
            const { content } = req.body;
            
            const updatedAnswer = await faqService.updateFAQAnswer(
                answerId,
                content,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'FAQ answer updated successfully', updatedAnswer);
        } catch (error) {
            console.error('Update FAQ answer error:', error);
            return this.sendError(res, error.message || 'Failed to update FAQ answer', error.statusCode);
        }
    }

    /**
     * Delete FAQ
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteFAQ(req, res) {
        try {
            const faqId = req.params.id;
            
            await faqService.deleteFAQ(
                faqId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'FAQ deleted successfully');
        } catch (error) {
            console.error('Delete FAQ error:', error);
            return this.sendError(res, error.message || 'Failed to delete FAQ', error.statusCode);
        }
    }

    /**
     * Delete FAQ answer
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async deleteFAQAnswer(req, res) {
        try {
            const answerId = req.params.id;
            
            await faqService.deleteFAQAnswer(
                answerId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'FAQ answer deleted successfully');
        } catch (error) {
            console.error('Delete FAQ answer error:', error);
            return this.sendError(res, error.message || 'Failed to delete FAQ answer', error.statusCode);
        }
    }

    /**
     * Change FAQ status (SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async changeFAQStatus(req, res) {
        try {
            const faqId = req.params.id;
            const { status } = req.body;
            
            const updatedFAQ = await faqService.changeFAQStatus(
                faqId,
                status,
                req.user.role
            );
            
            return this.sendSuccess(res, `FAQ status changed to ${status} successfully`, updatedFAQ);
        } catch (error) {
            console.error('Change FAQ status error:', error);
            return this.sendError(res, error.message || 'Failed to change FAQ status', error.statusCode);
        }
    }

    /**
     * Get public FAQs (for all users)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getPublicFAQs(req, res) {
        try {
            const faqs = await faqService.getPublicFAQs();
            
            return this.sendSuccess(res, 'Public FAQs retrieved successfully', faqs);
        } catch (error) {
            console.error('Get public FAQs error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve public FAQs', error.statusCode);
        }
    }

    /**
     * Update FAQ order
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateFAQOrder(req, res) {
        try {
            const { orderedFaqs } = req.body;
            
            await faqService.updateFAQOrder(
                orderedFaqs,
                req.user.role
            );
            
            return this.sendSuccess(res, 'FAQ order updated successfully');
        } catch (error) {
            console.error('Update FAQ order error:', error);
            return this.sendError(res, error.message || 'Failed to update FAQ order', error.statusCode);
        }
    }

    /**
     * Update FAQ answer order
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateFAQAnswerOrder(req, res) {
        try {
            const faqId = req.params.faqId;
            const { orderedAnswers } = req.body;
            
            await faqService.updateFAQAnswerOrder(
                faqId,
                orderedAnswers,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'FAQ answer order updated successfully');
        } catch (error) {
            console.error('Update FAQ answer order error:', error);
            return this.sendError(res, error.message || 'Failed to update FAQ answer order', error.statusCode);
        }
    }
}

module.exports = new FAQController();