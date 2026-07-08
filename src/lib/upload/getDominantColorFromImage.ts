import { createCanvas, loadImage } from "canvas";
import colorConvert from "color-convert";

const LOAD_TIMEOUT_MS = 5000;

/**
 * Server 端主色分析，邏輯對齊 useDominantColor.ts 的瀏覽器版本演算法：
 * 將圖片縮成 1x1 canvas 取樣代表色，換算成 hex 字串。
 * 任何失敗（下載失敗、逾時、格式不支援）一律回傳 null，不拋出例外。
 */
export default async function getDominantColorFromImage(
	imageUrl: string
): Promise<string | null> {
	try {
		const image = await Promise.race([
			loadImage(imageUrl),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error("Image load timed out")), LOAD_TIMEOUT_MS)
			),
		]);

		const canvas = createCanvas(1, 1);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(image, 0, 0, 1, 1);

		const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
		return `#${colorConvert.rgb.hex([r, g, b])}`;
	} catch (error) {
		console.error(`Failed to analyze dominant color for ${imageUrl}:`, error);
		return null;
	}
}
