const express = require("express");
const { validationResult } = require("express-validator");
const prisma = require("../prisma/client");


/* ======================================================================================================================
                                                    FOR ADMIN AND SUPERADMIN 
====================================================================================================================== */


// Create Test
const createTest = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role ADMIN atau SUPERADMIN
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { title, shortDesc, longDesc, minAge, maxAge, target } = req.body;

        const newTest = await prisma.test.create({
            data: {
                title,
                shortDesc,
                longDesc,
                minAge,
                maxAge,
                target
            }
        });

        res.status(201).json({
            success: true,
            data: newTest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create Subskala
const createSubskala = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role ADMIN atau SUPERADMIN
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { testId, name, description1, minValue1, maxValue1, description2, minValue2, maxValue2, description3, minValue3, maxValue3 } = req.body;

        // Periksa apakah testId tersedia
        const test = await prisma.test.findUnique({
            where: { id: testId },
            include: { subskala: true }
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test ID not found",
            });
        }

        // Periksa apakah jumlah subskala pada testId <= 5
        if (test.subskala.length >= 5) {
            return res.status(400).json({
                success: false,
                message: "This test already has 5 subskala, cannot add more.",
            });
        }

        const newSubskala = await prisma.subskala.create({
            data: {
                testId,
                name,
                label1: "Normal", description1, minValue1, maxValue1,
                label2: "Borderline", description2, minValue2, maxValue2,
                label3: "Abnormal", description3, minValue3, maxValue3
            }
        });

        res.status(201).json({
            success: true,
            data: newSubskala
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Create Question
const createQuestion = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role ADMIN atau SUPERADMIN
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { subskalaId, text, option1Value, option2Value, option3Value } = req.body;

        // Periksa apakah subskalaId tersedia
        const subskala = await prisma.subskala.findUnique({
            where: { id: subskalaId },
            include: { questions: true }
        });

        if (!subskala) {
            return res.status(404).json({
                success: false,
                message: "Subskala ID not found",
            });
        }

        if (subskala.questions.length >= 5) {
            return res.status(400).json({
                success: false,
                message: "Subskala ini sudah memiliki 5 soal, tidak bisa menambahkan lebih banyak."
            });
        }

        const newQuestion = await prisma.question.create({
            data: {
                subskalaId,
                text,
                option1Label: "Tidak Benar", option1Value,
                option2Label: "Agak Benar", option2Value,
                option3Label: "Benar", option3Value
            }
        });

        res.status(201).json({
            success: true,
            data: newQuestion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Save Question Order Permanently
const saveQuestionOrder = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role ADMIN atau SUPERADMIN
        if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { testId } = req.body;

        // Periksa apakah testId sudah ada di tabel QuestionOrder
        const existingOrder = await prisma.questionOrder.findFirst({
            where: { testId: parseInt(testId) }
        });

        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: "Question order for this test has already been saved."
            });
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
            return res.status(404).json({
                success: false,
                message: "No questions found for this test."
            });
        }

        const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

        await prisma.questionOrder.createMany({
            data: shuffledQuestions.map((q, index) => ({
                testId,
                questionId: q.id,
                order: index + 1,
            })),
        });

        res.status(201).json({
            success: true,
            message: "Question order saved successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


/* ======================================================================================================================
                                                FOR USER_SELF AND USER_PARENT 
====================================================================================================================== */


// Submit Answers and Calculate Scores
const submitAnswers = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { userId, testId, answers } = req.body;

        // Periksa apakah userId sama dengan req.userId
        if (userId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only submit answers for your own account",
            });
        }

        // Periksa apakah userId tersedia
        const userExists = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: "User ID not found",
            });
        }

        // Periksa apakah testId tersedia
        const testExists = await prisma.test.findUnique({
            where: { id: testId }
        });

        if (!testExists) {
            return res.status(404).json({
                success: false,
                message: "Test ID not found",
            });
        }

        let subskalaScores = {};

        for (const answer of answers) {
            const question = await prisma.question.findUnique({ where: { id: answer.questionId } });
            const subskalaId = question.subskalaId;
            subskalaScores[subskalaId] = (subskalaScores[subskalaId] || 0) + answer.value;
        }

        const testResult = await prisma.testResult.create({
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

        res.status(201).json({
            success: true,
            message: "Answers submitted successfully.",
            data: testResult
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get Test Result
const getTestResultbyId = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { userId, testResultId } = req.params;

        // Periksa apakah userId sama dengan req.userId
        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own test results",
            });
        }

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
            return res.status(404).json({
                success: false,
                message: "Test result not found."
            });
        }

        // Periksa apakah testResult milik user yang melakukan request
        if (testResult.userId !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own test results",
            });
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

        res.status(200).json({
            success: true,
            message: "Get test result success.",
            data: {
                testResultId: testResult.id,
                title: testResult.test.title,
                createdAt: testResult.createdAt,
                results: formattedResults
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Test Results for a User
const getAllTestResults = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { userId } = req.params;

        // Periksa apakah userId sama dengan req.userId
        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own test results",
            });
        }

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
            return res.status(404).json({
                success: false,
                message: "No test results found for this user."
            });
        }

        const formattedResults = testResults.map(testResult => ({
            testResultId: testResult.id,
            testId: testResult.testId,
            title: testResult.test.title,
            createdAt: testResult.createdAt,
            userId: testResult.userId
        }));

        res.status(200).json({
            success: true,
            message: "Get all test results success.",
            data: formattedResults
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Get All Tests by User Age
const getAllTestByAge = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { userId } = req.params;

        // Periksa apakah userId sama dengan req.userId
        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only view tests for your own account",
            });
        }

        // Cari user berdasarkan userId
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User ID not found",
            });
        }

        // Hitung umur user
        const today = new Date();
        const birthDate = new Date(user.dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();

        // Ambil tes yang sesuai dengan umur dan target
        const tests = await prisma.test.findMany({
            where: {
                status: 'APPROVED',
                minAge: { lte: age },
                maxAge: { gte: age },
                target: user.role === 'USER_SELF' ? 'SELF' : 'PARENT'
            }
        });

        if (!tests.length) {
            return res.status(404).json({
                success: false,
                message: "No tests available for your age and role."
            });
        }

        res.status(200).json({
            success: true,
            message: "Get tests by age success.",
            data: tests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Start Test
const startTest = async (req, res) => {
    // Periksa hasil validasi
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Jika ada error, kembalikan error ke pengguna
        return res.status(422).json({
            success: false,
            message: "Validation error",
            errors: errors.array(),
        });
    }

    try {
        const { userId, testId } = req.params;

        // Periksa apakah userId sama dengan req.userId
        if (parseInt(userId) !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You can only start tests for your own account",
            });
        }

        // Cari user berdasarkan userId
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User ID not found",
            });
        }

        // Cari test berdasarkan testId
        const test = await prisma.test.findUnique({
            where: { id: parseInt(testId) }
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test ID not found",
            });
        }

        // Periksa apakah status test adalah APPROVED
        if (test.status !== 'APPROVED') {
            return res.status(403).json({
                success: false,
                message: "This test is not approved yet",
            });
        }

        // Periksa apakah role user sama dengan target test
        if ((user.role === 'USER_SELF' && test.target !== 'SELF') || (user.role === 'USER_PARENT' && test.target !== 'PARENT')) {
            return res.status(403).json({
                success: false,
                message: "Your role does not match the target of this test",
            });
        }

        // Hitung umur user
        const today = new Date();
        const birthDate = new Date(user.dateOfBirth);
        const age = today.getFullYear() - birthDate.getFullYear();

        // Periksa apakah umur user sesuai dengan rentang umur test
        if (age < test.minAge || age > test.maxAge) {
            return res.status(403).json({
                success: false,
                message: "Your age does not match the age range of this test",
            });
        }

        // Ambil urutan soal dari tabel QuestionOrder
        const questionOrders = await prisma.questionOrder.findMany({
            where: { testId: parseInt(testId) },
            orderBy: { order: 'asc' },
            include: { question: true }
        });

        if (!questionOrders.length) {
            return res.status(404).json({
                success: false,
                message: "No questions found for this test",
            });
        }

        // Format soal untuk dikirimkan
        const questions = questionOrders.map(order => ({
            id: order.question.id,
            text: order.question.text,
            options: [
                { label: order.question.option1Label, value: order.question.option1Value },
                { label: order.question.option2Label, value: order.question.option2Value },
                { label: order.question.option3Label, value: order.question.option3Value }
            ]
        }));

        res.status(200).json({
            success: true,
            message: "Test started successfully",
            data: questions
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
    createTest,
    createSubskala,
    createQuestion,
    saveQuestionOrder,
    submitAnswers,
    getTestResultbyId,
    getAllTestResults,
    getAllTestByAge,
    startTest
};