//import express
const express = require("express");

// Import validationResult from express-validator
const { validationResult } = require("express-validator");

//import prisma client
const prisma = require("../prisma/client");

//function create test
const createTest = async (req, res) => {
    try {
        // Cari user berdasarkan req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: req.userId,
            },
        });

        // Periksa apakah user memiliki role SUPERADMIN atau ADMIN
        if (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN') {
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

        // Buat test baru
        const test = await prisma.test.create({
            data: {
                title: req.body.title,
                shortDesc: req.body.shortDesc,
                longDesc: req.body.longDesc,
                minAge: req.body.minAge,
                maxAge: req.body.maxAge,
                target: req.body.target,
            },
        });

        // Kembalikan response ke pengguna
        return res.json({
            success: true,
            message: "Test created successfully",
            data: test,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

module.exports = { createTest };