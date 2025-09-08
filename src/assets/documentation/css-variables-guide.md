# Color System and Global Variables Documentation

## Overview

This file defines the core color system and global styling variables for the application using CSS custom properties. The color system follows a numeric scale from 50 to 900, where 500 is considered the base color for each palette.

## Color Palettes

### Main Colors

- **Primary**: Purple-based palette (`--primary-*`)

  - Base color (#4F008C)
  - Range: 50-900
  - Usage: Main brand color, primary actions, highlights

- **Secondary**: Pink/Red-based palette (`--secondary-*`)

  - Base color (#FF375E)
  - Range: 50-900
  - Usage: Secondary actions, accents

- **Gray**: Neutral gray palette (`--gray-*`)
  - Range: 0-900 (includes pure white at 0)
  - Usage: Text, backgrounds, borders

### Status Colors

- **Success**: Green palette (`--success-*`)
- **Danger**: Red palette (`--danger-*`)
- **Warning**: Yellow palette (`--warning-*`)

### Neutral Colors

- **Monlight**: Purple-tinted neutral (`--monlight-*`)
- **Silver**: Cool gray (`--silver-*`)
- **Onyx**: Dark blue-gray (`--onyx-*`)
- **Sunset**: Orange (`--sunset-*`)
- **Oases**: Green (`--oases-*`)
- **Sea**: Cyan (`--sea-*`)
- **Premium**: Gold (`--premium-*`)

## Global Variables

### Layout

- `--surface-main-bg`: Main background color (#f8f8f8)
- `--layout-gap`: Standard spacing (15px)

### Component Styling

- `--btn-border-radius`: Button border radius (0.25rem)
- `--card-border-radius`: Card border radius (0.5rem)
- `--btn-default-font-weight`: Button font weight (700)

### Typography

- `--font-family`: Primary font (STCForward-Regular, sans-serif)
- `--font-size`: Base font size (14px)
- `--text-muted`: Muted text color (#bcbcbc)

## Usage Example

```
scss
 .my-element {
     background-color: var(--primary-500);
     color: var(--gray-0);
     border-radius: var(--card-border-radius);
 }
```

## Color Scale Convention

- 50-300: Light shades
- 400-600: Medium shades
- 700-900: Dark shades
- 500: Base color
- Lower numbers are lighter, higher numbers are darker
