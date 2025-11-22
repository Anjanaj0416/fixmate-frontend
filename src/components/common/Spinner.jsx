import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Spinner Component
 * Loading indicators with multiple variants and sizes
 */
const Spinner = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  text,
  className = '',
}) => {
  // Size variants
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  // Color variants
  const variants = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-500',
    white: 'text-white',
  };

  // Spinner SVG
  const SpinnerSVG = () => (
    <svg
      className={`animate-spin ${sizes[size]} ${variants[variant]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Full screen spinner
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <SpinnerSVG />
          {text && (
            <p className={`text-sm font-medium ${variants[variant]}`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Regular spinner
  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <SpinnerSVG />
      {text && (
        <p className={`text-sm font-medium ${variants[variant]}`}>{text}</p>
      )}
    </div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
  fullScreen: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Dots Spinner Component
 * Alternative loading indicator with bouncing dots
 */
export const DotsSpinner = ({ size = 'md', variant = 'primary' }) => {
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const variants = {
    primary: 'bg-indigo-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-500',
    white: 'bg-white',
  };

  const dotClass = `${sizes[size]} ${variants[variant]} rounded-full`;

  return (
    <div className="flex space-x-1">
      <div className={`${dotClass} animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${dotClass} animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${dotClass} animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

DotsSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
};

/**
 * Pulse Spinner Component
 * Pulsing circle loading indicator
 */
export const PulseSpinner = ({ size = 'md', variant = 'primary' }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const variants = {
    primary: 'bg-indigo-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-500',
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className={`${sizes[size]} ${variants[variant]} rounded-full opacity-75 animate-ping`} />
      <div className={`absolute ${sizes[size]} ${variants[variant]} rounded-full`} />
    </div>
  );
};

PulseSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning']),
};

/**
 * Bar Spinner Component
 * Loading bars animation
 */
export const BarSpinner = ({ variant = 'primary' }) => {
  const variants = {
    primary: 'bg-indigo-600',
    secondary: 'bg-gray-600',
    success: 'bg-green-600',
    danger: 'bg-red-600',
    warning: 'bg-yellow-500',
  };

  const barClass = `w-1 h-8 ${variants[variant]} rounded`;

  return (
    <div className="flex space-x-1 items-end">
      <div className={`${barClass} animate-pulse`} style={{ animationDelay: '0ms' }} />
      <div className={`${barClass} animate-pulse`} style={{ animationDelay: '150ms' }} />
      <div className={`${barClass} animate-pulse`} style={{ animationDelay: '300ms' }} />
      <div className={`${barClass} animate-pulse`} style={{ animationDelay: '450ms' }} />
    </div>
  );
};

BarSpinner.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning']),
};

/**
 * Skeleton Loader Component
 * Content placeholder while loading
 */
export const Skeleton = ({ width = 'full', height = '4', className = '', count = 1 }) => {
  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/4': 'w-1/4',
  };

  const heights = {
    '4': 'h-4',
    '6': 'h-6',
    '8': 'h-8',
    '12': 'h-12',
    '16': 'h-16',
    '20': 'h-20',
  };

  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${widths[width]} ${heights[height]} bg-gray-200 rounded`}
        />
      ))}
    </div>
  );
};

Skeleton.propTypes = {
  width: PropTypes.oneOf(['full', '3/4', '1/2', '1/4']),
  height: PropTypes.oneOf(['4', '6', '8', '12', '16', '20']),
  className: PropTypes.string,
  count: PropTypes.number,
};

/**
 * Loading Overlay Component
 * Overlay with spinner for blocking UI during loading
 */
export const LoadingOverlay = ({ isLoading, text, children }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <Spinner text={text} />
        </div>
      )}
    </div>
  );
};

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  text: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Spinner;