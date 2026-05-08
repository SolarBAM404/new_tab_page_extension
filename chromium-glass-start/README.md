# GX Glass Start for Chromium

A Chromium-compatible New Tab page extension with:

- Draggable widget layout
- Folder-based quick links
- Drag links between folders
- RSS feed widgets
- Glass-style modern UI with textured background
- Custom title, date format, background presets, custom background/glow colors, glass strength, blur, radius, density, text scale, texture, and animation controls
- Saved layout and data using Chromium extension storage

## Install In Chromium Browsers

1. Open your browser's extensions page, such as `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `chromium-glass-start`.
5. Open a new tab.
6. If another New Tab replacement takes priority, click the extension icon to open the dashboard directly.

## If New Tab Is Not Replaced

1. Disable any other extension that overrides New Tab.
2. Toggle this extension off, then on, then open a fresh tab.
3. Keep **Developer mode** enabled while using this unpacked version.
4. Use the extension icon as fallback launcher (it opens the same dashboard page).
5. Add a custom keyboard shortcut from your browser's extension shortcuts page for **Open GX Glass Start dashboard**.

## Chromium Notes

- This version uses Manifest V3 with `background.service_worker`.
- It is intended for Chromium-compatible browsers such as Chrome, Edge, Brave, Vivaldi, and Opera.
- RSS refreshes depend on feed server rules and extension host permissions.
- New Tab replacement can be disabled from the browser's extension management page.

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
