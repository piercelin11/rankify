import colorConvert from "color-convert";

export function rgbToHex(
	colorArray: Uint8ClampedArray | undefined | number[]
): string {
	if (!colorArray) return "#4d4d4d";
	return `#${colorArray[0].toString(16).padStart(2, "0")}${colorArray[1].toString(16).padStart(2, "0")}${colorArray[2].toString(16).padStart(2, "0")}`;
}

// 調整顏色亮度
export function adjustColorLightness(
	hexColor: string,
	targetLightness: number,
	saturationFactor: number = 1.0
): string {
	if (
		typeof hexColor !== "string" ||
		!hexColor.startsWith("#") ||
		hexColor.length !== 7
	) {
		throw new Error(`無效的 hexColor 格式: ${hexColor}。預期 '#RRGGBB'。`);
	}

	const hexValue = hexColor.slice(1);
	if (!/^[0-9a-fA-F]{6}$/.test(hexValue)) {
		throw new Error(`無效的 Hex 顏色值: ${hexColor}`);
	}

	if (
		typeof targetLightness !== "number" ||
		targetLightness < 0.0 ||
		targetLightness > 1.0
	) {
		throw new Error(
			`無效的 targetLightness: ${targetLightness}。預期一個介於 0.0 和 1.0 之間的數字。`
		);
	}

	const rgb = colorConvert.hex.rgb(hexValue);

	const lab = colorConvert.rgb.lab(rgb);

	const lch = colorConvert.lab.lch(lab);

	const originalL = lch[0];
	const originalC = lch[1];
	const originalH = lch[2];

	const newL = targetLightness * 100;

	let newC;
	if (originalC === 0) {
		newC = 0;
	} else {
		newC = originalC * saturationFactor;
	}
	const newH = originalH;

	const newLch: [number, number, number] = [newL, newC, newH];

	const newLab = colorConvert.lch.lab(newLch);

	const newRgb = colorConvert.lab.rgb(newLab);

	const newHexValue = colorConvert.rgb.hex(newRgb);

	return `#${newHexValue}`;
}
