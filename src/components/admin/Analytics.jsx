import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Briefcase,
  DollarSign,
  Star,
  Activity,
  Download,
  RefreshCw
} from 'lucide-react';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(
        `http://localhost:5001/api/v1/admin/analytics?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleExport = () => {
    // Export analytics data as JSON
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fixmate-analytics-${new Date().toISOString()}.json`;
    link.click();
  };

  const MetricCard = ({ icon: Icon, title, value, change, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${color} p-3 rounded-full`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const CategoryBar = ({ category, count, percentage }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{category}</span>
        <span className="text-sm text-gray-600">{count} bookings</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="w-8 h-8 mr-3" />
            Analytics
          </h1>
          <p className="text-gray-600 mt-2">Detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={Users}
          title="Total Users"
          value={analytics?.totalUsers?.toLocaleString() || '0'}
          change={analytics?.userGrowth}
          color="bg-blue-500"
          subtitle={`${analytics?.newUsers || 0} new users`}
        />
        <MetricCard
          icon={Calendar}
          title="Total Bookings"
          value={analytics?.totalBookings?.toLocaleString() || '0'}
          change={analytics?.bookingGrowth}
          color="bg-purple-500"
          subtitle={`${analytics?.activeBookings || 0} active`}
        />
        <MetricCard
          icon={DollarSign}
          title="Total Revenue"
          value={`Rs ${(analytics?.totalRevenue || 0).toLocaleString()}`}
          change={analytics?.revenueGrowth}
          color="bg-green-500"
          subtitle={`Avg: Rs ${(analytics?.avgBookingValue || 0).toLocaleString()}`}
        />
        <MetricCard
          icon={Star}
          title="Average Rating"
          value={analytics?.averageRating?.toFixed(1) || '0.0'}
          change={analytics?.ratingChange}
          color="bg-yellow-500"
          subtitle={`${analytics?.totalReviews || 0} reviews`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Popular Categories */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Popular Service Categories</h3>
          <div>
            {analytics?.popularCategories?.map((cat, index) => (
              <CategoryBar
                key={index}
                category={cat.name}
                count={cat.count}
                percentage={(cat.count / analytics.totalBookings) * 100}
              />
            )) || <p className="text-gray-500 text-center py-8">No data available</p>}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Status Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-yellow-900">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {analytics?.bookingsByStatus?.pending || 0}
                </p>
              </div>
              <div className="text-yellow-600">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-blue-900">In Progress</p>
                <p className="text-2xl font-bold text-blue-700">
                  {analytics?.bookingsByStatus?.inProgress || 0}
                </p>
              </div>
              <div className="text-blue-600">
                <Activity className="w-8 h-8" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-green-900">Completed</p>
                <p className="text-2xl font-bold text-green-700">
                  {analytics?.bookingsByStatus?.completed || 0}
                </p>
              </div>
              <div className="text-green-600">
                <Briefcase className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* User Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="font-semibold text-gray-900">
                {analytics?.usersByRole?.customers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Workers</span>
              <span className="font-semibold text-gray-900">
                {analytics?.usersByRole?.workers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Verified Workers</span>
              <span className="font-semibold text-green-600">
                {analytics?.verifiedWorkers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Active Users (30d)</span>
              <span className="font-semibold text-blue-600">
                {analytics?.activeUsers || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Retention</span>
              <span className="font-semibold text-indigo-600">
                {analytics?.userRetention || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Revenue Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Revenue</span>
              <span className="font-semibold text-gray-900">
                Rs {(analytics?.totalRevenue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Avg Booking Value</span>
              <span className="font-semibold text-gray-900">
                Rs {(analytics?.avgBookingValue || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Pending Payments</span>
              <span className="font-semibold text-yellow-600">
                Rs {(analytics?.pendingPayments || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Completed Payments</span>
              <span className="font-semibold text-green-600">
                Rs {(analytics?.completedPayments || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Revenue Growth</span>
              <span className={`font-semibold ${
                analytics?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics?.revenueGrowth >= 0 ? '+' : ''}{analytics?.revenueGrowth || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="font-semibold text-green-600">
                {analytics?.completionRate || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Cancellation Rate</span>
              <span className="font-semibold text-red-600">
                {analytics?.cancellationRate || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-semibold text-gray-900">
                {analytics?.avgResponseTime || 0} hrs
              </span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Customer Satisfaction</span>
              <span className="font-semibold text-yellow-600">
                {analytics?.customerSatisfaction || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Repeat Customer Rate</span>
              <span className="font-semibold text-indigo-600">
                {analytics?.repeatCustomerRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Workers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Workers</h3>
          <div className="space-y-3">
            {analytics?.topWorkers?.map((worker, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {worker.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{worker.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{worker.completedBookings} bookings</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{worker.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    Rs {worker.totalEarnings?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">earned</p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-center py-8">No data available</p>}
          </div>
        </div>

        {/* Recent Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trends</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-900">Peak Booking Time</span>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-700">
                {analytics?.peakBookingTime || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Most Active Day</span>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-lg font-bold text-blue-700">
                {analytics?.mostActiveDay || 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Platform Growth</span>
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-lg font-bold text-purple-700">
                {analytics?.platformGrowth >= 0 ? '+' : ''}{analytics?.platformGrowth || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;