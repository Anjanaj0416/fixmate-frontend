import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Toast from './components/common/Toast';

/**
 * Main App Component
 * Sets up all providers and routing
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <UserProvider>
            <NotificationProvider>
              <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {/* Main Application Routes */}
                <AppRoutes />
                
                {/* Global Toast Notifications */}
                <Toast />
              </div>
            </NotificationProvider>
          </UserProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;