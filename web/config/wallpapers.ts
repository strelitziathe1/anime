/**
 * Local Wallpaper Configuration
 * Maps character IDs to local wallpaper paths
 * All wallpapers are stored in /public/wallpapers/{theme}/
 */

export const wallpaperConfig = {
  default: {
    // Anime & Fantasy
    mob: '/wallpapers/default/mob-psycho-purple.jpg',
    reigen: '/wallpapers/default/reigen-pink.jpg',
    thorfinn: '/wallpapers/default/thorfinn-warrior.jpg',
    askeladd: '/wallpapers/default/askeladd-dark.jpg',
    
    // More characters - fallback to placeholder
    placeholder: '/wallpapers/default/placeholder.jpg',
  },
  leblanc: {
    // Le Blanc theme (Purple/Elegant)
    mob: '/wallpapers/leblanc/mob-psycho-purple.jpg',
    reigen: '/wallpapers/leblanc/reigen-elegant.jpg',
    thorfinn: '/wallpapers/leblanc/thorfinn-leblanc.jpg',
    askeladd: '/wallpapers/leblanc/askeladd-leblanc.jpg',
    
    // Fallback
    placeholder: '/wallpapers/leblanc/placeholder.jpg',
  },
  luffy: {
    // Luffy theme (Red/Orange/Adventure)
    mob: '/wallpapers/luffy/mob-psycho-red.jpg',
    reigen: '/wallpapers/luffy/reigen-adventure.jpg',
    thorfinn: '/wallpapers/luffy/thorfinn-adventure.jpg',
    askeladd: '/wallpapers/luffy/askeladd-adventure.jpg',
    
    // Fallback
    placeholder: '/wallpapers/luffy/placeholder.jpg',
  },
};

/**
 * Get wallpaper path for a character in a specific theme
 * Falls back to placeholder if character-specific wallpaper not found
 */
export const getWallpaperPath = (
  characterId: string,
  theme: 'default' | 'leblanc' | 'luffy' = 'default'
): string => {
  const themeWallpapers = wallpaperConfig[theme];
  return themeWallpapers[characterId as keyof typeof themeWallpapers] || themeWallpapers.placeholder;
};

/**
 * Get all wallpapers for a theme
 */
export const getThemeWallpapers = (theme: 'default' | 'leblanc' | 'luffy' = 'default'): string[] => {
  return Object.values(wallpaperConfig[theme]);
};

/**
 * Wallpaper asset registry
 * Document all wallpapers needed and their purpose
 */
export const wallpaperAssets = {
  description: 'Local wallpaper storage structure',
  directories: {
    default: {
      path: '/public/wallpapers/default',
      theme: 'Default/Neutral theme',
      format: 'jpg or png',
      resolution: '1920x1080 (16:9)',
    },
    leblanc: {
      path: '/public/wallpapers/leblanc',
      theme: 'Le Blanc (Purple/Elegant)',
      format: 'jpg or png',
      resolution: '1920x1080 (16:9)',
    },
    luffy: {
      path: '/public/wallpapers/luffy',
      theme: 'Luffy (Red/Orange/Adventure)',
      format: 'jpg or png',
      resolution: '1920x1080 (16:9)',
    },
  },
  notes: {
    localOnly: 'All wallpapers are served locally from /public/wallpapers/',
    noExternalDependencies: 'No external image hosting required',
    themeVariations: 'Each theme has its own color-matched wallpaper variations',
    fallback: 'Placeholder image used if specific character wallpaper not found',
    optimization: 'Images should be optimized for web (compressed, responsive)',
  },
};
