/**
 * Local Theme Configuration
 * All themes are defined and stored locally
 * No external theme fetching or dependencies
 */

export type ThemeName = 'default' | 'leblanc' | 'luffy';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  sidebar: string;
  text: string;
  border: string;
}

export interface Theme {
  name: ThemeName;
  label: string;
  description: string;
  colors: ThemeColors;
  wallpaperPath: string; // Base path for this theme's wallpapers
}

/**
 * Local Theme Definitions
 * All themes are fully self-contained and don't require external data
 */
export const THEMES: Record<ThemeName, Theme> = {
  default: {
    name: 'default',
    label: 'Default',
    description: 'Clean and modern default theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      background: '#f3f4f6',
      sidebar: '#1f2937',
      text: '#1f2937',
      border: '#e5e7eb',
    },
    wallpaperPath: '/wallpapers/default',
  },
  leblanc: {
    name: 'leblanc',
    label: 'Le Blanc',
    description: 'Elegant purple and dark theme',
    colors: {
      primary: '#e0d5f5',
      secondary: '#b59bd6',
      accent: '#8b7ba8',
      background: '#2a2640',
      sidebar: '#1a1428',
      text: '#e0d5f5',
      border: '#4a4270',
    },
    wallpaperPath: '/wallpapers/leblanc',
  },
  luffy: {
    name: 'luffy',
    label: 'Luffy',
    description: 'Bold red and orange adventure theme',
    colors: {
      primary: '#ff4444',
      secondary: '#ffaa00',
      accent: '#ffdd00',
      background: '#fff8dc',
      sidebar: '#1a1a1a',
      text: '#1a1a1a',
      border: '#ff8800',
    },
    wallpaperPath: '/wallpapers/luffy',
  },
};

/**
 * CSS Variables mapping for each theme
 * Used to inject theme colors into CSS
 */
export const themeCSSVariables: Record<ThemeName, Record<string, string>> = {
  default: {
    '--color-primary': '#3b82f6',
    '--color-secondary': '#10b981',
    '--color-accent': '#f59e0b',
    '--color-background': '#f3f4f6',
    '--color-sidebar': '#1f2937',
    '--color-text': '#1f2937',
    '--color-border': '#e5e7eb',
  },
  leblanc: {
    '--color-primary': '#e0d5f5',
    '--color-secondary': '#b59bd6',
    '--color-accent': '#8b7ba8',
    '--color-background': '#2a2640',
    '--color-sidebar': '#1a1428',
    '--color-text': '#e0d5f5',
    '--color-border': '#4a4270',
  },
  luffy: {
    '--color-primary': '#ff4444',
    '--color-secondary': '#ffaa00',
    '--color-accent': '#ffdd00',
    '--color-background': '#fff8dc',
    '--color-sidebar': '#1a1a1a',
    '--color-text': '#1a1a1a',
    '--color-border': '#ff8800',
  },
};

/**
 * Theme metadata and configuration
 */
export const themeConfig = {
  version: '1.0',
  storageKey: 'strelitzia-theme',
  defaultTheme: 'default' as ThemeName,
  availableThemes: ['default', 'leblanc', 'luffy'] as ThemeName[],
  persistence: {
    enabled: true,
    storage: 'localStorage',
    key: 'strelitzia-theme',
  },
  description: 'Complete local theme system with no external dependencies',
};

/**
 * Get theme by name
 */
export const getTheme = (name: ThemeName): Theme => {
  return THEMES[name] || THEMES.default;
};

/**
 * Get all available themes
 */
export const getAllThemes = (): Theme[] => {
  return Object.values(THEMES);
};

/**
 * Get theme CSS variables for injection
 */
export const getThemeCSSVariables = (themeName: ThemeName): Record<string, string> => {
  return themeCSSVariables[themeName] || themeCSSVariables.default;
};

/**
 * Inject theme CSS variables into document root
 */
export const applyThemeVariables = (themeName: ThemeName): void => {
  const variables = getThemeCSSVariables(themeName);
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};
