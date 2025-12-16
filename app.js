const palette = document.getElementById("palette");
const input = document.getElementById("colorInput");
const toast = document.getElementById("toast");

const lightSteps = [0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.60, 0.50, 0.40, 0.30, 0.20, 0.10, 0.05];
const darkSteps = [0.05, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95];

function hexToRgb(hex) {
    hex = hex.replace("#", "");
    const num = parseInt(hex, 16);
    return [
        (num >> 16) & 255,
        (num >> 8) & 255,
        num & 255
    ];
}

function rgbToHex(r, g, b) {
    return (
        "#" +
        [r, g, b]
            .map(v => v.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase()
    );
}

function clamp(v) {
    return Math.max(0, Math.min(255, Math.round(v)));
}

function lightenByPercent([r, g, b], p) {
    return [
        clamp(r + (255 - r) * p),
        clamp(g + (255 - g) * p),
        clamp(b + (255 - b) * p)
    ];
}

function darkenByPercent([r, g, b], p) {
    return [
        clamp(r * (1 - p)),
        clamp(g * (1 - p)),
        clamp(b * (1 - p))
    ];
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(showToast);
}

function showToast() {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

function updatePalette(hex) {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return;

    const baseRgb = hexToRgb(hex);
    palette.innerHTML = "";

    const lightVariants = lightSteps.map(p =>
        lightenByPercent(baseRgb, p)
    );

    const darkVariants = darkSteps.map(p =>
        darkenByPercent(baseRgb, p)
    );

    const allColors = [
        ...lightVariants,
        baseRgb,
        ...darkVariants
    ];

    allColors.forEach(rgb => {
        const hexVal = rgbToHex(...rgb);
        const box = document.createElement("div");

        box.className = "color-box";
        box.style.backgroundColor = hexVal;
        box.innerHTML = `<code>${hexVal}</code>`;
        box.onclick = () => copyToClipboard(hexVal);

        palette.appendChild(box);
    });
}

input.addEventListener("input", e =>
    updatePalette(e.target.value.trim())
);

updatePalette(input.value);
