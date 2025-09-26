import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </span>
      <span className="theme-toggle__glow" aria-hidden="true">
        <Sparkles size={10} />
      </span>
    </button>
  );
};

export default ThemeToggle;
