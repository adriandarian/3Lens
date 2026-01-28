---
title: 3Lens Branding Assets
description: Branding assets including logos, favicons, and brand guidelines for the 3Lens documentation site
---

# 3Lens Branding Assets

This directory contains all branding assets for the 3Lens documentation site.

## Files

| File | Size | Purpose |
|------|------|---------|
| `logo.svg` | 128x128 | Primary logo (light mode) |
| `logo-dark.svg` | 128x128 | Logo variant for dark backgrounds |
| `favicon.ico` | Multi-size | Browser tab icon |
| `favicon-16x16.png` | 16x16 | Small favicon |
| `favicon-32x32.png` | 32x32 | Standard favicon |
| `apple-touch-icon.svg` | 180x180 | iOS home screen icon |
| `og-image.svg` | 1200x630 | Open Graph image for social sharing |

## Brand Colors

### Primary Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Purple | `#646cff` | Primary brand color, links, accents |
| Green | `#42d392` | Success states, secondary accent |
| Light Purple | `#747bff` | Dark mode primary, hover states |

### Extended Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Warning Yellow | `#ffc517` | Warning states, caution |
| Error Red | `#ff5757` | Error states, danger |
| Info Cyan | `#00bcd4` | Informational content |

## Logo Design

The 3Lens logo consists of **three overlapping lens circles** representing:

1. **Debugging** - The first lens for inspecting issues
2. **Analysis** - The second lens for understanding performance
3. **Optimization** - The third lens for improving applications

The overlapping design symbolizes how these three aspects work together to provide comprehensive developer tools.

### Logo Variants

- **Standard (`logo.svg`)** - For use on light backgrounds
- **Dark (`logo-dark.svg`)** - Enhanced brightness for dark backgrounds
- **Monochrome** - Can be created using single color fill

## Usage Guidelines

### Do's

✅ Use the logo with adequate spacing around it  
✅ Use provided color variants for different backgrounds  
✅ Scale proportionally (maintain aspect ratio)  
✅ Use SVG format when possible for crisp rendering

### Don'ts

❌ Don't stretch or distort the logo  
❌ Don't change the logo colors outside brand palette  
❌ Don't add effects (shadows, gradients) not in original  
❌ Don't use low-resolution versions when SVG is available

## Generating PNG Files

For production, generate PNG files from SVGs:

```bash
# Using Inkscape (recommended)
inkscape logo.svg --export-type=png --export-width=128 -o logo.png
inkscape logo.svg --export-type=png --export-width=32 -o favicon-32x32.png
inkscape logo.svg --export-type=png --export-width=16 -o favicon-16x16.png
inkscape og-image.svg --export-type=png --export-width=1200 -o og-image.png
inkscape apple-touch-icon.svg --export-type=png --export-width=180 -o apple-touch-icon.png

# Using ImageMagick
convert -background none logo.svg -resize 128x128 logo.png
convert -background none logo.svg -resize 32x32 favicon-32x32.png
convert -background none logo.svg -resize 16x16 favicon-16x16.png

# Generate ICO file with multiple sizes
convert logo.svg -resize 16x16 favicon-16.png
convert logo.svg -resize 32x32 favicon-32.png
convert logo.svg -resize 48x48 favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico
```

## Online Tools

- [Real Favicon Generator](https://realfavicongenerator.net/) - Generate complete favicon package
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimize SVG files
- [Squoosh](https://squoosh.app/) - Compress PNG/WebP images

## Social Media Dimensions

| Platform | Recommended Size |
|----------|-----------------|
| Open Graph | 1200x630 |
| Twitter Card | 1200x600 |
| LinkedIn | 1200x627 |
| Facebook | 1200x630 |
