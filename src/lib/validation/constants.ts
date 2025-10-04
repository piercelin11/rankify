/**
 * 檔案驗證相關常數
 * 前後端共用,確保驗證邏輯一致
 */

/**
 * 允許的圖片 MIME types
 */
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * 允許的圖片副檔名
 */
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

/**
 * 最大檔案大小: 5MB
 */
export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

/**
 * MIME type 到副檔名的對應表
 */
export const MIME_TO_EXTENSION_MAP: Record<string, readonly string[]> = {
	"image/jpeg": [".jpg", ".jpeg"],
	"image/png": [".png"],
	"image/webp": [".webp"],
};

/**
 * 允許的 MIME type 類型
 */
export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/**
 * 允許的副檔名類型
 */
export type AllowedImageExtension = (typeof ALLOWED_IMAGE_EXTENSIONS)[number];
