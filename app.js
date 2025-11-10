const palette = document.getElementById("palette");
const input = document.getElementById("colorInput");
const toast = document.getElementById("toast");

const lightScales = [0.928, 0.842, 0.680, 0.441, 0.187];
const darkScales = [0.135, 0.392, 0.610, 0.740, 0.826];

function hexToRgb(hex) {
    hex = hex.replace("#", "");
    const bigint = parseInt(hex, 16);
    return [bigint >> 16 & 255, bigint >> 8 & 255, bigint & 255];
}

function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => {
        const h = x.toString(16);
        return h.length === 1 ? "0" + h : h;
    }).join("").toUpperCase();
}

function clamp(v) { return Math.max(0, Math.min(255, v)); }

function lighten([r, g, b], f) {
    return [
        clamp(Math.round(r + (255 - r) * f)),
        clamp(Math.round(g + (255 - g) * f)),
        clamp(Math.round(b + (255 - b) * f))
    ];
}

function darken([r, g, b], f) {
    return [
        clamp(Math.round(r - r * f)),
        clamp(Math.round(g - g * f)),
        clamp(Math.round(b - b * f))
    ];
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function updatePalette(hex) {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return;
    const rgb = hexToRgb(hex);
    palette.innerHTML = "";

    const lightVariants = lightScales.map(f => lighten(rgb, f));
    const darkVariants = darkScales.map(f => darken(rgb, f));
    const allVariants = [
        ...lightVariants,
        rgb,
        ...darkVariants
    ];

    allVariants.forEach(rgbVal => {
        const newHex = rgbToHex(...rgbVal);
        const box = document.createElement("div");
        box.className = "color-box";
        box.style.backgroundColor = newHex;
        box.innerHTML = `<code>${newHex}</code>`;
        box.addEventListener("click", () => copyToClipboard(newHex));
        palette.appendChild(box);
    });
}

input.addEventListener("input", e => updatePalette(e.target.value.trim()));
updatePalette(input.value);