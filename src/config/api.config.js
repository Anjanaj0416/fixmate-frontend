/**
 * API Configuration
 * Contains all API URLs and endpoints
 */

// Base API URL - change based on environment
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google',
    VERIFY_TOKEN: '/auth/verify-token',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_2FA: '/auth/verify-2fa',
    ENABLE_2FA: '/auth/enable-2fa',
    DISABLE_2FA: '/auth/disable-2fa',
  },

  // User endpoints
  USER: {
    ME: '/users/me',
    BY_ID: (id) => `/users/${id}`,
    UPDATE_PROFILE: '/users/profile',
    UPDATE_IMAGE: '/users/profile-image',
    UPDATE_LOCATION: '/users/location',
    UPDATE_NOTIFICATION_SETTINGS: '/users/notification-settings',
    STATS: '/users/stats',
    SEARCH: '/users/search',
    NEARBY: '/users/nearby',
    REPORT: (id) => `/users/${id}/report`,
    BLOCK: (id) => `/users/${id}/block`,
  },

  // Worker endpoints
  WORKER: {
    LIST: '/workers',
    SEARCH: '/workers/search',
    BY_ID: (id) => `/workers/${id}`,
    STATS: '/workers/stats',
    UPDATE_PROFILE: '/workers/profile',
    ADD_PORTFOLIO: '/workers/portfolio',
    REMOVE_PORTFOLIO: (imageId) => `/workers/portfolio/${imageId}`,
    UPDATE_AVAILABILITY: '/workers/availability',
    REVIEWS: (id) => `/workers/${id}/reviews`,
    ADD_CERTIFICATION: '/workers/certifications',
    UPDATE_BANK_DETAILS: '/workers/bank-details',
  },

  // Booking endpoints
  BOOKING: {
    CREATE: '/bookings',
    LIST: '/bookings',
    BY_ID: (id) => `/bookings/${id}`,
    STATS: '/bookings/stats',
    UPDATE_STATUS: (id) => `/bookings/${id}/status`,
    ACCEPT: (id) => `/bookings/${id}/accept`,
    DECLINE: (id) => `/bookings/${id}/decline`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
    CREATE_QUOTE: (id) => `/bookings/${id}/quote`,
    UPDATE_PROGRESS: (id) => `/bookings/${id}/progress`,
  },

  // Review endpoints
  REVIEW: {
    CREATE: '/reviews',
    MY_REVIEWS: '/reviews/my-reviews',
    WORKER_REVIEWS: (workerId) => `/reviews/worker/${workerId}`,
    BY_ID: (id) => `/reviews/${id}`,
    UPDATE: (id) => `/reviews/${id}`,
    DELETE: (id) => `/reviews/${id}`,
    RESPOND: (id) => `/reviews/${id}/response`,
    MARK_HELPFUL: (id) => `/reviews/${id}/helpful`,
    FLAG: (id) => `/reviews/${id}/flag`,
  },

  // Chat endpoints
  CHAT: {
    SEND_MESSAGE: '/chat/messages',
    CONVERSATIONS: '/chat/conversations',
    CONVERSATION_BY_USER: (userId) => `/chat/conversations/${userId}`,
    MARK_READ: '/chat/messages/read',
    DELETE_MESSAGE: (id) => `/chat/messages/${id}`,
    UNREAD_COUNT: '/chat/unread-count',
    SEARCH: '/chat/search',
    ADD_REACTION: (id) => `/chat/messages/${id}/reaction`,
  },

  // Notification endpoints
  NOTIFICATION: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    SETTINGS: '/notifications/settings',
    UPDATE_SETTINGS: '/notifications/settings',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id) => `/notifications/${id}`,
    CLEAR_ALL: '/notifications/clear-all',
    SEND_PUSH: '/notifications/send',
  },

  // Payment endpoints
  PAYMENT: {
    CREATE: '/payments',
    LIST: '/payments',
    BY_ID: (id) => `/payments/${id}`,
    STATS: '/payments/stats',
    EARNINGS: '/payments/earnings',
    CONFIRM: (id) => `/payments/${id}/confirm`,
    REFUND: (id) => `/payments/${id}/refund`,
    PAYOUT: (id) => `/payments/${id}/payout`,
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/admin/analytics',
    USERS: '/admin/users',
    SUSPEND_USER: (id) => `/admin/users/${id}/suspend`,
    REACTIVATE_USER: (id) => `/admin/users/${id}/reactivate`,
    DELETE_USER: (id) => `/admin/users/${id}`,
    REVIEWS: '/admin/reviews',
    MODERATE_REVIEW: (id) => `/admin/reviews/${id}/moderate`,
    VERIFY_WORKER: (id) => `/admin/workers/${id}/verify`,
    BOOKINGS: '/admin/bookings',
  },

  // AI endpoints
  AI: {
    ANALYZE_IMAGE: '/ai/analyze-image',
    RECOMMEND_WORKERS: '/ai/recommend-workers',
    SUGGEST_CATEGORY: '/ai/suggest-category',
    ESTIMATE_COST: '/ai/estimate-cost',
    FEEDBACK: '/ai/feedback',
  },
};

// Google Maps API Key
export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'FixMate',
  APP_VERSION: '1.0.0',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_CURRENCY: 'LKR',
  DEFAULT_LOCATION: {
    lat: 7.8731,
    lng: 80.7718,
    name: 'Sri Lanka'
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  },
  BOOKING: {
    MAX_IMAGES: 5,
    MIN_DESCRIPTION_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 500,
  },
  REVIEW: {
    MIN_RATING: 1,
    MAX_RATING: 5,
    MIN_COMMENT_LENGTH: 10,
    MAX_COMMENT_LENGTH: 500,
  },
  SEARCH: {
    MAX_DISTANCE_KM: 50,
    DEFAULT_RADIUS_KM: 10,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  LOGOUT: 'Successfully logged out!',
  REGISTER: 'Successfully registered!',
  UPDATE: 'Successfully updated!',
  DELETE: 'Successfully deleted!',
  CREATE: 'Successfully created!',
  BOOKING_CREATED: 'Booking created successfully!',
  BOOKING_ACCEPTED: 'Booking accepted!',
  BOOKING_DECLINED: 'Booking declined!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  MESSAGE_SENT: 'Message sent!',
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  GOOGLE_MAPS_API_KEY,
  APP_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};