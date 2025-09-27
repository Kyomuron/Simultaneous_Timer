# Simulcast Stopwatch Overlay

Browser-based stopwatch overlay designed for OBS scenes. The layout delivers a glassmorphic timer card with stable digit alignment, optional frame, and keyboard-friendly controls. All visuals are contained in `obs-timer.html`, with logic handled by `obs-timer.js`.

## Repository Contents
- `obs-timer.html` – Markup and styling for the overlay surface, including the timer shell and button layout.
- `obs-timer.js` – Stopwatch logic, keyboard shortcuts, and support for URL-based customization.

## Quick Start
1. Open `obs-timer.html` in a browser (or serve it from a local web server) to verify the overlay.
2. In OBS, add a **Browser Source** and point it to the local file path or hosted URL for `obs-timer.html`.
3. Set the browser source width/height to match your canvas. The overlay is responsive, so larger resolutions will simply scale the glow card.
4. (Optional) Append query parameters to the URL to customize colors, text, or behaviour (see below).

## Overlay Controls
- Buttons: `Start/Pause`, `Reset`, `Marker`.
- Keyboard shortcuts (source must be focused):
  - `Space` / `Enter` – Toggle start/pause.
  - `R` – Reset timer.
  - `M` – Drop a marker flash.
  - `C` – Show/hide the control buttons for clean captures.

Markers briefly boost the glow and status label, then return to the previous run state.

## Customization via Query Parameters
Append parameters to the overlay URL, e.g. `obs-timer.html?title=Showtime&accent=%23FF6B6B&autostart=1`.

| Parameter    | Example                     | Purpose                                                                    | Default value          |
|--------------|-----------------------------|-------------------------------------------------------------------------------|------------------------|
| `title`      | `title=Simulcast+Timer`      | Upper title displayed above the clock.                                       | `Simulcast Timer`      |
| `subtitle`   | `subtitle=Live+Session`      | Optional small subtitle under the title.                                     | (hidden)               |
| `accent`     | `accent=%2338bdf8`           | Hex or CSS colour for highlights, buttons, and marker glow.                  | `#38bdf8`              |
| `bg`         | `bg=rgba(0,0,0,0)`           | Background colour of the page—set to transparent for OBS.                    | `transparent`          |
| `glow`       | `glow=rgba(56,189,248,0.8)`  | Colour used by the digit glow.                                               | `rgba(56, 189, 248, 0.65)` |
| `font`       | `font=Inter`                 | Primary font family (Google Fonts is auto-loaded when supplied).             | `Poppins`              |
| `controls`   | `controls=0`                 | Hide the control buttons for clean overlay capture.                          | `1` (controls visible) |
| `frame`      | `frame=0`                    | Hide the glass frame and use floating digits only.                           | `1` (frame enabled)    |
| `autostart`  | `autostart=1`                | Start the timer automatically when the page loads.                           | `0`                    |
| `markerFlash`| `markerFlash=2000`           | Marker glow duration in milliseconds (clamped between 400–8000).             | `1400`                 |

All colour parameters accept any CSS colour syntax. Special characters should be URL encoded (`#` → `%23`).

## Styling Notes
- The timer is sized with responsive CSS variables. Adjust `--time-size` inside `:root` in `obs-timer.html` if you need a tighter or larger fit.
- The `.time-shell` element expands to fit the digit slots, keeping the glow background perfectly aligned with the numerals.
- Toggle `frame=0` for frameless mode; the digits remain fixed thanks to the slot-based layout.

## Development Tips
- Open `obs-timer.html` directly to test changes; the script and styles are embedded, so no build step is required.
- When editing CSS, prefer preserving `ch`-based widths on `.time-slot` to maintain the fixed digit alignment.

Enjoy the overlay!
