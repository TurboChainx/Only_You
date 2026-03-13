import { useState } from 'react';
import { Bell, Send, Users, Trash2, Clock, Megaphone } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const SAMPLE_NOTIFICATIONS = [
  { id: '1', title: 'Welcome Message', message: 'Welcome to Only You! Start chatting with your favorite AI characters.', target: 'all', status: 'sent', sentAt: '2024-12-15T10:30:00Z', recipients: 45 },
  { id: '2', title: 'New Character Alert', message: 'Meet Sophia Mitchell - our newest AI companion!', target: 'all', status: 'sent', sentAt: '2024-12-14T08:00:00Z', recipients: 38 },
  { id: '3', title: 'Maintenance Notice', message: 'Scheduled maintenance on Dec 20, 2-4 AM UTC.', target: 'all', status: 'scheduled', sentAt: '2024-12-20T02:00:00Z', recipients: 0 },
];

export default function Notifications() {
  const { theme, isDark } = useTheme();
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    target: 'all',
  });
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    setSending(true);
    try {
      // Simulate sending - in production this would call the backend
      const newNotif = {
        id: Date.now().toString(),
        ...form,
        status: 'sent',
        sentAt: new Date().toISOString(),
        recipients: form.target === 'all' ? 45 : 1,
      };
      setNotifications(prev => [newNotif, ...prev]);
      setForm({ title: '', message: '', target: 'all' });
      setShowCompose(false);
      toast.success('Notification sent successfully');
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this notification?')) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
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
        <button
          onClick={() => setShowCompose(!showCompose)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-200/50"
        >
          <Megaphone className="w-4 h-4" /> {showCompose ? 'Cancel' : 'New Notification'}
        </button>
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
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Type your notification message..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: theme.textMuted }}>Target Audience</label>
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
              >
                <option value="all">All Users</option>
                <option value="active">Active Users Only</option>
                <option value="inactive">Inactive Users (7+ days)</option>
              </select>
            </div>

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
            <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm" style={{ color: theme.text }}>{notif.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      notif.status === 'sent' ? 'bg-green-100 text-green-700' :
                      notif.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {notif.status}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: theme.textMuted }}>{notif.message}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                      <Clock className="w-3 h-3" />
                      {formatDate(notif.sentAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                      <Users className="w-3 h-3" />
                      {notif.recipients} recipients
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notif.id)}
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
