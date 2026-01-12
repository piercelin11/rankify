/**
 * 檔案 Magic Number (檔案簽名) 驗證
 * 透過讀取檔案的前幾個 bytes 來驗證真實檔案類型
 */

import {
	ALLOWED_IMAGE_MIME_TYPES,
	MAX_IMAGE_FILE_SIZE,
	type AllowedImageMimeType,
} from "./uploadConfig";

const MAGIC_NUMBERS: Record<string, { bytes: number[]; offset: number }> = {
	"image/jpeg": { bytes: [0xff, 0xd8, 0xff], offset: 0 },
	"image/png": { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
	"image/webp": { bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 }, // "WEBP" at offset 8
};

/**
 * 驗證檔案的 Magic Number 是否符合宣稱的 MIME type
 * @param file - File 物件
 * @param expectedMimeType - 預期的 MIME type
 * @returns true 如果檔案簽名符合
 */
export async function validateFileMagicNumber(
	file: File,
	expectedMimeType: string
): Promise<boolean> {
	const config = MAGIC_NUMBERS[expectedMimeType];
	if (!config) return false;

	const { bytes, offset } = config;
	const slice = file.slice(offset, offset + bytes.length);
	const buffer = await slice.arrayBuffer();
	const fileBytes = new Uint8Array(buffer);

	return bytes.every((byte, index) => fileBytes[index] === byte);
}

/**
 * Type guard: 檢查是否為允許的 MIME type
 */
function isAllowedMimeType(type: string): type is AllowedImageMimeType {
	return ALLOWED_IMAGE_MIME_TYPES.includes(type as AllowedImageMimeType);
}

/**
 * 完整的前端檔案驗證
 */
export async function validateImageFile(file: File): Promise<{
	valid: boolean;
	error?: string;
}> {
	// 1. MIME type 檢查
	if (!isAllowedMimeType(file.type)) {
		return {
			valid: false,
			error: `Only ${ALLOWED_IMAGE_MIME_TYPES.join(", ")} image formats are allowed`,
		};
	}

	// 2. 檔案大小檢查
	if (file.size > MAX_IMAGE_FILE_SIZE) {
		return {
			valid: false,
			error: `File size must not exceed ${MAX_IMAGE_FILE_SIZE / 1024 / 1024}MB`,
		};
	}

	// 3. Magic Number 驗證
	const isMagicNumberValid = await validateFileMagicNumber(file, file.type);
	if (!isMagicNumberValid) {
		return {
			valid: false,
			error: "File format validation failed, possible file type mismatch",
		};
	}

	return { valid: true };
}
