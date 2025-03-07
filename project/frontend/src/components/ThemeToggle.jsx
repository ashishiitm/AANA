import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {isDark ? '🌞' : '🌙'}
    </button>
  );
}