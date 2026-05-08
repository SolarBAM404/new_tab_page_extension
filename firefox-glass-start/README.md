# GX Glass Start for Firefox

A Firefox WebExtension version of GX Glass Start with:

- Draggable widget layout
- Folder-based quick links
- Drag links between folders
- RSS feed widgets
- Glass-style modern UI with textured background
- Custom title, date format, background presets, custom background/glow colors, glass strength, blur, radius, density, text scale, texture, and animation controls
- Saved layout and data using Firefox extension storage

## Install Temporarily In Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select this folder's `manifest.json`.
4. Open a new tab.
5. If Firefox asks whether the extension can replace the New Tab page, allow it.

Temporary add-ons are removed when Firefox restarts. For regular use, package and sign the extension through Mozilla Add-ons.

## Firefox Notes

- This version uses Manifest V3 with `background.scripts`, which is the Firefox-compatible background model.
- The original Opera GX package uses Chromium's `background.service_worker`.
- RSS refreshes depend on feed server rules and Firefox extension host permissions.
- New Tab replacement can be disabled from Firefox's extension management page.

## How To Use

- **New Folder**: create a quick-link folder card.
- **Add RSS Feed**: create a feed card from any RSS/Atom URL.
- **Link modals**: create and edit quick links without browser prompt dialogs, including optional custom icon URLs.
- **Feed Controls**: use the RSS controls modal to edit sources, add sources, delete sources, and choose how many feed items to show.
- **Lock Layout**: hide all customization controls and prevent layout edits.
- **Customize**: set the title, date format, background presets/colors, glow colors, texture, glass strength, blur, card radius, density, text scale, and animations.
- **Custom date pattern** supports `YYYY`, `YY`, `MMMM`, `MMM`, `MM`, `M`, `DD`, `D`, `dddd`, `ddd`, `HH`, `H`, `hh`, `h`, `mm`, `m`, `ss`, `s`, and `A`.
- **Export Layout**: download a shareable JSON layout file.
- **Import Layout**: load a layout JSON file and replace your current layout.
- **Drag cards**: move widgets around the board.
- **Section controls**: collapse or expand each widget, and switch unlocked widgets between vertical and horizontal content layouts.
- **Drag links**: drag a link from one folder into another.

## Share Layouts

1. Click **Export Layout** to save a layout file.
2. Share that `.json` file with another user.
3. They click **Import Layout**, review the import preview, and confirm.

Import behavior:

- Import **replaces** the current layout.
- If a layout is locked, customization controls stay hidden until it is unlocked.
- Export includes structure/settings only and excludes temporary RSS cached article data.
- Layout files must match the current layout version.
