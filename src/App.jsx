import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { NotificationToastProvider } from './context/NotificationToastContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Toast from './components/common/Toast';
import tokenRefreshManager from './utils/tokenRefreshManager';

/**
 * Main App Component - WITH TOKEN REFRESH AND TOAST NOTIFICATIONS
 * ✅ CLEANED: Removed NotificationProvider (not needed)
 * ✅ ADDED: NotificationToastProvider for database notification toasts
 * Sets up all providers and routing
 */
function App() {
  // ✅ Initialize token refresh manager
  useEffect(() => {
    console.log('🚀 App mounted - initializing token refresh manager');
    tokenRefreshManager.initialize();
    
    return () => {
      console.log('🛑 App unmounting - stopping token refresh manager');
      tokenRefreshManager.stop();
    };
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <UserProvider>
            <NotificationToastProvider>
              <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {/* Main Application Routes */}
                <AppRoutes />
                
                {/* Global Toast Notifications */}
                <Toast />
              </div>
            </NotificationToastProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;