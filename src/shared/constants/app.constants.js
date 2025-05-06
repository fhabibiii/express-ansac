/**
 * Application Constants
 * Contains constants used throughout the application
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  VALIDATION_ERROR: 422, // Added explicit VALIDATION_ERROR constant
  INTERNAL_SERVER_ERROR: 500
};

// User Roles
const USER_ROLES = {
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
  USER_SELF: 'USER_SELF',
  USER_PARENT: 'USER_PARENT'
};

// Blog Status
const BLOG_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

// JWT Configuration
const JWT = {
  ACCESS_TOKEN_EXPIRES_IN: '1d',
  REFRESH_TOKEN_EXPIRES_IN: '7d'
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10
};

// File Upload Limits
const FILE_UPLOAD = {
  IMAGE_MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  UPLOAD_DIR: 'public/uploads/'
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  BLOG_STATUS,
  JWT,
  PAGINATION,
  FILE_UPLOAD
};