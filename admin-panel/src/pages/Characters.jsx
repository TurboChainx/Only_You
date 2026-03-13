import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Bot } from 'lucide-react';
import { adminAPI, getImageUrl } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '', age: '', location: '', bio: '', personality: '',
  conversationStyle: '', hobbies: '', systemPrompt: '', isActive: true
};

export default function Characters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => { loadCharacters(); }, []);

  const loadCharacters = async () => {
    try {
      const { data } = await adminAPI.getCharacters();
      setCharacters(data.data);
    } catch (error) {
      toast.error('Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setShowModal(true);
  };

  const openEdit = (char) => {
    setForm({
      name: char.name, age: char.age, location: char.location,
      bio: char.bio, personality: char.personality,
      conversationStyle: char.conversationStyle,
      hobbies: char.hobbies.join(', '),
      systemPrompt: char.systemPrompt || '',
      isActive: char.isActive
    });
    setEditingId(char._id);
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      if (imageFile) formData.append('profileImage', imageFile);

      if (editingId) {
        await adminAPI.updateCharacter(editingId, formData);
        toast.success('Character updated');
      } else {
        await adminAPI.createCharacter(formData);
        toast.success('Character created');
      }
      setShowModal(false);
      loadCharacters();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this character and all related chats?')) return;
    try {
      await adminAPI.deleteCharacter(id);
      toast.success('Character deleted');
      loadCharacters();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>AI Characters</h1>
          <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{characters.length} characters</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 transition-all shadow-lg shadow-pink-200/50">
          <Plus className="w-4 h-4" /> Add Character
        </button>
      </div>

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {characters.map((char) => (
          <div key={char._id} className="rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
            <div className="h-40 bg-gradient-to-br from-pink-300 to-purple-400 relative">
              {char.profileImage ? (
                <img src={getImageUrl(char.profileImage)} alt={char.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bot className="w-16 h-16 text-white/60" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${char.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {char.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg" style={{ color: theme.text }}>{char.name}</h3>
                <span className="text-sm" style={{ color: theme.textMuted }}>{char.age} yrs</span>
              </div>
              <p className="text-xs mb-2" style={{ color: theme.textMuted }}>{char.location}</p>
              <p className="text-sm line-clamp-2 mb-3" style={{ color: theme.textMuted }}>{char.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {char.hobbies.slice(0, 4).map((hobby, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: isDark ? '#831843' : '#FDF2F8', color: isDark ? '#F9A8D4' : '#DB2777' }}>{hobby}</span>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
                <span className="text-xs flex-1" style={{ color: theme.textMuted }}>{char.totalChats || 0} chats</span>
                <button onClick={() => openEdit(char)} className="p-2 rounded-lg text-blue-500 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(char._id)} className="p-2 rounded-lg text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: theme.cardBackground }}>
            <div className="flex items-center justify-between p-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <h2 className="text-lg font-bold" style={{ color: theme.text }}>{editingId ? 'Edit Character' : 'New Character'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg transition-colors" style={{ color: theme.textMuted }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Age</label>
                  <input type="number" value={form.age} onChange={(e) => setForm({...form, age: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Personality</label>
                  <input type="text" value={form.personality} onChange={(e) => setForm({...form, personality: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Conversation Style</label>
                  <input type="text" value={form.conversationStyle} onChange={(e) => setForm({...form, conversationStyle: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Hobbies (comma-separated)</label>
                <input type="text" value={form.hobbies} onChange={(e) => setForm({...form, hobbies: e.target.value})} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} placeholder="Music, Travel, Photography" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Profile Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100" style={{ color: theme.textMuted }} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: theme.textMuted }}>System Prompt (optional - auto-generated if empty)</label>
                <textarea value={form.systemPrompt} onChange={(e) => setForm({...form, systemPrompt: e.target.value})} rows={4} className="w-full px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 outline-none resize-none" style={{ backgroundColor: theme.inputBg, border: `1px solid ${theme.border}`, color: theme.text }} placeholder="Leave empty for auto-generated prompt..." />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="rounded text-pink-500 focus:ring-pink-500" />
                <span className="text-sm" style={{ color: theme.text }}>Active (visible to users)</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ border: `1px solid ${theme.border}`, color: theme.textMuted }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Character'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
