import { useState, useEffect } from 'react';
import { Key, Database, Server, RefreshCw, CheckCircle, XCircle, Eye, EyeOff, Save, AlertTriangle } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const { theme, isDark } = useTheme();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [testing, setTesting] = useState({});
  const [showValues, setShowValues] = useState({});
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getSystemSettings();
      setSettings(data.data);
    } catch (error) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key) => {
    const value = editValues[key];
    if (!value) {
      toast.error('Please enter a value');
      return;
    }

    setSaving({ ...saving, [key]: true });
    try {
      await adminAPI.updateSystemSetting(key, value);
      toast.success(`${formatKey(key)} updated successfully`);
      setEditValues({ ...editValues, [key]: '' });
      loadSettings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update setting');
    } finally {
      setSaving({ ...saving, [key]: false });
    }
  };

  const handleTestOpenAI = async () => {
    setTesting({ ...testing, openai: true });
    try {
      const { data } = await adminAPI.testOpenAI();
      toast.success(data.message + (data.response ? `: ${data.response}` : ''));
    } catch (error) {
      toast.error(error.response?.data?.message || 'OpenAI test failed');
    } finally {
      setTesting({ ...testing, openai: false });
    }
  };

  const handleTestMongoDB = async () => {
    setTesting({ ...testing, mongodb: true });
    try {
      const { data } = await adminAPI.testMongoDB();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'MongoDB test failed');
    } finally {
      setTesting({ ...testing, mongodb: false });
    }
  };

  const formatKey = (key) => {
    const names = {
      openaiApiKey: 'OpenAI API Key',
      mongodbUri: 'MongoDB URI',
      jwtSecret: 'JWT Secret',
      openaiModel: 'OpenAI Model',
      serverUrl: 'Server URL'
    };
    return names[key] || key;
  };

  const getIcon = (key) => {
    const icons = {
      openaiApiKey: Key,
      mongodbUri: Database,
      jwtSecret: Key,
      openaiModel: Server,
      serverUrl: Server
    };
    return icons[key] || Key;
  };

  const SettingCard = ({ settingKey, setting }) => {
    const Icon = getIcon(settingKey);
    const isEditing = editValues[settingKey] !== undefined && editValues[settingKey] !== '';
    
    return (
      <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: theme.text }}>{formatKey(settingKey)}</h3>
              <p className="text-xs" style={{ color: theme.textMuted }}>{setting.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {setting.hasValue ? (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <CheckCircle className="w-3.5 h-3.5" />
                Configured
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-yellow-500">
                <AlertTriangle className="w-3.5 h-3.5" />
                Not Set
              </span>
            )}
          </div>
        </div>

        {/* Current Value Display */}
        {setting.hasValue && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: theme.textMuted }}>Current Value</span>
              {setting.isEncrypted && (
                <button
                  onClick={() => setShowValues({ ...showValues, [settingKey]: !showValues[settingKey] })}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  {showValues[settingKey] ? (
                    <EyeOff className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                  ) : (
                    <Eye className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                  )}
                </button>
              )}
            </div>
            <p className="text-sm font-mono mt-1" style={{ color: theme.text }}>
              {setting.isEncrypted && !showValues[settingKey] ? '••••••••••••••••' : setting.value}
            </p>
          </div>
        )}

        {/* Update Input */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: theme.textMuted }}>
              {setting.hasValue ? 'Update Value' : 'Set Value'}
            </label>
            <input
              type={setting.isEncrypted ? 'password' : 'text'}
              value={editValues[settingKey] || ''}
              onChange={(e) => setEditValues({ ...editValues, [settingKey]: e.target.value })}
              placeholder={`Enter ${formatKey(settingKey)}...`}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none font-mono"
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
            />
          </div>
          <button
            onClick={() => handleSave(settingKey)}
            disabled={saving[settingKey] || !editValues[settingKey]}
            className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving[settingKey] ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Test Buttons */}
        {settingKey === 'openaiApiKey' && (
          <button
            onClick={handleTestOpenAI}
            disabled={testing.openai}
            className="w-full mt-3 py-2 border rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            {testing.openai ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {testing.openai ? 'Testing...' : 'Test Connection'}
          </button>
        )}
        {settingKey === 'mongodbUri' && (
          <button
            onClick={handleTestMongoDB}
            disabled={testing.mongodb}
            className="w-full mt-3 py-2 border rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            style={{ borderColor: theme.border, color: theme.text }}
          >
            {testing.mongodb ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {testing.mongodb ? 'Testing...' : 'Test Connection'}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>System Settings</h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Manage API keys, database connections, and system configuration</p>
        </div>
        <button
          onClick={loadSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Warning Banner */}
      <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important</p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Changing these settings will update the server configuration. Changes to MongoDB URI may require a server restart to take full effect.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(settings).map(([key, setting]) => (
          <SettingCard key={key} settingKey={key} setting={setting} />
        ))}
      </div>

      {/* Help Section */}
      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Configuration Help</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2" style={{ color: theme.text }}>OpenAI API Key</h4>
            <p style={{ color: theme.textMuted }}>
              Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline">
                platform.openai.com
              </a>
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: theme.text }}>MongoDB URI</h4>
            <p style={{ color: theme.textMuted }}>
              Format: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">mongodb+srv://user:pass@cluster.mongodb.net/dbname</code>
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: theme.text }}>OpenAI Model</h4>
            <p style={{ color: theme.textMuted }}>
              Recommended: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">gpt-4.1-mini</code> or <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">gpt-4o</code>
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: theme.text }}>Server URL</h4>
            <p style={{ color: theme.textMuted }}>
              Your API server URL (e.g., <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">http://your-server-ip</code>)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
