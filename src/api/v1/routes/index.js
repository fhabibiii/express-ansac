/**
 * API Routes Index
 * Aggregates all API routes
 */

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const testRoutes = require('./test.routes');
const blogRoutes = require('./blog.routes');
const faqRoutes = require('./faq.routes');
const galleryRoutes = require('./gallery.routes');
const serviceRoutes = require('./service.routes');
const superAdminRoutes = require('./superadmin.routes');

// Register routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/tests', testRoutes);
router.use('/blogs', blogRoutes);
router.use('/faqs', faqRoutes);
router.use('/gallery', galleryRoutes);
router.use('/services', serviceRoutes);
router.use('/superadmin', superAdminRoutes);

// API information route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ANSAC API v1',
    apiVersion: 'v1',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/user',
      tests: '/api/v1/tests',
      blogs: '/api/v1/blogs',
      faqs: '/api/v1/faqs',
      gallery: '/api/v1/gallery',
      services: '/api/v1/services',
      superAdmin: '/api/v1/superadmin'
    }
  });
});

module.exports = router;