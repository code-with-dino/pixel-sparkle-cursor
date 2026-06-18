const files = [
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

const row = document.getElementById("preview");
const countEl = document.getElementById("popup-count");
const countVal = document.getElementById("popup-count-value");
const sizeEl = document.getElementById("popup-size");
const sizeVal = document.getElementById("popup-size-value");
const btns = {
  gravity: document.getElementById("popup-gravity"),
  float: document.getElementById("popup-float"),
  burst: document.getElementById("popup-burst"),
  rain: document.getElementById("popup-rain"),
};

function setActivePhysics(mode) {
  Object.values(btns).forEach((btn) => btn?.classList.remove("active"));
  if (btns[mode]) btns[mode].classList.add("active");
}

function storageAvailable() {
  return (
    typeof chrome !== "undefined" && chrome.storage && chrome.storage.local
  );
}

function readSettings(callback) {
  if (!storageAvailable()) {
    callback({ spawnCount: 0.15, baseSize: 22, physics: "gravity" });
    return;
  }

  chrome.storage.local.get(
    { spawnCount: 0.15, baseSize: 22, physics: "gravity" },
    (items) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn(
          "popup storage read failed:",
          chrome.runtime.lastError.message,
        );
        callback({ spawnCount: 0.15, baseSize: 22, physics: "gravity" });
      } else {
        callback(
          items || { spawnCount: 0.15, baseSize: 22, physics: "gravity" },
        );
      }
    },
  );
}

function writeSettings(payload) {
  if (!storageAvailable()) return;
  chrome.storage.local.set(payload, () => {
    if (chrome.runtime && chrome.runtime.lastError) {
      console.warn(
        "popup storage write failed:",
        chrome.runtime.lastError.message,
      );
    }
  });
}

function updateUI(settings) {
  if (!countEl || !countVal || !sizeEl || !sizeVal) return;

  countEl.value = settings.spawnCount;
  countVal.textContent = parseFloat(settings.spawnCount).toFixed(2);
  sizeEl.value = settings.baseSize;
  sizeVal.textContent = settings.baseSize;
  setActivePhysics(settings.physics || "gravity");
}

files.forEach((fileName) => {
  if (!row) return;
  const img = document.createElement("img");
  img.src = chrome.runtime.getURL(`sprites/${fileName}`);
  img.title = fileName.replace(".png", "");
  row.appendChild(img);
});

readSettings(updateUI);

if (countEl) {
  countEl.addEventListener("input", (event) => {
    const value = parseFloat(event.target.value);
    countVal.textContent = value.toFixed(2);
    writeSettings({ spawnCount: value });
  });
}

if (sizeEl) {
  sizeEl.addEventListener("input", (event) => {
    const value = parseInt(event.target.value, 10);
    sizeVal.textContent = value;
    writeSettings({ baseSize: value });
  });
}

Object.entries(btns).forEach(([mode, button]) => {
  if (!button) return;
  button.addEventListener("click", () => {
    writeSettings({ physics: mode });
    setActivePhysics(mode);
  });
});
