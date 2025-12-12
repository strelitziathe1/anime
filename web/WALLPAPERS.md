# Wallpaper Management Commands

Add these scripts to `web/package.json` for easy wallpaper management:

```json
{
  "scripts": {
    "wallpapers:generate": "node scripts/generate-placeholders.js",
    "wallpapers:optimize": "node scripts/optimize-wallpapers.js",
    "wallpapers:list": "node scripts/list-wallpapers.js",
    "wallpapers:validate": "node scripts/validate-wallpapers.js"
  }
}
```

## Available Commands

### Generate Placeholders
```bash
npm run wallpapers:generate
```
Creates placeholder images for all themes until you add real wallpapers.

### Optimize Wallpapers
```bash
npm run wallpapers:optimize
```
Compresses and optimizes all wallpaper images for web delivery.

### List Wallpapers
```bash
npm run wallpapers:list
```
Lists all wallpapers and their file sizes.

### Validate Wallpapers
```bash
npm run wallpapers:validate
```
Checks wallpaper dimensions, file sizes, and references.

## File Locations

- **Wallpaper Scripts:** `scripts/`
- **Wallpaper Config:** `web/config/wallpapers.ts`
- **Theme Config:** `web/config/themes.ts`
- **Character Data:** `web/data/characters*.ts`
- **Public Wallpapers:** `web/public/wallpapers/{theme}/`

## Quick Setup

1. Generate placeholders:
   ```bash
   npm run wallpapers:generate
   ```

2. Add your wallpapers:
   ```bash
   cp your-wallpapers/*.jpg web/public/wallpapers/default/
   cp your-wallpapers/*.jpg web/public/wallpapers/leblanc/
   cp your-wallpapers/*.jpg web/public/wallpapers/luffy/
   ```

3. Optimize images:
   ```bash
   npm run wallpapers:optimize
   ```

4. Update configuration:
   - Edit `web/config/wallpapers.ts` to map character IDs
   - Update character data files with new paths

5. Validate setup:
   ```bash
   npm run wallpapers:validate
   ```

## Configuration Reference

### wallpapers.ts
Maps character IDs to wallpaper file paths:
```typescript
export const wallpaperConfig = {
  default: {
    characterId: '/wallpapers/default/image.jpg',
  },
  leblanc: {
    characterId: '/wallpapers/leblanc/image.jpg',
  },
  luffy: {
    characterId: '/wallpapers/luffy/image.jpg',
  },
};
```

### themes.ts
Defines all available themes:
```typescript
export const THEMES: Record<ThemeName, Theme> = {
  default: { /* ... */ },
  leblanc: { /* ... */ },
  luffy: { /* ... */ },
};
```

## Integration with Next.js

The wallpaper system integrates seamlessly with Next.js:

- **Static Files:** `/public/wallpapers/` served by Next.js
- **Dynamic Paths:** Use `getWallpaperPath()` function
- **Image Optimization:** Next.js `Image` component ready
- **Caching:** Browser cache + Next.js static caching

## Using in Components

```typescript
import { getWallpaperPath } from '@/config/wallpapers';
import Image from 'next/image';

export function CharacterWallpaper({ characterId, theme = 'default' }) {
  const src = getWallpaperPath(characterId, theme);
  
  return (
    <Image
      src={src}
      alt={`${characterId} wallpaper`}
      width={1920}
      height={1080}
      quality={85}
      priority={false}
    />
  );
}
```

## Best Practices

✅ **DO:**
- Keep all wallpapers local in `/public/wallpapers/`
- Optimize images before adding
- Use consistent naming conventions
- Update config when adding wallpapers
- Maintain theme-specific variations

❌ **DON'T:**
- Link to external CDNs or image hosting
- Use unoptimized high-resolution images
- Hardcode wallpaper paths
- Skip the configuration step
- Mix local and external wallpapers

## Troubleshooting

### Wallpaper Not Loading
```bash
# Check file exists
ls -la web/public/wallpapers/*/

# Check Next.js serving static files
npm run dev  # Restart dev server

# Check browser console for 404 errors
```

### Images Too Large
```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Optimize all images
npm run wallpapers:optimize
```

### Theme Not Applied
```bash
# Check theme in localStorage
localStorage.getItem('strelitzia-theme')

# Clear cache and rebuild
rm -rf .next
npm run build && npm start
```

See **WALLPAPERS_AND_THEMES.md** for detailed setup instructions!
