export function rgbToHex(colorArray: Uint8ClampedArray | undefined | number[]): string {
    if (!colorArray) return "#4d4d4d"
    return `#${colorArray[0].toString(16).padStart(2, '0')}${colorArray[1].toString(16).padStart(2, '0')}${colorArray[2].toString(16).padStart(2, '0')}`;
}
  
function hexToRgb(hex: string) {
    // 去除 "#" 符號
    hex = hex.replace(/^#/, '');

    // 確保 hex 符合標準格式
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
}

// 計算明暗度
function calculateLuminance(r:number, g:number, b:number) {
    const a = [r, g, b].map(value => {
        value /= 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

// 調整明暗度
function adjustBrightness(r: number, g: number, b: number, factor: number) {
    return [
        Math.min(255, Math.floor(r + (255 - r) * factor)),
        Math.min(255, Math.floor(g + (255 - g) * factor)),
        Math.min(255, Math.floor(b + (255 - b) * factor))
    ];
}

// 調整明暗度
function adjustDarkness(r: number, g: number, b: number, factor: number) {
    return [
        Math.max(0, Math.floor(r * (1 - factor))),
        Math.max(0, Math.floor(g * (1 - factor))),
        Math.max(0, Math.floor(b * (1 - factor)))
    ];
}

// 將 RGB 顏色轉換為 HSL 格式
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

// 將 HSL 顏色轉換為 RGB 格式
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}




// 依照閾值調整顏色亮度
export function ensureBrightness(hex: string | null, threshold = 0.5) {
    if (!hex) return "#4d4d4d";

    let [r, g, b] = hexToRgb(hex);
    let luminance = calculateLuminance(r, g, b);

    if (luminance < threshold) {
        const factor = (threshold - luminance) / (threshold * 3);
        
        [r, g, b] = adjustBrightness(r, g, b, factor);
    }

    return rgbToHex([r, g, b]);
}

// 依照閾值調整顏色暗度
export function ensureDarkness(hex: string | null, threshold = 0.5) {
    if (!hex) return "#4d4d4d";

    let [r, g, b] = hexToRgb(hex);
    let luminance = calculateLuminance(r, g, b);

    if (luminance > threshold) {
        const factor = (luminance - threshold) * 2.5 / luminance;
        
        [r, g, b] = adjustDarkness(r, g, b, factor);
    }

    return rgbToHex([r, g, b]);
}

// 調整顏色飽和度
export function adjustSaturation(hex: string, amount: number = 0.15): string {
    const [r, g, b] = hexToRgb(hex);
    let [h, s, l] = rgbToHsl(r, g, b);
    s = Math.min(1, Math.max(0, s + amount));
    const [newR, newG, newB] = hslToRgb(h, s, l);
    return rgbToHex([newR, newG, newB]);
} 
