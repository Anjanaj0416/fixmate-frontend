import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  DollarSign,
  Star,
  TrendingUp,
  AlertTriangle,
  Activity
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import AdminDashboard from '../../components/admin/AdminDashboard';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    pendingReviews: 0,
    reportedIssues: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch from API
      setStats({
        totalUsers: 1523,
        totalWorkers: 487,
        totalCustomers: 1036,
        totalBookings: 3456,
        totalRevenue: 12500000,
        activeBookings: 234,
        pendingReviews: 45,
        reportedIssues: 12
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      change: '+12.5%',
      action: () => navigate('/admin/users')
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings.toLocaleString(),
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-purple-500',
      change: '+8.3%',
      action: () => navigate('/admin/reports')
    },
    {
      title: 'Revenue',
      value: `Rs. ${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-green-500',
      change: '+15.2%',
      action: () => navigate('/admin/reports')
    },
    {
      title: 'Reported Issues',
      value: stats.reportedIssues,
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'bg-red-500',
      urgent: true,
      action: () => navigate('/admin/users?tab=reports')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Platform overview and management
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card
              key={index}
              className={`hover:shadow-lg transition-shadow cursor-pointer ${
                stat.urgent ? 'border-red-300 bg-red-50' : ''
              }`}
              onClick={stat.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/users')}>
            <div className="flex items-center">
              <Users className="w-12 h-12 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage users and workers</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/reports')}>
            <div className="flex items-center">
              <Activity className="w-12 h-12 text-purple-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Reports & Analytics</h3>
                <p className="text-sm text-gray-600">View platform analytics</p>
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/settings')}>
            <div className="flex items-center">
              <Star className="w-12 h-12 text-yellow-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Review Moderation</h3>
                <p className="text-sm text-gray-600">Moderate reviews and ratings</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Dashboard Component */}
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPanel;