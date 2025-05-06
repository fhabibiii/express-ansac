/**
 * Test Controller
 */
const BaseController = require('../../../shared/controllers/base.controller');
const testService = require('../../../services/test.service');

class TestController extends BaseController {
    constructor() {
        super('test');
    }

    /**
     * Create a new test (Admin and SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createTest(req, res) {
        try {
            const { title, shortDesc, longDesc, minAge, maxAge, target } = req.body;
            
            const testData = {
                title,
                shortDesc,
                longDesc,
                minAge,
                maxAge,
                target
            };
            
            const newTest = await testService.createTest(testData, req.user.id, req.user.role);
            
            return this.sendSuccess(
                res,
                'Test created successfully',
                newTest,
                201
            );
        } catch (error) {
            console.error('Create test error:', error);
            return this.sendError(res, error.message || 'Failed to create test', error.statusCode);
        }
    }
    
    /**
     * Create a new subskala
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createSubskala(req, res) {
        try {
            const { 
                testId, 
                name, 
                description1, 
                minValue1, 
                maxValue1, 
                description2, 
                minValue2, 
                maxValue2, 
                description3, 
                minValue3, 
                maxValue3 
            } = req.body;
            
            const subskalaData = {
                testId,
                name,
                description1,
                minValue1,
                maxValue1,
                description2,
                minValue2,
                maxValue2,
                description3,
                minValue3,
                maxValue3
            };
            
            const newSubskala = await testService.createSubskala(
                subskalaData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(
                res,
                'Subskala created successfully',
                newSubskala,
                201
            );
        } catch (error) {
            console.error('Create subskala error:', error);
            return this.sendError(res, error.message || 'Failed to create subskala', error.statusCode);
        }
    }
    
    /**
     * Create a new question
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createQuestion(req, res) {
        try {
            const { subskalaId, text, option1Value, option2Value, option3Value } = req.body;
            
            const questionData = {
                subskalaId,
                text,
                option1Value,
                option2Value,
                option3Value
            };
            
            const newQuestion = await testService.createQuestion(
                questionData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(
                res,
                'Question created successfully',
                newQuestion,
                201
            );
        } catch (error) {
            console.error('Create question error:', error);
            return this.sendError(res, error.message || 'Failed to create question', error.statusCode);
        }
    }
    
    /**
     * Save question order permanently
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async saveQuestionOrder(req, res) {
        try {
            const { testId, orderedQuestions } = req.body;
            
            const result = await testService.saveQuestionOrder(
                testId,
                orderedQuestions,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Question order saved successfully', result);
        } catch (error) {
            console.error('Save question order error:', error);
            return this.sendError(res, error.message || 'Failed to save question order', error.statusCode);
        }
    }
    
    /**
     * Get all tests (with filtering options)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllTests(req, res) {
        try {
            const options = {
                status: req.query.status,
                target: req.query.target
            };
            
            const tests = await testService.getAllTests(options, req.user.role);
            
            return this.sendSuccess(res, 'Tests retrieved successfully', tests);
        } catch (error) {
            console.error('Get tests error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve tests', error.statusCode);
        }
    }
    
    /**
     * Get available tests for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAvailableTests(req, res) {
        try {
            const userId = req.user.id;
            const tests = await testService.getAvailableTests(userId);
            
            return this.sendSuccess(res, 'Available tests retrieved successfully', tests);
        } catch (error) {
            console.error('Get available tests error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve available tests', error.statusCode);
        }
    }
    
    /**
     * Get test by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getTestById(req, res) {
        try {
            const testId = req.params.id;
            const includeQuestions = req.query.includeQuestions === 'true';
            
            const test = await testService.getTestById(
                testId,
                includeQuestions,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Test retrieved successfully', test);
        } catch (error) {
            console.error('Get test error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve test', error.statusCode);
        }
    }
    
    /**
     * Update test
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateTest(req, res) {
        try {
            const testId = req.params.id;
            const { title, shortDesc, longDesc, minAge, maxAge, target } = req.body;
            
            const testData = {
                title,
                shortDesc,
                longDesc,
                minAge,
                maxAge,
                target
            };
            
            const updatedTest = await testService.updateTest(
                testId,
                testData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Test updated successfully', updatedTest);
        } catch (error) {
            console.error('Update test error:', error);
            return this.sendError(res, error.message || 'Failed to update test', error.statusCode);
        }
    }
    
    /**
     * Submit test answers
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async submitTest(req, res) {
        try {
            const { testId, answers, childName, childAge, childGender, relationshipToChild } = req.body;
            
            const testData = {
                testId,
                answers,
                childName,
                childAge,
                childGender,
                relationshipToChild
            };
            
            const result = await testService.submitTest(testData, req.user.id);
            
            return this.sendSuccess(res, 'Test submitted successfully', result);
        } catch (error) {
            console.error('Submit test error:', error);
            return this.sendError(res, error.message || 'Failed to submit test', error.statusCode);
        }
    }
    
    /**
     * Get test results for a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getTestResults(req, res) {
        try {
            const userId = req.user.id;
            
            const results = await testService.getTestResults(userId);
            
            return this.sendSuccess(res, 'Test results retrieved successfully', results);
        } catch (error) {
            console.error('Get test results error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve test results', error.statusCode);
        }
    }
    
    /**
     * Get specific test result
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getTestResultById(req, res) {
        try {
            const resultId = req.params.id;
            
            const result = await testService.getTestResultById(resultId, req.user.id, req.user.role);
            
            return this.sendSuccess(res, 'Test result retrieved successfully', result);
        } catch (error) {
            console.error('Get test result error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve test result', error.statusCode);
        }
    }
    
    /**
     * Get all subskala by test ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllSubskalaByTestId(req, res) {
        try {
            const testId = req.params.testId;
            
            const subskala = await testService.getAllSubskalaByTestId(
                testId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Subskala list retrieved successfully', subskala);
        } catch (error) {
            console.error('Get subskala error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve subskala list', error.statusCode);
        }
    }
    
    /**
     * Get all questions by subskala ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllQuestionBySubskalaId(req, res) {
        try {
            const subskalaId = req.params.subskalaId;
            
            const questions = await testService.getAllQuestionBySubskalaId(
                subskalaId,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Questions retrieved successfully', questions);
        } catch (error) {
            console.error('Get questions error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve questions', error.statusCode);
        }
    }
    
    /**
     * Update subskala
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateSubskala(req, res) {
        try {
            const subskalaId = req.params.subskalaId;
            const { 
                name, 
                description1, 
                minValue1, 
                maxValue1, 
                description2, 
                minValue2, 
                maxValue2, 
                description3, 
                minValue3, 
                maxValue3 
            } = req.body;
            
            const subskalaData = {
                name,
                description1,
                minValue1,
                maxValue1,
                description2,
                minValue2,
                maxValue2,
                description3,
                minValue3,
                maxValue3
            };
            
            const updatedSubskala = await testService.updateSubskala(
                subskalaId,
                subskalaData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Subskala updated successfully', updatedSubskala);
        } catch (error) {
            console.error('Update subskala error:', error);
            return this.sendError(res, error.message || 'Failed to update subskala', error.statusCode);
        }
    }
    
    /**
     * Update question
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateQuestion(req, res) {
        try {
            const questionId = req.params.questionId;
            const { text, option1Value, option2Value, option3Value } = req.body;
            
            const questionData = {
                text,
                option1Value,
                option2Value,
                option3Value
            };
            
            const updatedQuestion = await testService.updateQuestion(
                questionId,
                questionData,
                req.user.id,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Question updated successfully', updatedQuestion);
        } catch (error) {
            console.error('Update question error:', error);
            return this.sendError(res, error.message || 'Failed to update question', error.statusCode);
        }
    }
    
    /**
     * Get all test results by test ID (Admin & SuperAdmin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getAllTestResultsByTestId(req, res) {
        try {
            const testId = req.params.testId;
            
            const results = await testService.getAllTestResultsByTestId(
                testId,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Test results retrieved successfully', results);
        } catch (error) {
            console.error('Get test results error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve test results', error.statusCode);
        }
    }
    
    /**
     * Get test result for admin
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getTestResultForAdmin(req, res) {
        try {
            const resultId = req.params.resultId;
            
            const result = await testService.getTestResultForAdmin(
                resultId,
                req.user.role
            );
            
            return this.sendSuccess(res, 'Test result retrieved successfully', result);
        } catch (error) {
            console.error('Get test result error:', error);
            return this.sendError(res, error.message || 'Failed to retrieve test result', error.statusCode);
        }
    }
    
    /**
     * Start a test
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async startTest(req, res) {
        try {
            const testId = req.params.testId;
            
            const test = await testService.startTest(
                testId,
                req.user.id
            );
            
            return this.sendSuccess(res, 'Test started successfully', test);
        } catch (error) {
            console.error('Start test error:', error);
            return this.sendError(res, error.message || 'Failed to start test', error.statusCode);
        }
    }
}

module.exports = new TestController();