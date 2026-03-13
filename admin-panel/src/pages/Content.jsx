import { useState } from 'react';
import { FileText, Save, Eye, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const DEFAULT_CONTENT = [
  {
    id: '1',
    key: 'welcome_message',
    title: 'Welcome Message',
    content: 'Welcome to Only You! Start chatting with your favorite AI characters and discover meaningful conversations.',
    type: 'text',
    lastUpdated: '2024-12-15T10:00:00Z',
  },
  {
    id: '2',
    key: 'terms_of_service',
    title: 'Terms of Service',
    content: 'By using Only You, you agree to these terms. The app provides AI-powered chat entertainment. All conversations are with AI characters and do not represent real people.\n\nUsers must be 18+ to use this service. Any misuse, harassment, or attempts to extract harmful content will result in account termination.',
    type: 'longtext',
    lastUpdated: '2024-12-10T08:00:00Z',
  },
  {
    id: '3',
    key: 'privacy_policy',
    title: 'Privacy Policy',
    content: 'We collect only the information needed to provide our service: your name, email, phone, and chat history.\n\n• Your data is encrypted in transit and at rest\n• We never sell your personal information\n• Chat history can be deleted by contacting support\n• You can delete your account at any time from Settings',
    type: 'longtext',
    lastUpdated: '2024-12-10T08:00:00Z',
  },
  {
    id: '4',
    key: 'support_email',
    title: 'Support Email',
    content: 'support@onlyyou.com',
    type: 'text',
    lastUpdated: '2024-12-01T12:00:00Z',
  },
  {
    id: '5',
    key: 'app_announcement',
    title: 'App Announcement Banner',
    content: '',
    type: 'text',
    lastUpdated: '2024-12-15T10:00:00Z',
  },
];

export default function Content() {
  const { theme, isDark } = useTheme();
  const [contentItems, setContentItems] = useState(DEFAULT_CONTENT);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', type: 'text', key: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const openEdit = (item) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, content: item.content, type: item.type, key: item.key });
  };

  const handleSave = (id) => {
    setSaving(true);
    setTimeout(() => {
      setContentItems(prev => prev.map(item =>
        item.id === id
          ? { ...item, ...editForm, lastUpdated: new Date().toISOString() }
          : item
      ));
      setEditingId(null);
      setSaving(false);
      toast.success('Content updated successfully');
    }, 500);
  };

  const handleAdd = () => {
    if (!editForm.title.trim() || !editForm.key.trim()) {
      toast.error('Title and key are required');
      return;
    }
    const newItem = {
      id: Date.now().toString(),
      ...editForm,
      lastUpdated: new Date().toISOString(),
    };
    setContentItems(prev => [...prev, newItem]);
    setEditForm({ title: '', content: '', type: 'text', key: '' });
    setShowAdd(false);
    toast.success('Content item added');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this content item?')) return;
    setContentItems(prev => prev.filter(item => item.id !== id));
    toast.success('Content item deleted');
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>App Content</h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>Manage in-app text, announcements, and legal content</p>
        </div>
        <button
          onClick={() => { setShowAdd(!showAdd); setEditForm({ title: '', content: '', type: 'text', key: '' }); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-200/50"
        >
          <Plus className="w-4 h-4" /> Add Content
        </button>
      </div>

      {/* Add New Content Form */}
      {showAdd && (
        <div className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
          <h3 className="font-semibold mb-4" style={{ color: theme.text }}>Add New Content Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="e.g., About Us"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Key (unique identifier)</label>
              <input
                type="text"
                value={editForm.key}
                onChange={(e) => setEditForm({ ...editForm, key: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                placeholder="e.g., about_us"
                className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Content</label>
            <textarea
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              placeholder="Enter content..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none"
              style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}>
              Cancel
            </button>
            <button onClick={handleAdd} className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90">
              <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Items */}
      <div className="space-y-4">
        {contentItems.map((item) => (
          <div key={item.id} className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: theme.text }}>{item.title}</h3>
                    <p className="text-xs" style={{ color: theme.textMuted }}>Key: {item.key} · Updated {formatDate(item.lastUpdated)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="mt-2 space-y-3">
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                    style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
                  />
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={item.type === 'longtext' ? 6 : 2}
                    className="w-full px-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none"
                    style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', border: `1px solid ${theme.border}`, color: theme.text }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}>
                      Cancel
                    </button>
                    <button onClick={() => handleSave(item.id)} disabled={saving} className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-medium hover:bg-pink-600 disabled:opacity-50 flex items-center gap-1">
                      <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 px-1">
                  {item.content ? (
                    <p className="text-sm whitespace-pre-wrap line-clamp-3" style={{ color: theme.textMuted }}>{item.content}</p>
                  ) : (
                    <p className="text-sm italic" style={{ color: theme.textMuted }}>No content set</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
