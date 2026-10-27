# ASTRA — Stardust Divination Demo

An interactive, immersive divination web demo built as a single-page app with **Three.js** (stardust particle field) and **MediaPipe Hands** (gesture interaction), both loaded via CDN.

## Features
- **Six divination systems**: Tarot, I Ching (Liuyao), Numerology, 28 Mansions, Norse Runes, Temple Oracle.
- **Immersive visuals**: real-time Three.js stardust particle scene with dual themes — *Night Rite* (dark) and *Day Oracle* (light).
- **Bilingual UI**: Chinese / English switching.
- **Gesture interaction**: shake-to-cast (mobile) and hand-tracking card flipping (desktop, MediaPipe, camera processed locally).
- **Self-contained frontend**: no build step, no backend required.

## Current Status
This demo ships with **local mock readings** (no live model API). To connect a real LLM (e.g. StepFun), replace the `mockReading` call in `app.js` with a `/api/reading` proxy.

## Run Locally
Just open `index.html` in a browser. For gesture/camera features, serve over `http://` (e.g. `python -m http.server`) and grant camera permission.

## Deploy (GitHub Pages)
Upload the three files to your repo root and enable Pages:
- `index.html`
- `app.js`
- `styles.css`

Three.js and MediaPipe are fetched from CDN at runtime, so an internet connection is required when viewing.

## Files
| File | Description |
|------|-------------|
| `index.html` | Entry page |
| `app.js` | Particle engine, state machine, six systems, gestures |
| `styles.css` | Theming (Night Rite / Day Oracle) |
