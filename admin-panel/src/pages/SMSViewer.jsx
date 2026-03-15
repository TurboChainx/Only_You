import { useState, useEffect } from 'react';
import { MessageSquare, Search, User, Phone, Calendar, RefreshCw, ChevronLeft, ChevronRight, Eye, Trash2, Filter, X, ArrowLeft } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SMSViewer() {
  const { theme, isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ totalSMS: 0, uniqueUsers: 0, uniqueSenders: 0, smsToday: 0, topSenders: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filteredUserName, setFilteredUserName] = useState('');

  useEffect(() => {
    // Check URL parameters for user filtering
    const userIdFromUrl = searchParams.get('userId');
    const userNameFromUrl = searchParams.get('userName');
    
    if (userIdFromUrl) {
      setSelectedUser(userIdFromUrl);
      setFilteredUserName(decodeURIComponent(userNameFromUrl || ''));
    }
    
    loadSMS();
    loadStats();
    loadUsers();
  }, [page, selectedUser, searchParams]);

  const loadSMS = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 30 };
      if (search) params.search = search;
      if (selectedUser) params.userId = selectedUser;
      
      const { data } = await adminAPI.getSMS(params);
      setMessages(data.data.messages || []);
      setTotalPages(data.data.pages || 1);
    } catch (error) {
      toast.error('Failed to load SMS messages');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = {};
      if (selectedUser) params.userId = selectedUser;
      const { data } = await adminAPI.getSMSStats(params);
      setStats(data.data);
    } catch (error) {
      console.error('Failed to load SMS stats');
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers({ limit: 100 });
      setUsers(data.data.users || []);
    } catch (error) {
      console.error('Failed to load users');
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadSMS();
    loadStats();
  };

  const clearUserFilter = () => {
    setSelectedUser('');
    setFilteredUserName('');
    setPage(1);
    navigate('/sms');
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    setPage(1);
    if (userId) {
      const user = users.find(u => u._id === userId);
      setFilteredUserName(user?.fullName || '');
    } else {
      setFilteredUserName('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadSMS();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this SMS message?')) return;
    try {
      await adminAPI.deleteSMS(id);
      toast.success('SMS deleted');
      loadSMS();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete SMS');
    }
  };

  const handleDeleteOrphans = async () => {
    if (!confirm('Delete all SMS from Unknown/deleted users? This cannot be undone.')) return;
    try {
      const { data } = await adminAPI.deleteOrphanSMS();
      toast.success(data.message || `Deleted ${data.deletedCount} orphan SMS`);
      loadSMS();
      loadStats();
    } catch (error) {
      toast.error('Failed to delete orphan SMS');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold" style={{ color: theme.text }}>{value}</p>
          <p className="text-xs" style={{ color: theme.textMuted }}>{label}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>SMS Viewer</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {filteredUserName ? `Viewing SMS for: ${filteredUserName}` : 'View SMS messages synced from user devices'}
            </p>
            {filteredUserName && (
              <button
                onClick={clearUserFilter}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Filter
              </button>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteOrphans}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Delete Unknown
          </button>
          <button
            onClick={() => { loadSMS(); loadStats(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Total SMS" value={stats.totalSMS} color="bg-blue-500" />
        <StatCard icon={User} label="Users with SMS" value={stats.uniqueUsers} color="bg-green-500" />
        <StatCard icon={Phone} label="Unique Senders" value={stats.uniqueSenders} color="bg-purple-500" />
        <StatCard icon={Calendar} label="Today" value={stats.smsToday} color="bg-pink-500" />
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sender or message..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600">
            Search
          </button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: theme.textMuted }} />
          <select
            value={selectedUser}
            onChange={(e) => handleUserChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
            style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.fullName} ({user.phone})</option>
            ))}
          </select>
        </div>
      </div>

      {/* SMS Table */}
      <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: theme.textMuted }} />
            <p style={{ color: theme.textMuted }}>No SMS messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Sender</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Message</th>
                  <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: theme.textMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((sms, idx) => (
                  <tr key={sms._id} style={{ borderBottom: idx < messages.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: theme.text }}>{sms.user?.fullName || 'Unknown'}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{sms.user?.phone || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: theme.text }}>{sms.sender}</span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-sm truncate" style={{ color: theme.text }} title={sms.body}>
                        {sms.body.length > 50 ? sms.body.substring(0, 50) + '...' : sms.body}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: theme.textMuted }}>{formatDate(sms.timestamp)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedMessage(sms)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="View"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(sms._id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${theme.border}` }}>
            <p className="text-sm" style={{ color: theme.textMuted }}>Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
              >
                <ChevronLeft className="w-4 h-4" style={{ color: theme.text }} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg disabled:opacity-50"
                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6' }}
              >
                <ChevronRight className="w-4 h-4" style={{ color: theme.text }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Senders */}
      {stats.topSenders?.length > 0 && (
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: theme.text }}>Top Senders</h3>
          <div className="flex flex-wrap gap-2">
            {stats.topSenders.map((sender, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-full text-sm"
                style={{ backgroundColor: isDark ? '#374151' : '#F3F4F6', color: theme.text }}
              >
                {sender._id} <span className="text-pink-500 font-medium">({sender.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ backgroundColor: theme.cardBackground }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>SMS Details</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>User</p>
                <p className="text-sm font-medium" style={{ color: theme.text }}>
                  {selectedMessage.user?.fullName} ({selectedMessage.user?.phone})
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>Sender</p>
                <p className="text-sm font-medium" style={{ color: theme.text }}>{selectedMessage.sender}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>Date</p>
                <p className="text-sm" style={{ color: theme.text }}>{formatDate(selectedMessage.timestamp)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: theme.textMuted }}>Message</p>
                <p className="text-sm p-3 rounded-lg" style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', color: theme.text }}>
                  {selectedMessage.body}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMessage(null)}
              className="w-full mt-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
