import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import RoleBasedRoute from './RoleBasedRoute';
import { USER_ROLES } from '../utils/constants';

// Import pages
// Main pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import BasicInfoRegistration from '../pages/BasicInfoRegistration';
import AccountTypeSelection from '../pages/AccountTypeSelection';
import WorkerRegistrationFlow from '../pages/WorkerRegistrationFlow';
import ForgotPassword from '../pages/ForgotPassword';
import NotFound from '../pages/NotFound';

// Customer pages
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import FindWorkers from '../pages/FindWorkers';
import WorkerProfile from '../pages/WorkerProfile';
import MyBookings from '../pages/customer/MyBookings';
import Favorites from '../pages/customer/Favorites';
import CustomerProfile from '../pages/customer/Profile';

// Worker pages
import WorkerDashboard from '../pages/worker/WorkerDashboard';
import MyJobs from '../pages/worker/MyJobs';
import Earnings from '../pages/worker/Earnings';
import WorkerProfilePage from '../pages/worker/WorkerProfile';

// Admin pages
import AdminPanel from '../pages/admin/AdminPanel';
import Users from '../pages/admin/Users';
import Reports from '../pages/admin/Reports';
import Settings from '../pages/admin/Settings';

// Quote Request Flow Components
import QuoteRequestFlow from '../pages/QuoteRequestFlow';
import WorkerSelectionPage from '../pages/WorkerSelectionPage';
import ServiceSelectionPage from '../pages/ServiceSelectionPage';
import CustomerChatPage from '../pages/CustomerChatPage';
import WorkerEditProfile from '../pages/worker/WorkerEditProfile';
import WorkerBookingRequests from '../pages/worker/WorkerBookingRequests';
import BookingDetails from '../pages/customer/BookingDetails';
import CustomerMessages from '../pages/customer/CustomerMessages';


/**
 * App Routes Component
 * Defines all application routes with proper authentication and role-based access
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<BasicInfoRegistration />} />
      <Route path="/select-account-type" element={<AccountTypeSelection />} />
      <Route path="/worker-registration" element={<WorkerRegistrationFlow />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/customer/find-workers" element={<FindWorkers />} />
      <Route path="/customer/worker-profile/:workerId" element={<WorkerProfile />} />

      {/* Customer Routes */}
      <Route
        path="/customer/dashboard"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerDashboard />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* IMPORTANT: Quote Request Routes - MUST come BEFORE /customer/find-workers */}
      <Route
        path="/customer/service-selection"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <ServiceSelectionPage />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />


      <Route
        path="/customer/quote-request"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <QuoteRequestFlow />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      <Route
        path="/customer/select-worker"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <WorkerSelectionPage />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* Other Customer Routes */}
      <Route
        path="/customer/find-workers"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <FindWorkers />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/worker/:workerId"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <WorkerProfile />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/bookings"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <MyBookings />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/bookings/:bookingId"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <BookingDetails />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
       <Route
        path="/customer/messages"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerMessages/>
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
     

      <Route
        path="/worker/edit-profile"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.WORKER]}>
              <WorkerEditProfile />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/chat/:workerId"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerChatPage />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/favorites"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <Favorites />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.CUSTOMER]}>
              <CustomerProfile />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* Worker Routes */}
      <Route
        path="/worker/dashboard"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.WORKER]}>
              <WorkerDashboard />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/worker/requests"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.WORKER]}>
              <WorkerBookingRequests />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/worker/jobs"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.WORKER]}>
              <MyJobs />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/worker/earnings"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.WORKER]}>
              <Earnings />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/worker/profile"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.WORKER]}>
              <WorkerProfilePage />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <AdminPanel />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <Users />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <Reports />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <PrivateRoute>
            <RoleBasedRoute allowedRoles={[USER_ROLES.ADMIN]}>
              <Settings />
            </RoleBasedRoute>
          </PrivateRoute>
        }
      />

      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;