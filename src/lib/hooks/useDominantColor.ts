import { RGB } from "color-convert";
import { useState, useEffect } from "react";

// 定義 color-convert 使用的 RGB 類型

type DominantColorResult = {
	dominantColor: RGB;
	colorPalette: RGB[];
};

export default function useDominantColor(
	src: string
): [DominantColorResult | null, boolean] {
	const [color, setColor] = useState<DominantColorResult | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		if (!src) {
			console.warn("Image source is empty");
			setColor(null);
			setLoading(false);
			return;
		}

		const getDominantColor = (src: string): Promise<DominantColorResult> => {
			return new Promise((resolve, reject) => {
				const canvas = document.createElement("canvas");
				const context = canvas.getContext("2d", { willReadFrequently: true });
				if (!context) {
					reject("Failed to get 2D context");
					return;
				}

				const img = new Image();
				img.crossOrigin = "anonymous";
				img.src = src;

				img.onload = () => {
					try {
						// 計算 1x1 的主色
						canvas.width = 1;
						canvas.height = 1;
						context.drawImage(img, 0, 0, 1, 1);
						const dominantColorUint8 = context.getImageData(0, 0, 1, 1).data;
						// 將 Uint8ClampedArray 轉換為 [number, number, number]
						const dominantColor: RGB = [
							dominantColorUint8[0],
							dominantColorUint8[1],
							dominantColorUint8[2],
						];

						// 計算 3x3 調色板
						canvas.width = 3;
						canvas.height = 3;
						context.drawImage(img, 0, 0, 3, 3);
						const imageData = context.getImageData(0, 0, 3, 3).data;
						const colorPalette: RGB[] = [];

						for (let i = 0; i < imageData.length; i += 4) {
							colorPalette.push([
								imageData[i],
								imageData[i + 1],
								imageData[i + 2],
							]);
						}

						resolve({ dominantColor, colorPalette });
					} catch (error) {
						reject("Failed to process image data: " + error);
					}
				};

				img.onerror = () => {
					reject("Failed to load image");
				};
			});
		};

		setLoading(true);
		getDominantColor(src)
			.then((color) => {
				setColor(color);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setColor(null);
				setLoading(false);
			});

		return () => {
			setColor(null);
			setLoading(false);
		};
	}, [src]);

	return [color, loading];
}
