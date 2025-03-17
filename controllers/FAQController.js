const express = require("express");
const { validationResult } = require("express-validator");
const prisma = require("../prisma/client");

// Create a new FAQ
const createFAQ = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Check if user has admin/superadmin role
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { question } = req.body;
        
        // Create FAQ
        const faq = await prisma.faq.create({
            data: {
                question,
                status: "PENDING" // Default status
            }
        });

        res.status(201).json({
            success: true,
            message: "FAQ created successfully",
            data: faq,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create an answer for an FAQ
const createFAQAnswer = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Check if user has admin/superadmin role
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { faqId, content } = req.body;

        // Check if FAQ exists
        const faq = await prisma.faq.findUnique({
            where: { id: parseInt(faqId) }
        });

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: `FAQ with id: ${faqId} not found`,
            });
        }
        
        // Create answer
        const answer = await prisma.faqAnswer.create({
            data: {
                faqId: parseInt(faqId),
                content
            }
        });

        res.status(201).json({
            success: true,
            message: "FAQ answer created successfully",
            data: answer,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all FAQs (SuperAdmin only)
const getAllFAQ = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // Only SuperAdmin can access this function
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin can access all FAQs.",
            });
        }

        // SuperAdmin sees all FAQs (no restrictions)
        const faqs = await prisma.faq.findMany({
            include: {
                answers: true
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all answers for a specific FAQ
const getAllFAQAnswer = async (req, res) => {
    try {
        const { faqId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // Only Admin or SuperAdmin can access this function
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Check if FAQ exists
        const faq = await prisma.faq.findUnique({
            where: { id: parseInt(faqId) }
        });

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: `FAQ with id: ${faqId} not found`,
            });
        }

        // Get all answers for this FAQ
        const answers = await prisma.faqAnswer.findMany({
            where: { faqId: parseInt(faqId) },
            orderBy: { order: 'asc' }
        });

        res.status(200).json({
            success: true,
            data: answers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get all pending FAQs (SuperAdmin only)
const getAllPendingFAQ = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // Only SuperAdmin can access this function
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin can access pending FAQs.",
            });
        }

        // Get all FAQs with PENDING status
        const faqs = await prisma.faq.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                answers: true
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get FAQ by ID
const getFAQById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Validate that id is a number
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid FAQ ID format",
            });
        }
        
        const faq = await prisma.faq.findUnique({
            where: { id },
            include: {
                answers: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: `FAQ with id: ${id} not found`,
            });
        }

        // Check permissions based on role and status
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role === 'USER_SELF' || user.role === 'USER_PARENT') {
            // Regular users can only see APPROVED FAQs
            if (faq.status !== 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }
        }
        // Admin and SuperAdmin can see all FAQs

        res.status(200).json({
            success: true,
            data: faq
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update FAQ
const updateFAQ = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { id } = req.params;
        const { question } = req.body;

        // Check if FAQ exists
        const existingFAQ = await prisma.faq.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingFAQ) {
            return res.status(404).json({
                success: false,
                message: `FAQ with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // SuperAdmin can edit any FAQ
        if (user.role === 'SUPERADMIN') {
            // Allow editing - no restrictions
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins cannot edit APPROVED FAQs
            if (existingFAQ.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot edit an approved FAQ.",
                });
            }
        } 
        // Other roles cannot edit
        else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Prepare update data
        const updateData = {
            question: question || existingFAQ.question,
        };
        
        // If FAQ status is REJECTED, change to PENDING when updated
        if (existingFAQ.status === 'REJECTED') {
            updateData.status = 'PENDING';
        }

        // Update FAQ
        const updatedFAQ = await prisma.faq.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: existingFAQ.status === 'REJECTED' ? 
                "FAQ updated successfully and status changed to PENDING" : 
                "FAQ updated successfully",
            data: updatedFAQ
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update FAQ Answer
const updateFAQAnswer = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { id } = req.params;
        const { content } = req.body;

        // Check if FAQ answer exists
        const existingAnswer = await prisma.faqAnswer.findUnique({
            where: { id: parseInt(id) },
            include: { faq: true }
        });

        if (!existingAnswer) {
            return res.status(404).json({
                success: false,
                message: `FAQ answer with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // SuperAdmin can edit any FAQ answer
        if (user.role === 'SUPERADMIN') {
            // Allow editing - no restrictions
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins cannot edit APPROVED FAQs
            if (existingAnswer.faq.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot edit an answer from an approved FAQ.",
                });
            }
        } 
        // Other roles cannot edit
        else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // If FAQ status is REJECTED, change to PENDING when answer is updated
        if (existingAnswer.faq.status === 'REJECTED') {
            await prisma.faq.update({
                where: { id: existingAnswer.faqId },
                data: { status: 'PENDING' }
            });
        }

        // Update FAQ answer
        const updatedAnswer = await prisma.faqAnswer.update({
            where: { id: parseInt(id) },
            data: { content }
        });

        res.status(200).json({
            success: true,
            message: existingAnswer.faq.status === 'REJECTED' ? 
                "FAQ answer updated successfully and FAQ status changed to PENDING" : 
                "FAQ answer updated successfully",
            data: updatedAnswer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete FAQ
const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if FAQ exists
        const existingFAQ = await prisma.faq.findUnique({
            where: { id: parseInt(id) },
            include: { answers: true }
        });

        if (!existingFAQ) {
            return res.status(404).json({
                success: false,
                message: `FAQ with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // SuperAdmin can delete any FAQ
        if (user.role === 'SUPERADMIN') {
            // Allow deletion - no restrictions
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins cannot delete APPROVED FAQs
            if (existingFAQ.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot delete an approved FAQ.",
                });
            }
        }
        // Other roles cannot delete
        else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Delete FAQ and all related answers (cascading delete)
        await prisma.faq.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: "FAQ and all associated answers deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Delete FAQ Answer
const deleteFAQAnswer = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if FAQ answer exists
        const existingAnswer = await prisma.faqAnswer.findUnique({
            where: { id: parseInt(id) },
            include: { faq: true }
        });

        if (!existingAnswer) {
            return res.status(404).json({
                success: false,
                message: `FAQ answer with id: ${id} not found`,
            });
        }

        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        // SuperAdmin can delete any FAQ answer
        if (user.role === 'SUPERADMIN') {
            // Allow deletion - no restrictions
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins cannot delete answers from APPROVED FAQs
            if (existingAnswer.faq.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot delete an answer from an approved FAQ.",
                });
            }
        }
        // Other roles cannot delete
        else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Delete FAQ answer
        await prisma.faqAnswer.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: "FAQ answer deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Change FAQ Status (for SuperAdmin)
const changeFAQStatus = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { id } = req.params;
        const { status } = req.body;

        // Check if user is SuperAdmin
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only SuperAdmin can change FAQ status.",
            });
        }

        // Check if FAQ exists
        const existingFAQ = await prisma.faq.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingFAQ) {
            return res.status(404).json({
                success: false,
                message: `FAQ with id: ${id} not found`,
            });
        }

        // Update status
        const updatedFAQ = await prisma.faq.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.status(200).json({
            success: true,
            message: `FAQ status changed to ${status} successfully`,
            data: updatedFAQ
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Public FAQs (for all users)
const getPublicFAQs = async (req, res) => {
    try {
        // Only fetch APPROVED FAQs
        const faqs = await prisma.faq.findMany({
            where: {
                status: 'APPROVED'
            },
            include: {
                answers: {
                    orderBy: { order: 'asc' }
                }
            },
            orderBy: [
                { order: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        res.status(200).json({
            success: true,
            data: faqs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update FAQ Order
const updateFAQOrder = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { orderedFaqs } = req.body;

        // Validate that orderedFaqs is an array
        if (!Array.isArray(orderedFaqs)) {
            return res.status(400).json({
                success: false,
                message: "orderedFaqs must be an array",
            });
        }

        // Update order for each FAQ
        const updatePromises = orderedFaqs.map((item, index) => {
            return prisma.faq.update({
                where: { id: parseInt(item.id) },
                data: { order: index }
            });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: "FAQ order updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Update FAQ Answer Order
const updateFAQAnswerOrder = async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Check permissions
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { faqId } = req.params;
        const { orderedAnswers } = req.body;

        // Check if FAQ exists
        const existingFAQ = await prisma.faq.findUnique({
            where: { id: parseInt(faqId) }
        });

        if (!existingFAQ) {
            return res.status(404).json({
                success: false,
                message: `FAQ with id: ${faqId} not found`,
            });
        }

        // SuperAdmin can edit any FAQ
        if (user.role === 'SUPERADMIN') {
            // Allow editing - no restrictions
        }
        // Admin has restrictions
        else if (user.role === 'ADMIN') {
            // Admins cannot edit APPROVED FAQs
            if (existingFAQ.status === 'APPROVED') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Cannot edit answer order of an approved FAQ.",
                });
            }
        }

        // Validate that orderedAnswers is an array
        if (!Array.isArray(orderedAnswers)) {
            return res.status(400).json({
                success: false,
                message: "orderedAnswers must be an array",
            });
        }

        // Update order for each answer
        const updatePromises = orderedAnswers.map((item, index) => {
            return prisma.faqAnswer.update({
                where: { id: parseInt(item.id) },
                data: { order: index }
            });
        });

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: "FAQ answer order updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    createFAQ,
    createFAQAnswer,
    getAllFAQ,
    getAllFAQAnswer,
    getAllPendingFAQ,
    getFAQById,
    updateFAQ,
    updateFAQAnswer,
    deleteFAQ,
    deleteFAQAnswer,
    changeFAQStatus,
    getPublicFAQs,
    updateFAQOrder,
    updateFAQAnswerOrder
};