import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({});

const lightTheme = {
  background: '#F9FAFB',
  cardBackground: '#FFFFFF',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  sidebarBg: '#FFFFFF',
  sidebarBorder: '#E5E7EB',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  tableRowHover: '#F9FAFB',
  gradient: ['#EC4899', '#8B5CF6'],
};

const darkTheme = {
  background: '#111827',
  cardBackground: '#1F2937',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  border: '#374151',
  sidebarBg: '#1F2937',
  sidebarBorder: '#374151',
  inputBg: '#374151',
  inputBorder: '#4B5563',
  tableRowHover: '#374151',
  gradient: ['#EC4899', '#8B5CF6'],
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('admin_theme');
    return saved ? saved === 'dark' : false;
  });

  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    localStorage.setItem('admin_theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
