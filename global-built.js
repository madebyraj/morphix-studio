// Configuration
const swatchSteps = {
  10: "92%",
  20: "80%",
  30: "64%",
  40: "32%",
  50: "0%",
  60: "24%",
  70: "48%",
  80: "64%",
  90: "80%",
};

// DOM elements
const colorInput = document.getElementById("color-input");
const generateBtn = document.getElementById("generate-btn");
const swatches = document.querySelectorAll(".swatch");

// Utility functions
function rgbToHex(rgb) {
  if (rgb.startsWith("#")) return rgb;

  const result = rgb.match(/\d+/g);
  if (!result || result.length < 3) return rgb;

  const r = parseInt(result[0]);
  const g = parseInt(result[1]);
  const b = parseInt(result[2]);

  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function getComputedHexColor(element) {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");

  const computedColor = window.getComputedStyle(element).backgroundColor;

  ctx.fillStyle = computedColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function normalizeColor(input) {
  let value = input.trim();

  // Remove # if user pasted it
  if (value.startsWith("#")) {
    value = value.substring(1);
  }

  // Check if it's a valid hex code (3 or 6 characters)
  const hexRegex = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  if (hexRegex.test(value)) {
    return `#${value}`;
  }

  return "";
}

function isValidInput(input) {
  return input.trim().length > 0 && normalizeColor(input) !== "";
}

function updateUIState() {
  const inputValue = colorInput.value;
  const isValid = isValidInput(inputValue);

  // Update button state
  generateBtn.disabled = !isValid;

  // Update swatches state
  swatches.forEach((swatch) => {
    if (isValid) {
      swatch.classList.remove("disabled");
    } else {
      swatch.classList.add("disabled");
    }
  });
}

function updatePalette(color) {
  // Update CSS variables
  document.documentElement.style.setProperty("--color", color);

  Object.keys(swatchSteps).forEach((key) => {
    let mix;
    if (key < 50) {
      mix = `color-mix(in srgb, ${color}, white ${swatchSteps[key]})`;
    } else if (key == 50) {
      mix = color;
    } else {
      mix = `color-mix(in srgb, ${color}, black ${swatchSteps[key]})`;
    }

    document.documentElement.style.setProperty(`--swatch-${key}`, mix);
  });

  // Update hex colors after CSS is applied
  setTimeout(() => {
    Object.keys(swatchSteps).forEach((key) => {
      const swatch = document.querySelector(`.swatch-${key}`);
      if (swatch) {
        try {
          const hexColor = getComputedHexColor(swatch);
          swatch.setAttribute("data-color", hexColor);
        } catch (error) {
          console.warn(`Could not get color for swatch-${key}:`, error);
          if (key == 50) {
            swatch.setAttribute("data-color", color.toUpperCase());
          }
        }
      }
    });
  }, 50);
}

// Event listeners
generateBtn.addEventListener("click", () => {
  const raw = colorInput.value.trim();

  if (!raw) {
    alert("Please enter a hex color code");
    return;
  }

  const color = normalizeColor(raw);

  if (!color) {
    alert("Please enter a valid hex color code (e.g. 0066CC, faa000, 333)");
    return;
  }

  // Clean up input - remove # if pasted
  const cleanInput = raw.startsWith("#") ? raw.substring(1) : raw;
  colorInput.value = cleanInput;

  updatePalette(color);
});

colorInput.addEventListener("input", updateUIState);

colorInput.addEventListener("paste", () => {
  setTimeout(updateUIState, 10);
});

colorInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !generateBtn.disabled) {
    generateBtn.click();
  }
});

// Copy functionality for swatches
swatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    if (swatch.classList.contains("disabled")) return;

    const color = swatch.getAttribute("data-color");
    if (!color) return;

    navigator.clipboard
      .writeText(color)
      .then(() => {
        swatch.classList.add("copied");
        setTimeout(() => {
          swatch.classList.remove("copied");
        }, 1000);
      })
      .catch(() => {
        console.warn("Could not copy to clipboard");
      });
  });
});

// Initialize
updateUIState();
