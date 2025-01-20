//import express
const express = require("express");

// Import validationResult from express-validator
const { validationResult } = require("express-validator");

//import bcrypt
const bcrypt = require("bcryptjs");

//import jwt
const jwt = require("jsonwebtoken");

//import prisma client
const prisma = require("../prisma/client");

//function login
const login = async (req, res) => {

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
        // Cari user berdasarkan username
        const user = await prisma.user.findUnique({
            where: {
                username: req.body.username,
            },
        });

        // Jika user tidak ditemukan
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        // Periksa password
        const isMatch = await bcrypt.compare(req.body.password, user.password);

        // Jika password tidak cocok
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
            });
        }

        // Buat token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Kembalikan respons sukses dengan token dan informasi user
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                username: user.username,
                name: user.name,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

module.exports = { login };