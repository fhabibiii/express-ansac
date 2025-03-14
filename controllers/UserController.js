const express = require("express");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const prisma = require("../prisma/client");

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
        // Periksa apakah id user yang melakukan request sama dengan id yang ingin dicari
        if (req.userId !== Number(id)) {
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
                phoneNumber: true,
                dateOfBirth: true,
                role: true,
            },
        });

        // Jika account tidak ditemukan
        if (!account) {
            return res.status(404).json({
                success: false,
                message: `Account with ID ${id} not found`,
            });
        }

        //send response
        res.status(200).send({
            success: true,
            message: `Get your account By ID :${id}`,
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
        // Periksa apakah id user yang melakukan request sama dengan id yang ingin diupdate
        if (req.userId !== Number(id)) {
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
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
                phoneNumber: true,
                dateOfBirth: true,
                role: true,
            },
        });

        // Return response json
        res.status(200).send({
            success: true,
            message: `Your account with id: ${id} updated successfully`,
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
        // Periksa apakah id user yang melakukan request sama dengan id yang ingin didelete
        if (req.userId !== Number(id)) {
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
            message: `Your account with id: ${id} deleted successfully`,
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Internal server error",
        });
    }
};

const checkPassword = async (req, res) => {
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

    const { userId, oldPassword } = req.body;

    try {
        // Cari user berdasarkan userId
        const user = await prisma.user.findUnique({
            where: {
                id: Number(userId),
            },
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Periksa password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        // Jika password tidak cocok
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password",
            });
        }

        // Kembalikan respons sukses
        res.status(200).json({
            success: true,
            message: "Password is correct",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { 
    updateAccount,
    deleteAccount,
    findAccountById,
    checkPassword,
};