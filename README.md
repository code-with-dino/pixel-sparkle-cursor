# Build a Pixel Sparkle Cursor Chrome Extension with JavaScript

**Level:** Intermediate | **Tech:** HTML, CSS, JavaScript, Chrome Extension APIs

> Move your cursor anywhere on the web and watch pixel hearts and stars trail behind you — on every website, automatically!

---

## What You'll Build

A Chrome Extension that injects a canvas overlay into every webpage and renders animated pixel-art hearts and stars as you move your cursor. No libraries, no frameworks — just vanilla JS and the Chrome Extensions API.

By the end of this tutorial, you'll know how to:

- Structure a Manifest V3 Chrome extension
- Use **content scripts** to inject code into any webpage
- Draw pixel-art shapes with the **Canvas 2D API**
- Animate particles with `requestAnimationFrame`
- Package and load an unpacked extension in Chrome

---

## What You'll Need

- Google Chrome (any recent version)
- A code editor (VS Code recommended)
- Basic JavaScript knowledge — if you've done loops and functions, you're good!

No npm, no installs. Just files. Let's go.

---

## Project Structure

```
pixel-sparkle-extension/
├── manifest.json    ← tells Chrome about our extension
├── content.js       ← the magic: canvas + particle animation
├── popup.html       ← the little UI when you click the extension icon
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Load It in Chrome

1. Open Chrome and go to `chrome://extensions`
2. Toggle **Developer mode** on (top right)
3. Click **Load unpacked**
4. Select your `pixel-sparkle-extension` folder
5. Open any webpage and move your mouse!

If you update your code, click the 🔄 refresh button on the extension card.

---

## Customization Ideas

Want to make it your own? Try these:

**Change the shapes:** Edit the pixel grid arrays in `drawPixelHeart` and `drawPixelStar`. You could make mushrooms 🍄, gems 💎, or literally any 5×5 shape!

**Change spawn count:** In `spawnParticles`, change `i < 3` to `i < 6` for more particles.

**Change physics:** `p.vy += 0.05` is gravity. Make it `0` for zero-gravity floating, or `-0.02` for particles that drift upward forever.

**Add a toggle:** Use Chrome's `storage.sync` API to save an on/off preference and check it before spawning particles.

---

## What's Next?

- Publish it to the Chrome Web Store (you'll need a $5 developer account)
- Add a color theme picker in the popup
- Support Stardew Valley item sprites as PNG images using `drawImage()` on the canvas
- Make it work as a Firefox extension too (very small changes needed!)

---

## Resources

- [Chrome Extensions Docs (Manifest V3)](https://developer.chrome.com/docs/extensions/mv3/)
- [Canvas 2D API Reference — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Piskel — Free Pixel Art Editor](https://www.piskelapp.com/)
- [Lospec — Pixel Art Palettes](https://lospec.com/palette-list)

---

_Built with 💗 for the Codédex June 2026 Monthly Challenge_
