export const useTheme = () => {
  const theme = useState('theme', () => 'dark');

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    if (process.client) {
      localStorage.setItem('theme', theme.value);
      applyTheme();
    }
  };

  const applyTheme = () => {
    if (process.client) {
      const root = document.documentElement;
      if (theme.value === 'light') {
        root.classList.add('light-theme');
      } else {
        root.classList.remove('light-theme');
      }
    }
  };

  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        theme.value = savedTheme;
      } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        theme.value = 'light';
      }
      applyTheme();
    }
  };

  return {
    theme,
    toggleTheme,
    initTheme
  };
};
