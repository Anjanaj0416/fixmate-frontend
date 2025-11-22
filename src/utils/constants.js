/**
 * Application Constants
 */

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  WORKER: 'worker',
  ADMIN: 'admin',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_WALLET: 'mobile_wallet',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_REQUEST: 'booking_request',
  BOOKING_ACCEPTED: 'booking_accepted',
  BOOKING_DECLINED: 'booking_declined',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  NEW_MESSAGE: 'new_message',
  NEW_REVIEW: 'new_review',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_SENT: 'payment_sent',
  QUOTE_RECEIVED: 'quote_received',
  SYSTEM: 'system',
};

// Service Categories
export const SERVICE_CATEGORIES = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: 'Wrench',
    description: 'Pipe repairs, installations, and maintenance',
    color: 'blue',
  },
  {
    id: 'electrical',
    name: 'Electrical',
    icon: 'Zap',
    description: 'Wiring, repairs, and installations',
    color: 'yellow',
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    icon: 'Hammer',
    description: 'Furniture, repairs, and woodwork',
    color: 'brown',
  },
  {
    id: 'painting',
    name: 'Painting',
    icon: 'Paintbrush',
    description: 'Interior and exterior painting',
    color: 'purple',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    icon: 'Sparkles',
    description: 'Home and office cleaning services',
    color: 'green',
  },
  {
    id: 'ac_repair',
    name: 'AC Repair',
    icon: 'Wind',
    description: 'AC installation and maintenance',
    color: 'cyan',
  },
  {
    id: 'appliance_repair',
    name: 'Appliance Repair',
    icon: 'Refrigerator',
    description: 'Repair of household appliances',
    color: 'red',
  },
  {
    id: 'pest_control',
    name: 'Pest Control',
    icon: 'Bug',
    description: 'Pest elimination and prevention',
    color: 'green',
  },
  {
    id: 'gardening',
    name: 'Gardening',
    icon: 'Leaf',
    description: 'Lawn care and landscaping',
    color: 'green',
  },
  {
    id: 'home_renovation',
    name: 'Home Renovation',
    icon: 'Home',
    description: 'Complete home renovation services',
    color: 'orange',
  },
  {
    id: 'roofing',
    name: 'Roofing',
    icon: 'Building',
    description: 'Roof repairs and installations',
    color: 'gray',
  },
  {
    id: 'locksmith',
    name: 'Locksmith',
    icon: 'Key',
    description: 'Lock repairs and key services',
    color: 'gold',
  },
];

// Work Progress Status
export const WORK_PROGRESS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  HALF_DONE: 'half_done',
  ALMOST_DONE: 'almost_done',
  COMPLETED: 'completed',
};

// Review Status
export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  FLAGGED: 'flagged',
  REMOVED: 'removed',
};

// Worker Verification Status
export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

// Availability Status
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline',
};

// Message Types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  LOCATION: 'location',
  AUDIO: 'audio',
};

// Days of Week
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

// Time Slots
export const TIME_SLOTS = [
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
];

// Rating Labels
export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

// Currency
export const CURRENCY = {
  CODE: 'LKR',
  SYMBOL: 'Rs.',
  NAME: 'Sri Lankan Rupee',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY hh:mm A',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  TIME_ONLY: 'hh:mm A',
};

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+94|0)?[0-9]{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  NAME: /^[a-zA-Z\s]{2,50}$/,
  NIC: /^([0-9]{9}[vVxX]|[0-9]{12})$/,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'fixmate_auth_token',
  USER_DATA: 'fixmate_user_data',
  FCM_TOKEN: 'fixmate_fcm_token',
  THEME: 'fixmate_theme',
  LANGUAGE: 'fixmate_language',
  RECENT_SEARCHES: 'fixmate_recent_searches',
  FAVORITES: 'fixmate_favorites',
};

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Theme Options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  RATING_HIGH: 'rating_high',
  RATING_LOW: 'rating_low',
  PRICE_HIGH: 'price_high',
  PRICE_LOW: 'price_low',
  DISTANCE: 'distance',
  POPULARITY: 'popularity',
};

// Filter Options
export const FILTER_OPTIONS = {
  ALL: 'all',
  VERIFIED: 'verified',
  TOP_RATED: 'top_rated',
  NEARBY: 'nearby',
  AVAILABLE: 'available',
};

// Map Settings
export const MAP_SETTINGS = {
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 8,
  MAX_ZOOM: 18,
  DEFAULT_CENTER: {
    lat: 7.8731,
    lng: 80.7718,
  },
};

// Validation Rules
export const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 100,
  },
  PHONE: {
    LENGTH: 10,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
  },
  DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 500,
  },
  REVIEW: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  MESSAGE: {
    MAX_LENGTH: 1000,
  },
};

export default {
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  NOTIFICATION_TYPES,
  SERVICE_CATEGORIES,
  WORK_PROGRESS,
  REVIEW_STATUS,
  VERIFICATION_STATUS,
  AVAILABILITY_STATUS,
  MESSAGE_TYPES,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  RATING_LABELS,
  CURRENCY,
  DATE_FORMATS,
  REGEX,
  STORAGE_KEYS,
  TOAST_TYPES,
  THEMES,
  SORT_OPTIONS,
  FILTER_OPTIONS,
  MAP_SETTINGS,
  VALIDATION_RULES,
};