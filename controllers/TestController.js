const express = require("express");
const { validationResult } = require("express-validator");
const prisma = require("../prisma/client");

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
const getTestResult = async (req, res) => {
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

        const { userId, testId } = req.params;

        const testResult = await prisma.testResult.findFirst({
            where: { userId: parseInt(userId), testId: parseInt(testId) },
            include: {
                subskalaResults: {
                    include: {
                        subskala: true
                    }
                }
            }
        });

        if (!testResult) {
            return res.status(404).json({
                success: false,
                message: "Test result not found."
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

module.exports = {
    createTest,
    createSubskala,
    createQuestion,
    saveQuestionOrder,
    submitAnswers,
    getTestResult
};