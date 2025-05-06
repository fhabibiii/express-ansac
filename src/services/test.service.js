/**
 * Test Service
 * Contains all business logic related to tests, subskala, questions, and test results
 */

const prisma = require('../../prisma/client');
const { HTTP_STATUS } = require('../shared/constants/app.constants');

class TestService {
  /**
   * Create a new test
   * @param {Object} testData - Test data (title, shortDesc, longDesc, minAge, maxAge, target)
   * @returns {Promise<Object>} - Created test object
   */
  async createTest(testData) {
    const { title, shortDesc, longDesc, minAge, maxAge, target } = testData;

    return await prisma.test.create({
      data: {
        title,
        shortDesc,
        longDesc,
        minAge,
        maxAge,
        target
      },
      select: {
        id: true,
        title: true,
        shortDesc: true,
        longDesc: true,
        minAge: true,
        maxAge: true,
        target: true,
        status: true,
      },
    });
  }

  /**
   * Create a new subskala
   * @param {Object} subskalaData - Subskala data
   * @returns {Promise<Object>} - Created subskala object
   */
  async createSubskala(subskalaData) {
    const { 
      testId, name, 
      description1, minValue1, maxValue1, 
      description2, minValue2, maxValue2, 
      description3, minValue3, maxValue3 
    } = subskalaData;

    return await prisma.subskala.create({
      data: {
        testId,
        name,
        label1: "Normal", description1, minValue1, maxValue1,
        label2: "Borderline", description2, minValue2, maxValue2,
        label3: "Abnormal", description3, minValue3, maxValue3
      }
    });
  }

  /**
   * Create a new question
   * @param {Object} questionData - Question data
   * @returns {Promise<Object>} - Created question object
   */
  async createQuestion(questionData) {
    const { subskalaId, text, option1Value, option2Value, option3Value } = questionData;

    return await prisma.question.create({
      data: {
        subskalaId,
        text,
        option1Label: "Tidak Benar", option1Value,
        option2Label: "Agak Benar", option2Value,
        option3Label: "Benar", option3Value
      }
    });
  }

  /**
   * Save question order permanently
   * @param {number} testId - Test ID
   * @returns {Promise<Object>} - Result of operation
   */
  async saveQuestionOrder(testId) {
    // Check if question order already exists
    const existingOrder = await prisma.questionOrder.findFirst({
      where: { testId: parseInt(testId) }
    });

    if (existingOrder) {
      throw new Error("Question order for this test has already been saved.");
    }

    const questions = await prisma.question.findMany({
      where: {
        subskala: {
          testId: parseInt(testId),
        },
      },
      select: {
        id: true,
      },
    });

    if (!questions.length) {
      throw new Error("No questions found for this test.");
    }

    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

    await prisma.questionOrder.createMany({
      data: shuffledQuestions.map((q, index) => ({
        testId,
        questionId: q.id,
        order: index + 1,
      })),
    });

    return { message: "Question order saved successfully." };
  }

  /**
   * Get all tests based on user role
   * @param {string} role - User role
   * @returns {Promise<Array>} - List of tests
   */
  async getAllTests(role) {
    if (role === 'ADMIN') {
      // Admin can only see PENDING and REJECTED tests
      return await prisma.test.findMany({
        where: {
          status: {
            in: ['PENDING', 'REJECTED']
          }
        },
        select: {
          id: true,
          title: true,
          shortDesc: true,
          longDesc: true,
          minAge: true,
          maxAge: true,
          target: true,
          status: true,
        },
      });
    } else if (role === 'SUPERADMIN') {
      // SuperAdmin can see all tests
      return await prisma.test.findMany();
    }
    
    throw new Error("Access denied. Your role cannot access this function.");
  }

  /**
   * Get test by ID
   * @param {number} testId - Test ID
   * @param {string} role - User role
   * @returns {Promise<Object>} - Test object
   */
  async getTestById(testId, role) {
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) }
    });

    if (!test) {
      throw new Error("Test ID not found");
    }

    // Admin can only access PENDING or REJECTED tests
    if (role === "ADMIN" && !["PENDING", "REJECTED"].includes(test.status)) {
      throw new Error("Access denied for this test");
    }

    return {
      id: test.id,
      title: test.title,
      shortDesc: test.shortDesc,
      longDesc: test.longDesc,
      minAge: test.minAge,
      maxAge: test.maxAge,
      target: test.target,
      status: test.status
    };
  }

  /**
   * Get all subskala by test ID
   * @param {number} testId - Test ID
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<Array>} - List of subskala
   */
  async getAllSubskalaByTestId(testId, userId, role) {
    try {
      const test = await prisma.test.findUnique({
        where: { id: parseInt(testId) },
        include: { subskala: true }
      });

      if (!test) {
        const error = new Error("Test ID not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Admin can only access subskala from tests that are not APPROVED
      if (role === "ADMIN" && test.status === "APPROVED") {
        const error = new Error("Access denied for this test status");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      if (!test.subskala.length) {
        const error = new Error("No subskala found for this test ID");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return test.subskala;
    } catch (error) {
      if (!error.statusCode) error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  /**
   * Get all questions by subskala ID
   * @param {number} subskalaId - Subskala ID
   * @param {number} userId - User ID
   * @param {string} role - User role 
   * @returns {Promise<Array>} - List of questions
   */
  async getAllQuestionBySubskalaId(subskalaId, userId, role) {
    try {
      const subskala = await prisma.subskala.findUnique({
        where: { id: parseInt(subskalaId) },
        include: { 
          questions: true,
          test: true,
        }
      });

      if (!subskala) {
        const error = new Error("Subskala ID not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Admin can't access questions from APPROVED tests
      if (role === "ADMIN" && subskala.test.status === "APPROVED") {
        const error = new Error("Access denied for this question");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      if (!subskala.questions.length) {
        const error = new Error("No questions found for this subskala ID");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return subskala.questions;
    } catch (error) {
      if (!error.statusCode) error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  /**
   * Get test result by ID (admin view)
   * @param {number} testResultId - Test result ID
   * @returns {Promise<Object>} - Formatted test result
   */
  async getTestResultAdmin(testResultId) {
    const testResult = await prisma.testResult.findUnique({
      where: { id: parseInt(testResultId) },
      include: {
        subskalaResults: {
          include: {
            subskala: true
          }
        },
        test: true,
        user: true
      }
    });

    if (!testResult) {
      throw new Error("Test result not found.");
    }

    const formattedResults = testResult.subskalaResults.map(result => {
      let category;
      if (result.score >= result.subskala.minValue3) {
        category = result.subskala.label3;
      } else if (result.score >= result.subskala.minValue2) {
        category = result.subskala.label2;
      } else {
        category = result.subskala.label1;
      }
      
      return {
        subskala: result.subskala.name,
        score: result.score,
        category,
        description: category === result.subskala.label3 ? result.subskala.description3 :
                     category === result.subskala.label2 ? result.subskala.description2 :
                     result.subskala.description1
      };
    });

    return {
      testResultId: testResult.id,
      title: testResult.test.title,
      createdAt: testResult.createdAt,
      user: {
        id: testResult.user.id,
        name: testResult.user.name,
        email: testResult.user.email
      },
      results: formattedResults
    };
  }

  /**
   * Get all test results by test ID
   * @param {number} testId - Test ID
   * @param {string} role - User role
   * @returns {Promise<Array>} - List of formatted test results
   */
  async getAllTestResultsByTestId(testId, role) {
    try {
      // Only allow admin and superadmin
      if (role !== 'ADMIN' && role !== 'SUPERADMIN') {
        const error = new Error("Access denied for this function");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      const test = await prisma.test.findUnique({
        where: { id: parseInt(testId) }
      });

      if (!test) {
        const error = new Error("Test ID not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      const testResults = await prisma.testResult.findMany({
        where: { testId: parseInt(testId) },
        include: {
          user: true,
          subskalaResults: {
            include: {
              subskala: true
            }
          }
        }
      });

      if (!testResults.length) {
        const error = new Error("No test results found for this test ID");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      return testResults.map(testResult => ({
        id: testResult.id,
        userId: testResult.userId,
        testId: testResult.testId,
        createdAt: testResult.createdAt,
        user: {
          name: testResult.user.name,
          email: testResult.user.email,
          phoneNumber: testResult.user.phoneNumber
        },
        subskalaResults: testResult.subskalaResults.map(result => {
          let category;
          if (result.score >= result.subskala.minValue3) {
            category = result.subskala.label3;
          } else if (result.score >= result.subskala.minValue2) {
            category = result.subskala.label2;
          } else {
            category = result.subskala.label1;
          }
          return {
            name: result.subskala.name,
            score: result.score,
            category,
            description: category === result.subskala.label3 ? result.subskala.description3 :
                         category === result.subskala.label2 ? result.subskala.description2 :
                         result.subskala.description1
          };
        })
      }));
    } catch (error) {
      if (!error.statusCode) error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  /**
   * Edit test by ID
   * @param {number} testId - Test ID
   * @param {string} role - User role
   * @param {Object} testData - Test data to update
   * @returns {Promise<Object>} - Updated test
   */
  async editTest(testId, role, testData) {
    const { title, shortDesc, longDesc, minAge, maxAge, target } = testData;
    
    // Check if test exists
    const test = await prisma.test.findUnique({
      where: { id: parseInt(testId) }
    });

    if (!test) {
      throw new Error("Test ID not found");
    }

    // Admin can't edit APPROVED tests
    if (role === 'ADMIN' && test.status === 'APPROVED') {
      throw new Error("Cannot edit an approved test");
    }

    // Update test
    return await prisma.test.update({
      where: { id: parseInt(testId) },
      data: {
        title: title || test.title,
        shortDesc: shortDesc || test.shortDesc,
        longDesc: longDesc || test.longDesc,
        minAge: minAge !== undefined ? minAge : test.minAge,
        maxAge: maxAge !== undefined ? maxAge : test.maxAge,
        target: target || test.target
      }
    });
  }

  /**
   * Update subskala
   * @param {number} subskalaId - Subskala ID 
   * @param {Object} subskalaData - Subskala data to update
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<Object>} - Updated subskala
   */
  async updateSubskala(subskalaId, subskalaData, userId, role) {
    try {
      const { 
        name, 
        description1, minValue1, maxValue1,
        description2, minValue2, maxValue2,
        description3, minValue3, maxValue3
      } = subskalaData;

      // Check if subskala exists
      const subskala = await prisma.subskala.findUnique({
        where: { id: parseInt(subskalaId) },
        include: { test: true }
      });

      if (!subskala) {
        const error = new Error("Subskala ID not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Admin can't edit subskala of APPROVED tests
      if (role === 'ADMIN' && subskala.test.status === 'APPROVED') {
        const error = new Error("Cannot edit subskala of an approved test");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Update subskala
      return await prisma.subskala.update({
        where: { id: parseInt(subskalaId) },
        data: {
          name: name || subskala.name,
          description1: description1 || subskala.description1,
          minValue1: minValue1 !== undefined ? minValue1 : subskala.minValue1,
          maxValue1: maxValue1 !== undefined ? maxValue1 : subskala.maxValue1,
          description2: description2 || subskala.description2,
          minValue2: minValue2 !== undefined ? minValue2 : subskala.minValue2,
          maxValue2: maxValue2 !== undefined ? maxValue2 : subskala.maxValue2,
          description3: description3 || subskala.description3,
          minValue3: minValue3 !== undefined ? minValue3 : subskala.minValue3,
          maxValue3: maxValue3 !== undefined ? maxValue3 : subskala.maxValue3
        }
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  /**
   * Update question
   * @param {number} questionId - Question ID
   * @param {Object} questionData - Question data to update
   * @param {number} userId - User ID
   * @param {string} role - User role
   * @returns {Promise<Object>} - Updated question 
   */
  async updateQuestion(questionId, questionData, userId, role) {
    try {
      const { text, option1Value, option2Value, option3Value } = questionData;

      // Check if question exists
      const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
        include: { subskala: { include: { test: true } } }
      });

      if (!question) {
        const error = new Error("Question ID not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Admin can't edit questions of APPROVED tests
      if (role === 'ADMIN' && question.subskala.test.status === 'APPROVED') {
        const error = new Error("Cannot edit question of an approved test");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Update question
      return await prisma.question.update({
        where: { id: parseInt(questionId) },
        data: {
          text: text || question.text,
          option1Value: option1Value !== undefined ? option1Value : question.option1Value,
          option2Value: option2Value !== undefined ? option2Value : question.option2Value,
          option3Value: option3Value !== undefined ? option3Value : question.option3Value
        }
      });
    } catch (error) {
      if (!error.statusCode) error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }

  /* ======== USER-FACING METHODS ======== */

  /**
   * Submit test answers and calculate scores
   * @param {Object} submissionData - Submission data
   * @returns {Promise<Object>} - Test result
   */
  async submitAnswers(submissionData) {
    const { userId, testId, answers } = submissionData;

    // Check if test exists and is APPROVED
    const testExists = await prisma.test.findUnique({
      where: { id: testId }
    });

    if (!testExists) {
      throw new Error("Test ID not found");
    }

    if (testExists.status !== "APPROVED") {
      throw new Error("You can only submit answers for approved tests");
    }

    // Calculate scores per subskala
    let subskalaScores = {};

    for (const answer of answers) {
      const question = await prisma.question.findUnique({ 
        where: { id: answer.questionId } 
      });
      
      if (!question) continue;
      
      const subskalaId = question.subskalaId;
      subskalaScores[subskalaId] = (subskalaScores[subskalaId] || 0) + answer.value;
    }

    // Create test result with subskala results
    return await prisma.testResult.create({
      data: {
        userId,
        testId,
        subskalaResults: {
          create: Object.entries(subskalaScores).map(([subskalaId, score]) => ({
            subskalaId: parseInt(subskalaId),
            score
          }))
        }
      },
      include: {
        subskalaResults: true
      }
    });
  }

  /**
   * Get test result by ID for a specific user
   * @param {number} userId - User ID
   * @param {number} testResultId - Test result ID
   * @returns {Promise<Object>} - Formatted test result
   */
  async getTestResultById(userId, testResultId) {
    const testResult = await prisma.testResult.findUnique({
      where: { id: parseInt(testResultId) },
      include: {
        subskalaResults: {
          include: {
            subskala: true
          }
        },
        test: true,
        user: true
      }
    });

    if (!testResult) {
      throw new Error("Test result not found.");
    }

    // Verify ownership
    if (testResult.userId !== parseInt(userId)) {
      throw new Error("You can only view your own test results");
    }

    const formattedResults = testResult.subskalaResults.map(result => {
      let category;
      if (result.score >= result.subskala.minValue3) {
        category = result.subskala.label3;
      } else if (result.score >= result.subskala.minValue2) {
        category = result.subskala.label2;
      } else {
        category = result.subskala.label1;
      }
      
      return {
        subskala: result.subskala.name,
        score: result.score,
        category,
        description: category === result.subskala.label3 ? result.subskala.description3 :
                     category === result.subskala.label2 ? result.subskala.description2 :
                     result.subskala.description1
      };
    });

    return {
      testResultId: testResult.id,
      title: testResult.test.title,
      createdAt: testResult.createdAt,
      results: formattedResults
    };
  }

  /**
   * Get all test results for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} - List of test results
   */
  async getAllTestResults(userId) {
    const testResults = await prisma.testResult.findMany({
      where: { userId: parseInt(userId) },
      include: {
        subskalaResults: {
          include: {
            subskala: true
          }
        },
        test: true
      }
    });

    if (!testResults.length) {
      throw new Error("No test results found for this user.");
    }

    return testResults.map(testResult => ({
      testResultId: testResult.id,
      testId: testResult.testId,
      title: testResult.test.title,
      createdAt: testResult.createdAt,
      userId: testResult.userId
    }));
  }

  /**
   * Get all tests available for a user based on age and role
   * @param {Object} userData - User data with dateOfBirth and role
   * @returns {Promise<Array>} - List of tests
   */
  async getAllTestsByAge(userData) {
    const { dateOfBirth, role } = userData;
    
    // Calculate user age
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();

    // Get tests matching age and target
    const tests = await prisma.test.findMany({
      where: {
        status: 'APPROVED',
        minAge: { lte: age },
        maxAge: { gte: age },
        target: role === 'USER_SELF' ? 'SELF' : 'PARENT'
      },
      select: {
        id: true,
        title: true,
        shortDesc: true,
        longDesc: true,
        minAge: true,
        maxAge: true,
      },
    });

    if (!tests.length) {
      throw new Error("No tests available for your age and role.");
    }

    return tests;
  }

  /**
   * Start a test
   * @param {number} testId - Test ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Test data with questions
   */
  async startTest(testId, userId) {
    try {
      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        const error = new Error("User not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check if test exists
      const test = await prisma.test.findUnique({
        where: { id: parseInt(testId) }
      });

      if (!test) {
        const error = new Error("Test ID not found");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Check if test is approved
      if (test.status !== 'APPROVED') {
        const error = new Error("This test is not approved yet");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Check if role matches target
      const role = user.role;
      if ((role === 'USER_SELF' && test.target !== 'SELF') || 
          (role === 'USER_PARENT' && test.target !== 'PARENT')) {
        const error = new Error("Your role does not match the target of this test");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Calculate user age
      const today = new Date();
      const birthDate = new Date(user.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();

      // Check if age is within test range
      if (age < test.minAge || age > test.maxAge) {
        const error = new Error("Your age does not match the age range of this test");
        error.statusCode = HTTP_STATUS.FORBIDDEN;
        throw error;
      }

      // Get ordered questions
      const questionOrders = await prisma.questionOrder.findMany({
        where: { testId: parseInt(testId) },
        orderBy: { order: 'asc' },
        include: { question: true }
      });

      if (!questionOrders.length) {
        const error = new Error("No questions found for this test");
        error.statusCode = HTTP_STATUS.NOT_FOUND;
        throw error;
      }

      // Format test data
      return {
        test: {
          id: test.id,
          title: test.title,
          shortDesc: test.shortDesc,
          longDesc: test.longDesc
        },
        questions: questionOrders.map(order => ({
          id: order.question.id,
          text: order.question.text,
          options: [
            { label: order.question.option1Label, value: order.question.option1Value },
            { label: order.question.option2Label, value: order.question.option2Value },
            { label: order.question.option3Label, value: order.question.option3Value }
          ]
        }))
      };
    } catch (error) {
      if (!error.statusCode) error.statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      throw error;
    }
  }
}

module.exports = new TestService();