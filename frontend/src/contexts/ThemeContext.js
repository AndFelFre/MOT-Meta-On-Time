import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('mot_theme');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('mot_theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode
                primary: {
                  main: '#0F172A',
                  light: '#334155',
                  dark: '#020617',
                },
                secondary: {
                  main: '#10B981',
                  light: '#34D399',
                  dark: '#059669',
                },
                background: {
                  default: '#F8FAFC',
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#0F172A',
                  secondary: '#64748B',
                },
                success: {
                  main: '#10B981',
                  light: '#34D399',
                  dark: '#059669',
                },
                warning: {
                  main: '#F59E0B',
                  light: '#FCD34D',
                  dark: '#D97706',
                },
                error: {
                  main: '#E11D48',
                  light: '#FB7185',
                  dark: '#BE123C',
                },
              }
            : {
                // Dark mode
                primary: {
                  main: '#E2E8F0',
                  light: '#F8FAFC',
                  dark: '#CBD5E1',
                },
                secondary: {
                  main: '#10B981',
                  light: '#34D399',
                  dark: '#059669',
                },
                background: {
                  default: '#0F172A',
                  paper: '#1E293B',
                },
                text: {
                  primary: '#F8FAFC',
                  secondary: '#94A3B8',
                },
                success: {
                  main: '#10B981',
                  light: '#34D399',
                  dark: '#059669',
                },
                warning: {
                  main: '#F59E0B',
                  light: '#FCD34D',
                  dark: '#D97706',
                },
                error: {
                  main: '#E11D48',
                  light: '#FB7185',
                  dark: '#BE123C',
                },
              }),
        },
        typography: {
          fontFamily: '"DM Sans", "Plus Jakarta Sans", sans-serif',
          h1: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 700,
          },
          h2: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 700,
          },
          h3: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 600,
          },
          h4: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.5)',
                transition: 'all 0.3s ease-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: mode === 'light'
                    ? '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    : '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 8,
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
