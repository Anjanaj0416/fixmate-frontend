/**
 * Validation Utilities
 * Functions for form validation and data verification
 */

import { REGEX, VALIDATION_RULES } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!REGEX.EMAIL.test(email)) {
    return { isValid: false, message: 'Invalid email format' };
  }
  
  if (email.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
    return { isValid: false, message: `Email must be less than ${VALIDATION_RULES.EMAIL.MAX_LENGTH} characters` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (!REGEX.PHONE.test(phone)) {
    return { isValid: false, message: 'Invalid phone number format' };
  }
  
  if (cleaned.length !== VALIDATION_RULES.PHONE.LENGTH && cleaned.length !== VALIDATION_RULES.PHONE.LENGTH + 2) {
    return { isValid: false, message: 'Phone number must be 10 digits' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength level
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 0 };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
    return { 
      isValid: false, 
      message: `Password must be at least ${VALIDATION_RULES.PASSWORD.MIN_LENGTH} characters`, 
      strength: 1 
    };
  }
  
  let strength = 0;
  const checks = {
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[@$!%*?&]/.test(password),
    isLongEnough: password.length >= 12,
  };
  
  // Calculate strength (0-5)
  strength += checks.hasLowerCase ? 1 : 0;
  strength += checks.hasUpperCase ? 1 : 0;
  strength += checks.hasNumber ? 1 : 0;
  strength += checks.hasSpecialChar ? 1 : 0;
  strength += checks.isLongEnough ? 1 : 0;
  
  if (!checks.hasLowerCase || !checks.hasUpperCase || !checks.hasNumber || !checks.hasSpecialChar) {
    return { 
      isValid: false, 
      message: 'Password must contain uppercase, lowercase, number, and special character', 
      strength 
    };
  }
  
  return { isValid: true, message: '', strength };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {Object} Validation result
 */
export const validateName = (name) => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
    return { isValid: false, message: `Name must be at least ${VALIDATION_RULES.NAME.MIN_LENGTH} characters` };
  }
  
  if (name.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
    return { isValid: false, message: `Name must be less than ${VALIDATION_RULES.NAME.MAX_LENGTH} characters` };
  }
  
  if (!REGEX.NAME.test(name)) {
    return { isValid: false, message: 'Name can only contain letters and spaces' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate NIC (National Identity Card) number
 * @param {string} nic - NIC to validate
 * @returns {Object} Validation result
 */
export const validateNIC = (nic) => {
  if (!nic) {
    return { isValid: false, message: 'NIC is required' };
  }
  
  if (!REGEX.NIC.test(nic)) {
    return { isValid: false, message: 'Invalid NIC format' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {Object} Validation result
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate string length
 * @param {string} value - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Name of the field
 * @returns {Object} Validation result
 */
export const validateLength = (value, min, max, fieldName = 'This field') => {
  if (!value) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (value.length < min) {
    return { isValid: false, message: `${fieldName} must be at least ${min} characters` };
  }
  
  if (value.length > max) {
    return { isValid: false, message: `${fieldName} must be less than ${max} characters` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate number range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Name of the field
 * @returns {Object} Validation result
 */
export const validateRange = (value, min, max, fieldName = 'This field') => {
  if (value === null || value === undefined) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (value < min || value > max) {
    return { isValid: false, message: `${fieldName} must be between ${min} and ${max}` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @returns {Object} Validation result
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, message: 'Invalid file type' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {Object} Validation result
 */
export const validateFileSize = (file, maxSize) => {
  if (!file) {
    return { isValid: false, message: 'File is required' };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return { isValid: false, message: `File size must be less than ${maxSizeMB}MB` };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {Object} Validation result
 */
export const validateURL = (url) => {
  if (!url) {
    return { isValid: false, message: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { isValid: true, message: '' };
  } catch {
    return { isValid: false, message: 'Invalid URL format' };
  }
};

/**
 * Validate date (must be future date)
 * @param {string|Date} date - Date to validate
 * @returns {Object} Validation result
 */
export const validateFutureDate = (date) => {
  if (!date) {
    return { isValid: false, message: 'Date is required' };
  }
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateObj < today) {
    return { isValid: false, message: 'Date must be in the future' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate rating value
 * @param {number} rating - Rating to validate
 * @returns {Object} Validation result
 */
export const validateRating = (rating) => {
  if (rating === null || rating === undefined) {
    return { isValid: false, message: 'Rating is required' };
  }
  
  if (rating < 1 || rating > 5) {
    return { isValid: false, message: 'Rating must be between 1 and 5' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Object} Validation result
 */
export const validateCoordinates = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return { isValid: false, message: 'Location is required' };
  }
  
  if (lat < -90 || lat > 90) {
    return { isValid: false, message: 'Invalid latitude' };
  }
  
  if (lng < -180 || lng > 180) {
    return { isValid: false, message: 'Invalid longitude' };
  }
  
  return { isValid: true, message: '' };
};

/**
 * Validate form data
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules object
 * @returns {Object} Validation results with errors object
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = formData[field];
    
    let result;
    
    switch (rule.type) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'phone':
        result = validatePhone(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'name':
        result = validateName(value);
        break;
      case 'required':
        result = validateRequired(value, rule.fieldName);
        break;
      case 'length':
        result = validateLength(value, rule.min, rule.max, rule.fieldName);
        break;
      case 'range':
        result = validateRange(value, rule.min, rule.max, rule.fieldName);
        break;
      case 'rating':
        result = validateRating(value);
        break;
      default:
        result = { isValid: true, message: '' };
    }
    
    if (!result.isValid) {
      errors[field] = result.message;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateName,
  validateNIC,
  validateRequired,
  validateLength,
  validateRange,
  validateFileType,
  validateFileSize,
  validateURL,
  validateFutureDate,
  validateRating,
  validateCoordinates,
  validateForm,
};