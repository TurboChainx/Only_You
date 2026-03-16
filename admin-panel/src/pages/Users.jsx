import { useState, useEffect } from 'react';
import { Search, Ban, Trash2, ChevronLeft, ChevronRight, Shield, ShieldOff, MessageSquare } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data.users);
      setTotalPages(data.data.pages);
      setTotal(data.data.total);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleBan = async (id) => {
    try {
      const { data } = await adminAPI.banUser(id);
      toast.success(`User ${data.data.status === 'banned' ? 'banned' : 'unbanned'}`);
      loadUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleViewSMS = (user) => {
    navigate(`/sms?userId=${user._id}&userName=${encodeURIComponent(user.fullName)}`);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isOnline = (lastActive) => {
    if (!lastActive) return false;
    const diff = Date.now() - new Date(lastActive).getTime();
    return diff < 20 * 60 * 1000; // Online if active within 20 minutes
  };

  const getLastSeenText = (lastActive) => {
    if (!lastActive) return 'Never';
    const diff = Date.now() - new Date(lastActive).getTime();
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)}h ago`;
    return formatDate(lastActive);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Users</h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.textMuted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-sm"
            style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}`, color: theme.text }}
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none text-sm"
          style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}`, color: theme.text }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
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
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Phone</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Status</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Messages</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Last Seen</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Joined</th>
                  <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ borderTop: `1px solid ${theme.border}` }}>
                {users.map((user) => (
                  <tr key={user._id} className="transition-colors" style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {user.fullName.charAt(0)}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isOnline(user.lastActive) ? 'bg-green-500' : 'bg-gray-400'}`} style={{ borderColor: theme.cardBackground }} title={isOnline(user.lastActive) ? 'Online' : 'Offline'}></span>
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: theme.text }}>{user.fullName}</p>
                          <p className="text-xs" style={{ color: theme.textMuted }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: theme.textMuted }}>{user.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'active' ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: theme.textMuted }}>{user.totalMessages || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isOnline(user.lastActive) ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-sm" style={{ color: isOnline(user.lastActive) ? '#22c55e' : theme.textMuted }}>
                          {isOnline(user.lastActive) ? 'Online' : getLastSeenText(user.lastActive)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: theme.textMuted }}>{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewSMS(user)}
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="View SMS messages"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBan(user._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.status === 'active' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'
                          }`}
                          title={user.status === 'active' ? 'Ban user' : 'Unban user'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="text-center py-12" style={{ color: theme.textMuted }}>No users found</div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3" style={{ borderTop: `1px solid ${theme.border}` }}>
            <p className="text-sm" style={{ color: theme.textMuted }}>Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg disabled:opacity-40 transition-colors"
                style={{ color: theme.textMuted }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg disabled:opacity-40 transition-colors"
                style={{ color: theme.textMuted }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
