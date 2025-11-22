import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Card Component
 * Flexible card component for displaying content
 */
const Card = ({
  children,
  title,
  subtitle,
  image,
  imageAlt,
  imagePosition = 'top',
  footer,
  hover = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200';
  const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  const clickableStyles = clickable ? 'cursor-pointer' : '';

  const cardClasses = `${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`;

  const renderImage = () => {
    if (!image) return null;

    return (
      <div className={imagePosition === 'top' ? 'w-full' : 'flex-shrink-0'}>
        <img
          src={image}
          alt={imageAlt || title || 'Card image'}
          className={
            imagePosition === 'top'
              ? 'w-full h-48 object-cover'
              : imagePosition === 'left'
              ? 'h-full w-48 object-cover'
              : 'h-full w-48 object-cover'
          }
        />
      </div>
    );
  };

  const renderContent = () => (
    <div className="p-6">
      {/* Title and subtitle */}
      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
      )}

      {/* Main content */}
      <div className="text-gray-700">{children}</div>
    </div>
  );

  return (
    <div
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {imagePosition === 'top' && (
        <>
          {renderImage()}
          {renderContent()}
        </>
      )}

      {(imagePosition === 'left' || imagePosition === 'right') && (
        <div className={`flex ${imagePosition === 'right' ? 'flex-row-reverse' : ''}`}>
          {renderImage()}
          {renderContent()}
        </div>
      )}

      {!image && renderContent()}

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  imagePosition: PropTypes.oneOf(['top', 'left', 'right']),
  footer: PropTypes.node,
  hover: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

/**
 * Stats Card Component
 * Card specifically for displaying statistics
 */
export const StatsCard = ({ title, value, icon, trend, trendValue, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <Card className="hover:shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 flex items-center ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend === 'up' ? (
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['indigo', 'green', 'red', 'yellow', 'blue']),
};

/**
 * Profile Card Component
 * Card for displaying user/worker profiles
 */
export const ProfileCard = ({ name, role, image, rating, reviewCount, onClick }) => {
  return (
    <Card hover clickable onClick={onClick}>
      <div className="flex items-center space-x-4">
        {/* Profile image */}
        <div className="flex-shrink-0">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-semibold">
              {name?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
          {rating && (
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, index) => (
                  <svg
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.floor(rating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {reviewCount && (
                <span className="ml-2 text-sm text-gray-600">
                  ({reviewCount} reviews)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow icon */}
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Card>
  );
};

ProfileCard.propTypes = {
  name: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  image: PropTypes.string,
  rating: PropTypes.number,
  reviewCount: PropTypes.number,
  onClick: PropTypes.func,
};

/**
 * Feature Card Component
 * Card for displaying features/services
 */
export const FeatureCard = ({ icon, title, description, action, onAction }) => {
  return (
    <Card hover className="text-center">
      {/* Icon */}
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 mb-4">{description}</p>

      {/* Action button */}
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition-colors"
        >
          {action} →
        </button>
      )}
    </Card>
  );
};

FeatureCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  action: PropTypes.string,
  onAction: PropTypes.func,
};

/**
 * Pricing Card Component
 * Card for displaying pricing plans
 */
export const PricingCard = ({
  name,
  price,
  period = 'month',
  features,
  highlighted = false,
  onSelect,
}) => {
  return (
    <Card
      className={`relative ${
        highlighted ? 'ring-2 ring-indigo-600 shadow-xl' : ''
      }`}
    >
      {highlighted && (
        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
          POPULAR
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>

      {/* Price */}
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">
          {typeof price === 'number' ? `LKR ${price.toLocaleString()}` : price}
        </span>
        {period && <span className="text-gray-600">/{period}</span>}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-600">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Select button */}
      <button
        onClick={onSelect}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        }`}
      >
        Select Plan
      </button>
    </Card>
  );
};

PricingCard.propTypes = {
  name: PropTypes.string.isRequired,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  period: PropTypes.string,
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
  highlighted: PropTypes.bool,
  onSelect: PropTypes.func,
};

export default Card;