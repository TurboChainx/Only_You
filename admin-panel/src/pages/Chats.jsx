import { useState, useEffect } from 'react';
import { MessageSquare, X, User, Bot, Trash2 } from 'lucide-react';
import { adminAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Chats() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => { loadChats(); }, []);

  const loadChats = async () => {
    try {
      const { data } = await adminAPI.getChats({ limit: 50 });
      setSessions(data.data.sessions);
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const viewMessages = async (session) => {
    setSelectedSession(session);
    setMessagesLoading(true);
    try {
      const { data } = await adminAPI.getChatMessages(session._id);
      setMessages(data.data);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const deleteChat = async (session) => {
    if (!window.confirm(`Delete chat between "${session.user?.fullName || 'Unknown'}" and "${session.character?.name || 'Unknown'}"? This will remove all ${session.messageCount} messages permanently.`)) {
      return;
    }
    
    try {
      await adminAPI.deleteChat(session._id);
      setSessions(prev => prev.filter(s => s._id !== session._id));
      toast.success('Chat deleted successfully');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>Chat History</h1>
        <p className="text-sm mt-1" style={{ color: theme.textMuted }}>{sessions.length} chat sessions</p>
      </div>

      <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: theme.cardBackground, border: `1px solid ${theme.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: isDark ? '#374151' : '#F9FAFB', borderBottom: `1px solid ${theme.border}` }}>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>User</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Character</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Messages</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Last Message</th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider px-6 py-3" style={{ color: theme.textMuted }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session._id} className="transition-colors" style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {session.user?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: theme.text }}>{session.user?.fullName || 'Unknown'}</p>
                        <p className="text-xs" style={{ color: theme.textMuted }}>{session.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {session.character?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm" style={{ color: theme.text }}>{session.character?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: theme.textMuted }}>{session.messageCount}</td>
                  <td className="px-6 py-4 text-xs" style={{ color: theme.textMuted }}>{formatDate(session.lastMessageAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => viewMessages(session)}
                        className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-700 font-medium"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => deleteChat(session)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-12" style={{ color: theme.textMuted }}>No chat sessions yet</div>
        )}
      </div>

      {/* Messages Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" style={{ backgroundColor: theme.cardBackground }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <h3 className="font-bold" style={{ color: theme.text }}>
                  {selectedSession.user?.fullName} &rarr; {selectedSession.character?.name}
                </h3>
                <p className="text-xs" style={{ color: theme.textMuted }}>{messages.length} messages</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="p-2 rounded-lg transition-colors" style={{ color: theme.textMuted }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-br-md'
                        : 'rounded-bl-md'
                    }`} style={msg.sender === 'ai' ? { backgroundColor: isDark ? '#374151' : '#F3F4F6', color: theme.text } : {}}>
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/60' : ''}`} style={msg.sender === 'ai' ? { color: theme.textMuted } : {}}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
