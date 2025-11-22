import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Mail,
  Database
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    platformName: 'FixMate',
    platformEmail: 'support@fixmate.lk',
    commissionRate: 15,
    minBookingAmount: 500,
    maxBookingAmount: 100000,
    autoApproveWorkers: false,
    maintenanceMode: false
  });

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', icon: Globe }
  ];

  const handleSave = () => {
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
          <p className="text-gray-600">Configure platform settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <nav className="space-y-1">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {label}
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              {activeTab === 'general' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
                  <div className="space-y-6">
                    <Input
                      label="Platform Name"
                      value={settings.platformName}
                      onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                    />
                    <Input
                      label="Support Email"
                      type="email"
                      icon={<Mail className="w-5 h-5" />}
                      value={settings.platformEmail}
                      onChange={(e) => setSettings({ ...settings, platformEmail: e.target.value })}
                    />
                    <Input
                      label="Commission Rate (%)"
                      type="number"
                      value={settings.commissionRate}
                      onChange={(e) => setSettings({ ...settings, commissionRate: parseFloat(e.target.value) })}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        label="Min Booking Amount (Rs.)"
                        type="number"
                        value={settings.minBookingAmount}
                        onChange={(e) => setSettings({ ...settings, minBookingAmount: parseFloat(e.target.value) })}
                      />
                      <Input
                        label="Max Booking Amount (Rs.)"
                        type="number"
                        value={settings.maxBookingAmount}
                        onChange={(e) => setSettings({ ...settings, maxBookingAmount: parseFloat(e.target.value) })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="font-medium text-gray-900">Auto-Approve Workers</p>
                        <p className="text-sm text-gray-600">Automatically verify new worker registrations</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoApproveWorkers}
                          onChange={(e) => setSettings({ ...settings, autoApproveWorkers: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between border-t pt-4">
                      <div>
                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                        <p className="text-sm text-gray-600">Put the platform in maintenance mode</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.maintenanceMode}
                          onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Configure Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Database className="w-4 h-4 mr-2" />
                      Backup Database
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-300 hover:bg-red-50">
                      Reset All User Sessions
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                  <p className="text-gray-600">Configure system-wide notification preferences</p>
                </div>
              )}

              {activeTab === 'payments' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Settings</h2>
                  <p className="text-gray-600">Configure payment gateway and processing settings</p>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Integrations</h2>
                  <p className="text-gray-600">Manage third-party integrations and API keys</p>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t flex justify-end gap-4">
                <Button variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;