import { DEFAULT_COLOR } from "@/constants";
import colorConvert from "color-convert";

// 調整顏色亮度
export function adjustColor(
	hexColor: string | null,
	targetLightness: number,
	saturationFactor: number = 1.0
): string {
	if (!hexColor) return DEFAULT_COLOR;
	if (
		typeof hexColor !== "string" ||
		!hexColor.startsWith("#") ||
		hexColor.length !== 7
	) {
		throw new Error(
			`Invalid hexColor format: ${hexColor}. Expected '#RRGGBB'.`
		);
	}

	const hexValue = hexColor.slice(1);
	if (!/^[0-9a-fA-F]{6}$/.test(hexValue)) {
		throw new Error(`Invalid Hex value: ${hexColor}`);
	}

	if (
		typeof targetLightness !== "number" ||
		targetLightness < 0.0 ||
		targetLightness > 1.0
	) {
		throw new Error(
			`Invalid targetLightness: ${targetLightness}. Expected a number or float between 0.0 and 1.0.`
		);
	}

	const rgb = colorConvert.hex.rgb(hexValue);

	const lab = colorConvert.rgb.lab(rgb);

	const lch = colorConvert.lab.lch(lab);

	const originalC = lch[1];
	const originalH = lch[2];

	const newL = targetLightness * 100;

	const newC = originalC * saturationFactor;
	const newH = originalH;

	const newLch: [number, number, number] = [newL, newC, newH];

	const newLab = colorConvert.lch.lab(newLch);

	const newRgb = colorConvert.lab.rgb(newLab);

	const newHexValue = colorConvert.rgb.hex(newRgb);

	return `#${newHexValue}`;
}

export function adjustColorOpacity(hexColor: string, opacity: number) {
	switch (opacity) {
		case 0.95: {
			return hexColor + "F2";
		}
		case 0.9: {
			return hexColor + "E6";
		}
		case 0.85: {
			return hexColor + "D9";
		}
		case 0.8: {
			return hexColor + "CC";
		}
		case 0.75: {
			return hexColor + "BF";
		}
		case 0.7: {
			return hexColor + "B3";
		}
		case 0.65: {
			return hexColor + "A6";
		}
		case 0.6: {
			return hexColor + "99";
		}
		case 0.55: {
			return hexColor + "8C";
		}
		case 0.5: {
			return hexColor + "80";
		}
		case 0.45: {
			return hexColor + "73";
		}
		case 0.4: {
			return hexColor + "66";
		}
		case 0.35: {
			return hexColor + "59";
		}
		case 0.3: {
			return hexColor + "4D";
		}
		case 0.25: {
			return hexColor + "40";
		}
		case 0.2: {
			return hexColor + "33";
		}
		case 0.15: {
			return hexColor + "26";
		}
		case 0.1: {
			return hexColor + "1A";
		}
		case 0.05: {
			return hexColor + "0D";
		}
		default: {
			return hexColor;
		}
	}
}
