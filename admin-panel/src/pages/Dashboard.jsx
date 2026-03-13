import { useState, useEffect } from 'react';
import { Users, MessageSquare, Bot, UserPlus, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({ icon: Icon, label, value, color, subValue, theme }) => (
  <div className="rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: theme.textMuted }}>{label}</p>
        <p className="text-3xl font-bold mt-1" style={{ color: theme.text }}>{value}</p>
        {subValue && <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{subValue}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data.data);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!stats) return <p style={{ color: theme.textMuted }}>Failed to load dashboard</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-gradient-to-br from-blue-500 to-blue-600" subValue={`${stats.activeUsers} active`} theme={theme} />
        <StatCard icon={MessageSquare} label="Total Messages" value={stats.totalMessages.toLocaleString()} color="bg-gradient-to-br from-pink-500 to-rose-600" subValue={`${stats.messagesToday} today`} theme={theme} />
        <StatCard icon={Bot} label="AI Characters" value={stats.totalCharacters} color="bg-gradient-to-br from-purple-500 to-purple-600" theme={theme} />
        <StatCard icon={UserPlus} label="New Today" value={stats.newUsersToday} color="bg-gradient-to-br from-emerald-500 to-emerald-600" subValue={`${stats.bannedUsers} banned`} theme={theme} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold" style={{ color: theme.text }}>Messages (Last 7 Days)</h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.dailyMessages}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f1f5f9'} />
              <XAxis dataKey="_id" tick={{ fontSize: 12, fill: theme.textMuted }} />
              <YAxis tick={{ fontSize: 12, fill: theme.textMuted }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: theme.cardBackground, color: theme.text }}
              />
              <Bar dataKey="count" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold" style={{ color: theme.text }}>Recent Users</h2>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg transition-colors" style={{ ':hover': { backgroundColor: theme.tableRowHover } }}>
                <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{user.fullName}</p>
                  <p className="text-xs truncate" style={{ color: theme.textMuted }}>{user.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
