const express = require("express");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");

//function findAdmins
const findAdmins = async (req, res) => {
    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Cari semua user dengan role ADMIN
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
            },
        });

        // Kembalikan respons sukses dengan data admin
        res.status(200).json({
            success: true,
            data: admins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//function findUsers
const findUsers = async (req, res) => {
    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Cari semua user dengan role USER_PARENT atau USER_SELF
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
            },
        });

        // Kembalikan respons sukses dengan data user
        res.status(200).json({
            success: true,
            data: users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//function findSuperAdmins
const findSuperAdmins = async (req, res) => {
    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Cari semua user dengan role SUPERADMIN
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
            },
        });

        // Kembalikan respons sukses dengan data superadmin
        res.status(200).json({
            success: true,
            data: superadmins,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

//function createAccount
const createAccount = async (req, res) => {
    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

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

        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Insert data
        const newUser = await prisma.user.create({
            data: {
                username: req.body.username,
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                phoneNumber: req.body.phoneNumber,
                dateOfBirth: new Date(req.body.dateOfBirth),
                role: req.body.role,
            },
        });

        // Return response json
        res.status(201).send({
            success: true,
            message: "User created successfully",
            data: newUser,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

//function findAccountById
const findAccountById = async (req, res) => {
    //get ID from params
    const { id } = req.params;
    
    // Periksa apakah ID adalah angka
    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
    }

    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        //get account by ID
        const account = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                role: true,
                phoneNumber: true,
                dateOfBirth: true,
            },
        });

        // Jika account tidak ditemukan
        if (!account) {
            return res.status(404).json({
                success: false,
                message: `account with ID ${id} not found`,
            });
        }

        //send response
        res.status(200).send({
            success: true,
            message: `Get account By ID :${id}`,
            data: account,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

//function updateAccount
const updateAccount = async (req, res) => {
    //get ID from params
    const { id } = req.params;
    
    // Periksa apakah ID adalah angka
    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
    }

    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

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

        // Periksa apakah user dengan ID tersebut ada
        const existingUser = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: `User with id: ${id} not found`,
            });
        }

        // Hash password jika ada perubahan password
        let hashedPassword;
        if (req.body.password) {
            hashedPassword = await bcrypt.hash(req.body.password, 10);
        }

        // Update data
        const updatedUser = await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                username: req.body.username || existingUser.username,
                name: req.body.name || existingUser.name,
                email: req.body.email || existingUser.email,
                password: hashedPassword ? hashedPassword : existingUser.password,
                phoneNumber: req.body.phoneNumber || existingUser.phoneNumber,
                dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : existingUser.dateOfBirth,
                role: req.body.role || existingUser.role,
            },
        });

        // Return response json
        res.status(200).send({
            success: true,
            message: `User with id: ${id} updated successfully`,
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

const deleteAccount = async (req, res) => {
    //get ID from params
    const { id } = req.params;

    // Periksa apakah ID adalah angka
    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID format",
        });
    }

    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Periksa apakah user dengan ID tersebut ada
        const userToDelete = await prisma.user.findUnique({
            where: {
                id: Number(id),
            },
        });

        if (!userToDelete) {
            return res.status(404).json({
                success: false,
                message: `User with id: ${id} not found`,
            });
        }

        //delete user
        await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });

        //send response
        res.status(200).send({
            success: true,
            message: `User with id: ${id} deleted successfully`,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

//function acceptTest
const acceptTest = async (req, res) => {
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

        // Periksa apakah user memiliki role SUPERADMIN
        if (user.role !== 'SUPERADMIN') {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const { testId } = req.params;
        const { status } = req.body;

        // Periksa apakah testId tersedia
        const test = await prisma.test.findUnique({
            where: { id: parseInt(testId) }
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test ID not found",
            });
        }

        // Update status test
        const updatedTest = await prisma.test.update({
            where: { id: parseInt(testId) },
            data: { status }
        });

        res.status(200).json({
            success: true,
            message: `Test status updated to ${status}`,
            data: updatedTest
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
    createAccount,
    updateAccount,
    deleteAccount,
    findAccountById,
    findAdmins,
    findUsers,
    findSuperAdmins,
    acceptTest  
};