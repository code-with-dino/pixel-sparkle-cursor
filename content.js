// Pixel Sparkle Cursor - Content Script
// Injects a canvas overlay and animates pixel hearts + stars on mousemove

(function () {
  if (document.getElementById("pixel-sparkle-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "pixel-sparkle-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647",
  });
  document.documentElement.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Pastel palette — hearts get pinks, stars get soft rainbow
  const HEART_COLORS = ["#ffb3c6", "#ff85a1", "#ffc8dd", "#ff006e", "#ffccd5"];
  const STAR_COLORS = ["#fff8b0", "#b0e8ff", "#c8b0ff", "#b0ffda", "#ffd6f5"];

  let particles = [];
  // Runtime-configurable settings (can be changed from the popup)
  let spawnCount = 0.15; // fractional allowed, slightly more visible by default
  let baseSize = 22;
  let physics = "gravity";
  let storageEnabled = true;

  function loadSavedSettings() {
    if (!storageEnabled || !chrome.storage || !chrome.storage.local) return;

    try {
      chrome.storage.local.get({ spawnCount, baseSize, physics }, (items) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          storageEnabled = false;
          return;
        }
        if (!items) return;
        try {
          if (typeof items.spawnCount === "number")
            spawnCount = items.spawnCount;
          if (typeof items.baseSize === "number") baseSize = items.baseSize;
          if (typeof items.physics === "string") physics = items.physics;
        } catch (err) {
          storageEnabled = false;
        }
      });
    } catch (err) {
      storageEnabled = false;
    }
  }

  try {
    loadSavedSettings();

    if (chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes) => {
        if (
          changes.spawnCount &&
          typeof changes.spawnCount.newValue === "number"
        ) {
          spawnCount = changes.spawnCount.newValue;
        }
        if (changes.baseSize && typeof changes.baseSize.newValue === "number") {
          baseSize = changes.baseSize.newValue;
        }
        if (changes.physics && typeof changes.physics.newValue === "string") {
          physics = changes.physics.newValue;
        }
      });
    }
  } catch (err) {
    // Not fatal — keep defaults
  }

  // Try to preload image sprites from the extension's sprites/ folder.
  // If loading fails or none are available, the script falls back to pixel drawings.
  const SPRITE_FILES = [
    "heart.png",
    "starfruit.png",
    "strawberry.png",
    "mushroom.png",
    "cat1.png",
    "cat2.png",
    "cat3.png",
    "sunflower.png",
    "fairyRose.png",
    "magicRockCandy.png",
    "seeds.png",
    "book.png",
  ];
  const spriteImages = [];
  SPRITE_FILES.forEach((f) => {
    try {
      const img = new Image();
      img.src = chrome.runtime.getURL(`sprites/${f}`);
      img.onload = () => spriteImages.push(img);
      // ignore onerror — we'll simply not use images that fail to load
    } catch (err) {
      // chrome.runtime may not be available in some contexts; ignore
    }
  });

  // Draw a pixel-style heart (made of filled squares)
  function drawPixelHeart(cx, cy, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    // Classic heart pixel grid (5x4)
    const grid = [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ];
    const px = Math.max(1, Math.floor(size / 5));
    const offX = cx - (5 * px) / 2;
    const offY = cy - (5 * px) / 2;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) {
          ctx.fillRect(offX + c * px, offY + r * px, px, px);
        }
      }
    }
    ctx.restore();
  }

  // Draw a pixel-style 4-pointed star (diamond cross)
  function drawPixelStar(cx, cy, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = color;
    const px = Math.max(1, Math.floor(size / 5));
    // 5x5 diamond star grid
    const grid = [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ];
    const offX = cx - (5 * px) / 2;
    const offY = cy - (5 * px) / 2;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) {
          ctx.fillRect(offX + c * px, offY + r * px, px, px);
        }
      }
    }
    ctx.restore();
  }

  function spawnParticles(x, y) {
    // Support fractional spawn counts by spawning floor(spawnCount)
    // particles plus one extra with probability equal to the fractional part.
    const base = Math.floor(spawnCount);
    const frac = spawnCount - base;
    const extra = Math.random() < frac ? 1 : 0;
    const total = base + extra;
    const isRainMode = physics === "rain";
    const isBurstMode = physics === "burst";

    for (let i = 0; i < total; i++) {
      const isImage = spriteImages.length > 0 && Math.random() < 0.9;
      const vx = isBurstMode
        ? (Math.random() - 0.5) * 4.2
        : isRainMode
          ? (Math.random() - 0.5) * 0.5
          : (Math.random() - 0.5) * 1.8;
      const vy = isRainMode
        ? Math.random() * 1.8 + 0.4
        : isBurstMode
          ? (Math.random() - 0.5) * 4.0
          : (Math.random() - 1.4) * 2.0;
      const jitter = 14;

      const particleBase = {
        x: x + (Math.random() - 0.5) * jitter,
        y: y + (Math.random() - 0.5) * jitter,
        vx,
        vy,
        size: Math.random() * baseSize * 0.4 + baseSize * 0.6,
        life: 1,
        decay: Math.random() * 0.022 + 0.016,
      };

      if (isImage) {
        const img =
          spriteImages[Math.floor(Math.random() * spriteImages.length)];
        particles.push({ ...particleBase, img, type: "image" });
      } else {
        const isHeart = Math.random() < 0.45;
        particles.push({
          ...particleBase,
          color: isHeart
            ? HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)]
            : STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          type: isHeart ? "heart" : "star",
        });
      }
    }
  }

  window.addEventListener("mousemove", (e) => {
    spawnParticles(e.clientX, e.clientY);
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.life > 0);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      // physics
      if (physics === "gravity" || physics === "burst") {
        p.vy += 0.05;
      } else if (physics === "rain") {
        p.vy += 0.18;
        p.vx *= 0.96;
      } else if (physics === "float") {
        p.vy -= 0.025;
      }
      p.life -= p.decay;

      if (p.type === "image" && p.img) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        // simple rotation effect based on life
        ctx.drawImage(p.img, -p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      } else if (p.type === "heart") {
        drawPixelHeart(p.x, p.y, p.size, p.color, p.life);
      } else {
        drawPixelStar(p.x, p.y, p.size, p.color, p.life);
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
})();
