import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to use Auth Context
 * Provides easy access to authentication state and methods
 * 
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export both named and default for compatibility
export { useAuth };
export default useAuth;