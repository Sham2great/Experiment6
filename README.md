# OTHERWORLD — Experiment 06

An atmospheric, interactive 3D experience built directly for the browser.

## Current prototype

**Prototype 01 — The Threshold**

- Cinematic opening screen
- Procedural Three.js environment and floating mechanism
- Drag interaction to rotate the machine
- Activation sequence that opens the gateway
- Five selectable realities: Eden, Inversion, Afterlight, Resonance and Paradox
- Responsive layout for desktop and mobile
- Optional sound toggle (audio is off by default)

## Run it

This is a static site. No build step or package installation is required.

Open `index.html` locally through a static server, or enable GitHub Pages:

1. Open the repository's **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main** and **/(root)**, then save.

The live site will appear at:

`https://sham2great.github.io/Experiment6/`

## Files

- `index.html` — page structure and interface
- `styles.css` — visual system, layout and responsive styling
- `app.js` — Three.js scene, animation and interactions

Three.js is loaded from jsDelivr as an ES module. Google Fonts are used for typography. An internet connection is required for those external assets.

## Direction

OTHERWORLD is designed as a series of distinct realities connected by a mysterious machine. The current build establishes the visual identity and first interaction loop. The next development stages will give each world its own explorable environment and mechanic.
