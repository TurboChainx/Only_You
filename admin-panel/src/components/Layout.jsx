import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Bot, MessageSquare,
  LogOut, Menu, X, Moon, Sun, BarChart3, Bell,
  FileText, Settings, Smartphone, Server, Wifi
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/characters', label: 'AI Characters', icon: Bot },
  { path: '/chats', label: 'Chat History', icon: MessageSquare },
  { path: '/sms', label: 'SMS Viewer', icon: Smartphone },
  { path: '/devices', label: 'Devices', icon: Wifi },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/content', label: 'App Content', icon: FileText },
  { path: '/system-settings', label: 'System Config', icon: Server },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen transition-colors duration-300" style={{ backgroundColor: theme.background }}>
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col shadow-sm`}
        style={{ backgroundColor: theme.sidebarBg, borderRight: `1px solid ${theme.border}` }}
      >
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.border}` }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="Only You" className="h-8 object-contain" />
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: theme.textMuted }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-200/50'
                    : ''
                }`
              }
              style={({ isActive }) => isActive ? {} : { color: theme.textMuted }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-1" style={{ borderTop: `1px solid ${theme.border}` }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-colors"
            style={{ color: theme.textMuted }}
          >
            {isDark ? <Sun className="w-5 h-5 flex-shrink-0 text-yellow-500" /> : <Moon className="w-5 h-5 flex-shrink-0 text-indigo-500" />}
            {sidebarOpen && <span className="font-medium text-sm">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 w-full transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet context={{ theme, isDark }} />
        </div>
      </main>
    </div>
  );
}
