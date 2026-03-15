import { useState, useEffect } from 'react';
import { Bell, Send, Users, Trash2, Clock, Megaphone, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { theme, isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    targetType: 'all',
  });
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    loadNotifications();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers({ limit: 200, hasTokens: true });
      setUsers(data.data.users || data.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getNotifications({ limit: 50 });
      setNotifications(data.data.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    setSending(true);
    try {
      const payload = {
        title: form.title,
        body: form.body,
        targetType: form.targetType,
      };
      if (form.targetType === 'specific') {
        payload.targetUsers = selectedUsers;
      }
      const { data } = await adminAPI.sendNotification(payload);
      toast.success(data.message || 'Notification sent!');
      setForm({ title: '', body: '', targetType: 'all' });
      setSelectedUsers([]);
      setShowCompose(false);
      loadNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await adminAPI.deleteNotification(id);
      toast.success('Notification deleted');
      loadNotifications();
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Send and manage push notifications to users</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all"
            style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}`, color: theme.text }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => setShowCompose(!showCompose)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-200/50"
          >
            <Megaphone className="w-4 h-4" /> {showCompose ? 'Cancel' : 'New Notification'}
          </button>
        </div>
      </div>

      {/* Compose Form */}
      {showCompose && (
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2 mb-5">
            <Send className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold" style={{ color: theme.text }}>Compose Notification</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Notification title"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>Message</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder="Type your notification message..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>Target Audience</label>
              <select
                value={form.targetType}
                onChange={(e) => { setForm({ ...form, targetType: e.target.value }); setSelectedUsers([]); }}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
              >
                <option value="all">All Users</option>
                <option value="specific">Specific Users</option>
              </select>
            </div>

            {form.targetType === 'specific' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>Select Users</label>
                <div className="max-h-48 overflow-y-auto rounded-xl p-2" style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}` }}>
                  {users.map(user => (
                    <label key={user._id} className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-pink-50 transition-colors" style={{ color: theme.text }}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user._id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user._id));
                          }
                        }}
                        className="rounded text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-sm">{user.fullName || user.email}</span>
                      <span className="text-xs ml-auto" style={{ color: theme.textMuted }}>{user.email}</span>
                    </label>
                  ))}
                  {users.length === 0 && <p className="text-sm text-center py-2" style={{ color: theme.textMuted }}>No users found</p>}
                </div>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{selectedUsers.length} user(s) selected</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCompose(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification History */}
      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
        <div className="p-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-pink-500" />
            <h2 className="font-semibold" style={{ color: theme.text }}>Notification History</h2>
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: theme.border }}>
          {notifications.map((notif) => (
            <div key={notif._id} className="p-4 hover:bg-gray-50 transition-colors" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm" style={{ color: theme.text }}>{notif.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      notif.status === 'sent' ? 'bg-green-100 text-green-700' :
                      notif.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                      notif.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {notif.status}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: theme.textMuted }}>{notif.body}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                      <Clock className="w-3 h-3" />
                      {formatDate(notif.sentAt || notif.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                      <Users className="w-3 h-3" />
                      {notif.successCount || 0} success, {notif.failureCount || 0} failed
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notif._id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-12" style={{ color: theme.textMuted }}>
              No notifications sent yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
