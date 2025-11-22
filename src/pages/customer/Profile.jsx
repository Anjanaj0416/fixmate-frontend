import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { User, Mail, Phone, MapPin, Bell, Shield, LogOut, Camera } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Profile Header */}
        <Card className="mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={user?.profileImageUrl || '/default-avatar.png'}
                alt={user?.fullName}
                className="w-24 h-24 rounded-full object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">Customer Account</p>
            </div>
            <Button
              onClick={() => setEditing(!editing)}
              variant={editing ? 'outline' : 'primary'}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </Card>

        {/* Profile Form */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              icon={<User className="w-5 h-5" />}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={!editing}
              required
            />
            <Input
              label="Email"
              type="email"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editing}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              icon={<Phone className="w-5 h-5" />}
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={!editing}
              required
            />
            <Input
              label="Address"
              icon={<MapPin className="w-5 h-5" />}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!editing}
            />
            {editing && (
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            )}
          </form>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">{key.replace('Enabled', ' Notifications')}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Security
          </h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Enable Two-Factor Authentication
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Card>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-300 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Profile;