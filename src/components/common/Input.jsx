import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Input Component
 * Supports various input types, validation, and error handling
 */
const Input = ({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  autoComplete,
  icon,
  iconPosition = 'left',
  rows = 4,
  maxLength,
  pattern,
  min,
  max,
  step,
  accept,
  onChange,
  onBlur,
  onFocus,
  className = '',
  inputClassName = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  // Base input styles
  const baseInputStyles = 'w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed';

  // Input state styles
  const inputStateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : isFocused
    ? 'border-indigo-500 ring-2 ring-indigo-500'
    : 'border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-indigo-500';

  // Icon padding
  const iconPadding = icon
    ? iconPosition === 'left'
      ? 'pl-11'
      : 'pr-11'
    : '';

  // Combined input classes
  const inputClasses = `${baseInputStyles} ${inputStateStyles} ${iconPadding} ${inputClassName}`;

  // Render input based on type
  const renderInput = () => {
    // Textarea
    if (type === 'textarea') {
      return (
        <textarea
          name={name}
          value={value}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={inputClasses}
          {...props}
        />
      );
    }

    // Select dropdown
    if (type === 'select') {
      return (
        <select
          name={name}
          value={value}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          className={inputClasses}
          {...props}
        >
          {props.children}
        </select>
      );
    }

    // Regular input
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <input
        type={inputType}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        maxLength={maxLength}
        pattern={pattern}
        min={min}
        max={max}
        step={step}
        accept={accept}
        onChange={onChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={inputClasses}
        {...props}
      />
    );
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}

        {/* Input field */}
        {renderInput()}

        {/* Right icon */}
        {icon && iconPosition === 'right' && !type === 'password' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}

        {/* Password toggle button */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              // Eye slash icon (hide password)
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              // Eye icon (show password)
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}

        {/* Character count */}
        {maxLength && value && (
          <div className="absolute -bottom-6 right-0 text-xs text-gray-500">
            {value.length}/{maxLength}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg
            className="h-4 w-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'time', 'datetime-local', 'file', 'textarea', 'select']),
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  autoComplete: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  pattern: PropTypes.string,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  step: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  accept: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  children: PropTypes.node, // For select options
};

export default Input;