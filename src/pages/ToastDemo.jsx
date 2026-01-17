import React from 'react';
import { useNotificationToast } from '../context/NotificationToastContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

/**
 * Toast Demo Page
 * For testing and demonstrating toast notifications
 * DEVELOPMENT ONLY - Remove before production
 */
const ToastDemo = () => {
  const { showToast } = useNotificationToast();

  const testToasts = [
    {
      title: 'Success',
      message: 'Your profile has been updated successfully!',
      type: 'success',
      duration: 5000
    },
    {
      title: 'Error',
      message: 'Failed to process your request. Please try again.',
      type: 'error',
      duration: 5000
    },
    {
      title: 'Warning',
      message: 'Your session will expire in 5 minutes.',
      type: 'warning',
      duration: 5000
    },
    {
      title: 'Info',
      message: 'A new version of the app is available.',
      type: 'info',
      duration: 5000
    },
    {
      title: 'New Booking',
      message: 'You have a new booking request from John Doe.',
      type: 'booking-received',
      duration: 5000
    },
    {
      title: 'Quote Received',
      message: 'Asj Jayasinghe has sent you a quote for LKR 5000',
      type: 'quote-received',
      duration: 5000
    },
    {
      title: 'Booking Completed',
      message: 'Your job has been marked as completed. Please leave a review.',
      type: 'booking-completed',
      duration: 5000
    },
    {
      title: 'New Message',
      message: 'You have a new message from Sarah.',
      type: 'message-received',
      duration: 5000
    },
    {
      title: 'Payment Received',
      message: 'You have received LKR 10,000 for your recent job.',
      type: 'payment-received',
      duration: 5000
    },
    {
      title: 'New Review',
      message: 'You received a 5-star review from Michael!',
      type: 'review-received',
      duration: 5000
    }
  ];

  const handleShowToast = (toast) => {
    showToast(toast.title, toast.message, toast.type, toast.duration);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Toast Notification Demo
          </h1>
          <p className="text-gray-600">
            Test different types of toast notifications. Click the buttons below to see how they appear.
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test Notifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {testToasts.map((toast, index) => (
              <Button
                key={index}
                onClick={() => handleShowToast(toast)}
                variant={
                  toast.type.includes('success') ? 'primary' :
                  toast.type.includes('error') ? 'danger' :
                  toast.type.includes('warning') ? 'secondary' :
                  'primary'
                }
                className="w-full justify-center"
              >
                Show {toast.title}
              </Button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Developer Notes:
            </h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Toasts auto-dismiss after 5 seconds (configurable)</li>
              <li>Maximum 5 toasts can be displayed at once</li>
              <li>Toasts are displayed in the top-right corner</li>
              <li>Different notification types have different colors and icons</li>
              <li>Clicking the X button dismisses the toast immediately</li>
            </ul>
          </div>
        </Card>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Development Only:</strong> This page is for testing purposes only. 
            Remove the /toast-demo route from AppRoutes.jsx before deploying to production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ToastDemo;