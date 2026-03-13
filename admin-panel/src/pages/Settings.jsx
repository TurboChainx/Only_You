import { useState, useEffect } from 'react';
import { Save, Shield, Key, Bell, Globe, Database, RefreshCw } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Settings() {
  const { theme, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    appName: 'Only You',
    appTagline: 'Find Your Connection',
    maintenanceMode: false,
    maxMessagesPerDay: 500,
    aiModel: 'gpt-4.1-mini',
    aiMaxTokens: 500,
    aiTemperature: 0.8,
    enableNewRegistrations: true,
    enablePushNotifications: false,
    moderationEnabled: true,
    autobanThreshold: 100,
  });

  const [adminPassword, setAdminPassword] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!adminPassword.current || !adminPassword.newPass) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (adminPassword.newPass.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (adminPassword.newPass !== adminPassword.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      await adminAPI.changeAdminPassword(adminPassword.current, adminPassword.newPass);
      toast.success('Password changed successfully');
      setAdminPassword({ current: '', newPass: '', confirm: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await adminAPI.getSettings();
      if (data.data) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      // Settings may not exist yet, use defaults
    }
  };

  const Section = ({ icon: Icon, title, description, children }) => (
    <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold" style={{ color: theme.text }}>{title}</h3>
          {description && <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{description}</p>}
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, type = 'text', placeholder, hint }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
        style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
      />
      {hint && <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{hint}</p>}
    </div>
  );

  const ToggleField = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium" style={{ color: theme.text }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-pink-500' : (isDark ? 'bg-gray-600' : 'bg-gray-300')}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Manage application configuration and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Settings */}
        <Section icon={Globe} title="App Configuration" description="General application settings">
          <InputField label="App Name" value={settings.appName} onChange={(v) => setSettings({ ...settings, appName: v })} placeholder="Only You" />
          <InputField label="App Tagline" value={settings.appTagline} onChange={(v) => setSettings({ ...settings, appTagline: v })} placeholder="Find Your Connection" />
          <ToggleField label="Maintenance Mode" description="Temporarily disable app access for users" checked={settings.maintenanceMode} onChange={(v) => setSettings({ ...settings, maintenanceMode: v })} />
          <ToggleField label="Allow New Registrations" description="Enable or disable new user sign-ups" checked={settings.enableNewRegistrations} onChange={(v) => setSettings({ ...settings, enableNewRegistrations: v })} />
        </Section>

        {/* AI Settings */}
        <Section icon={Database} title="AI Configuration" description="OpenAI model and response settings">
          <InputField label="AI Model" value={settings.aiModel} onChange={(v) => setSettings({ ...settings, aiModel: v })} placeholder="gpt-4.1-mini" hint="OpenAI model used for chat responses" />
          <InputField label="Max Tokens" value={settings.aiMaxTokens} onChange={(v) => setSettings({ ...settings, aiMaxTokens: v })} type="number" hint="Maximum response length (tokens)" />
          <InputField label="Temperature" value={settings.aiTemperature} onChange={(v) => setSettings({ ...settings, aiTemperature: v })} type="number" hint="0.0 = focused, 1.0 = creative (0.1 - 1.0)" />
          <InputField label="Max Messages Per Day" value={settings.maxMessagesPerDay} onChange={(v) => setSettings({ ...settings, maxMessagesPerDay: v })} type="number" hint="Per-user daily message limit (0 = unlimited)" />
        </Section>

        {/* Moderation */}
        <Section icon={Shield} title="Moderation" description="Content and user moderation settings">
          <ToggleField label="Auto-Moderation" description="Automatically flag suspicious content" checked={settings.moderationEnabled} onChange={(v) => setSettings({ ...settings, moderationEnabled: v })} />
          <InputField label="Auto-Ban Threshold" value={settings.autobanThreshold} onChange={(v) => setSettings({ ...settings, autobanThreshold: v })} type="number" hint="Number of violations before auto-ban (0 = disabled)" />
          <ToggleField label="Push Notifications" description="Send push notifications to users" checked={settings.enablePushNotifications} onChange={(v) => setSettings({ ...settings, enablePushNotifications: v })} />
        </Section>

        {/* Admin Security */}
        <Section icon={Key} title="Admin Security" description="Change your admin password">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>Current Password</label>
            <input
              type="password"
              value={adminPassword.current}
              onChange={(e) => setAdminPassword({ ...adminPassword, current: e.target.value })}
              placeholder="Enter current password"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>New Password</label>
            <input
              type="password"
              value={adminPassword.newPass}
              onChange={(e) => setAdminPassword({ ...adminPassword, newPass: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>Confirm New Password</label>
            <input
              type="password"
              value={adminPassword.confirm}
              onChange={(e) => setAdminPassword({ ...adminPassword, confirm: e.target.value })}
              placeholder="Repeat new password"
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </Section>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-pink-200/50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
