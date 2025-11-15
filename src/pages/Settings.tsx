// File: web/src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { Save, User, MapPin, Heart, Bell, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../api/services';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.location.city || '',
    age: user?.healthProfile?.age || '',
    gender: user?.healthProfile?.gender || '',
    comorbidities: user?.healthProfile?.comorbidities?.join(', ') || '',
    allergies: user?.healthProfile?.allergies?.join(', ') || '',
    medications: user?.healthProfile?.medications?.join(', ') || '',
  });
  const [notifications, setNotifications] = useState({
    email: user?.notificationPreferences?.email ?? true,
    whatsapp: user?.notificationPreferences?.whatsapp ?? false,
    sms: user?.notificationPreferences?.sms ?? false,
    pushEnabled: user?.notificationPreferences?.pushEnabled ?? true,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile({
        name: formData.name,
        location: { city: formData.city },
        healthProfile: {
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          comorbidities: formData.comorbidities.split(',').map(s => s.trim()).filter(Boolean),
          allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
          medications: formData.medications.split(',').map(s => s.trim()).filter(Boolean),
        },
        notificationPreferences: notifications,
      });

      // Update local store
      if (user) {
        setAuth(useAuthStore.getState().token!, response.data.user);
      }

      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <form onSubmit={handleProfileUpdate} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email}
                className="w-full px-4 py-3 bg-gray-800 border border-yellow-400/20 rounded-lg text-gray-500"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                min="0"
                max="150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Location</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
              placeholder="Pune"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This location is used for environmental data and risk predictions
            </p>
          </div>
        </div>

        {/* Health Profile */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Health Profile</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Health Conditions (comma-separated)
              </label>
              <input
                type="text"
                value={formData.comorbidities}
                onChange={(e) => setFormData({ ...formData, comorbidities: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                placeholder="Diabetes, Asthma, Hypertension"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple conditions with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                placeholder="Pollen, Dust, Nuts"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Medications (comma-separated)
              </label>
              <input
                type="text"
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                className="w-full px-4 py-3 bg-black border border-yellow-400/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-500"
                placeholder="Metformin, Inhaler"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-gray-900 border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive health reports and alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">WhatsApp Notifications</p>
                <p className="text-sm text-gray-400">Get alerts on WhatsApp</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.whatsapp}
                  onChange={(e) => setNotifications({ ...notifications, whatsapp: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">SMS Notifications</p>
                <p className="text-sm text-gray-400">Receive text message alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Push Notifications</p>
                <p className="text-sm text-gray-400">Enable browser push notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.pushEnabled}
                  onChange={(e) => setNotifications({ ...notifications, pushEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-400/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-400 text-black px-8 py-3 rounded-lg hover:bg-yellow-500 font-semibold shadow-yellow-400/40 shadow-md flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;