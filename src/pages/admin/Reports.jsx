import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Analytics from '../../components/admin/Analytics';

const Reports = () => {
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('overview');

  const reportTypes = [
    { value: 'overview', label: 'Overview', icon: TrendingUp },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'bookings', label: 'Bookings', icon: Calendar },
    { value: 'revenue', label: 'Revenue', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Platform insights and statistics</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <div className="flex flex-wrap gap-2">
                {reportTypes.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    onClick={() => setReportType(value)}
                    variant={reportType === value ? 'primary' : 'outline'}
                    size="sm"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Analytics Component */}
        <Analytics reportType={reportType} dateRange={dateRange} />
      </div>
    </div>
  );
};

export default Reports;