import { useState, useEffect, useRef } from 'react';
import { Smartphone, Wifi, WifiOff, RefreshCw, Monitor, Clock, Signal } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    loadDevices();
  }, [statusFilter]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(loadDevices, 10000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, statusFilter]);

  const loadDevices = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.getDevices(params);
      setDevices(data.data.devices);
      setOnlineCount(data.data.onlineCount);
      setTotalCount(data.data.totalCount);
    } catch (error) {
      if (loading) toast.error('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 30 * 1000) return 'Just now';
    if (diff < 60 * 1000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getPlatformIcon = (platform) => {
    if (platform === 'android' || platform === 'ios') return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Device Status</h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
            {onlineCount} online / {totalCount} total devices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: theme.textMuted }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (10s)
          </label>
          <button
            onClick={() => { setLoading(true); loadDevices(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ backgroundColor: theme.primary }}
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{onlineCount}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>Online Now</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{totalCount - onlineCount}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>Offline</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.text }}>{totalCount}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>Total Devices</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-sm"
          style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}`, color: theme.text }}
        >
          <option value="">All Devices</option>
          <option value="online">Online Only</option>
          <option value="offline">Offline Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', borderBottom: `1px solid ${theme.border}` }}>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>User</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Device</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Platform</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Status</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Last Active</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Last Seen</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>App Version</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Network</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device._id} className="transition-colors" style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                            {device.user?.fullName?.charAt(0) || '?'}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} style={{ borderColor: theme.cardBackground }}></span>
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: theme.text }}>{device.user?.fullName || 'Unknown'}</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>{device.user?.email || device.user?.phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPlatformIcon(device.platform)}
                        <span className="text-sm" style={{ color: theme.text }}>{device.deviceName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700 capitalize">
                        {device.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${device.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                        <span className={`text-sm font-medium ${device.status === 'online' ? 'text-green-600' : ''}`} style={{ color: device.status === 'online' ? '#16a34a' : theme.textMuted }}>
                          {device.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                        {device.isForeground && device.status === 'online' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 ml-1">FG</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                        <span className="text-sm" style={{ color: theme.textMuted }}>{formatTime(device.lastActive)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: theme.textMuted }}>
                      {formatTime(device.lastSeen)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', color: theme.textMuted }}>
                        v{device.appVersion}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Signal className="w-3.5 h-3.5" style={{ color: theme.textMuted }} />
                        <span className="text-sm capitalize" style={{ color: theme.textMuted }}>
                          {device.networkType || '—'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && devices.length === 0 && (
          <div className="text-center py-12" style={{ color: theme.textMuted }}>
            <Smartphone className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No devices found</p>
            <p className="text-xs mt-1">Devices will appear here when users log in</p>
          </div>
        )}
      </div>
    </div>
  );
}
