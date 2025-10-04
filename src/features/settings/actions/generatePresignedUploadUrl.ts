"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getUserSession } from "../../../../auth";
import { nanoid } from "nanoid";
import { AppResponseType } from "@/types/response";
import { SETTINGS_MESSAGES } from "@/constants/messages";
import {
	ALLOWED_IMAGE_MIME_TYPES,
	ALLOWED_IMAGE_EXTENSIONS,
	MAX_IMAGE_FILE_SIZE,
	MIME_TO_EXTENSION_MAP,
	type AllowedImageMimeType,
	type AllowedImageExtension,
} from "@/lib/upload/uploadConfig";

if (
	!process.env.AWS_REGION ||
	!process.env.AWS_ACCESS_KEY_ID ||
	!process.env.AWS_SECRET_ACCESS_KEY ||
	!process.env.S3_BUCKET_NAME
) {
	throw new Error(
		"Missing required AWS environment variables: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
	);
}

const s3Client = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// 建立 Set 以提升查詢效能
const ALLOWED_EXTENSIONS_SET = new Set(ALLOWED_IMAGE_EXTENSIONS);

/**
 * Type guard: 檢查是否為允許的 MIME type
 */
function isAllowedMimeType(type: string): type is AllowedImageMimeType {
	return ALLOWED_IMAGE_MIME_TYPES.includes(type as AllowedImageMimeType);
}

/**
 * Type guard: 檢查是否為允許的副檔名
 */
function isAllowedExtension(ext: string): ext is AllowedImageExtension {
	return ALLOWED_EXTENSIONS_SET.has(ext as AllowedImageExtension);
}

type GenerateUrlParams = {
	fileName: string;
	fileType: string;
	fileSize: number;
};

export type GenerateUrlResponse = {
	signedUrl?: string;
	finalImageUrl?: string;
	s3Key?: string;
} & AppResponseType;

export async function generatePresignedUploadUrl({
	fileName,
	fileType,
	fileSize,
}: GenerateUrlParams): Promise<GenerateUrlResponse> {
	const { id: userId } = await getUserSession();

	// 1. 基本欄位檢查
	if (!fileName || !fileType || !fileSize) {
		return {
			type: "error",
			message: SETTINGS_MESSAGES.FILE_UPLOAD.FILENAME_AND_TYPE_REQUIRED,
		};
	}

	// 2. MIME Type 白名單驗證
	if (!isAllowedMimeType(fileType)) {
		return {
			type: "error",
			message: `只允許上傳 ${ALLOWED_IMAGE_MIME_TYPES.join(", ")} 格式的圖片`,
		};
	}

	// 3. 副檔名驗證
	const fileExtension = fileName.toLowerCase().match(/\.[^.]+$/)?.[0];
	if (!fileExtension || !isAllowedExtension(fileExtension)) {
		return {
			type: "error",
			message: `只允許上傳 ${ALLOWED_IMAGE_EXTENSIONS.join(", ")} 副檔名的檔案`,
		};
	}

	// 4. 檔案大小限制
	if (fileSize > MAX_IMAGE_FILE_SIZE) {
		return {
			type: "error",
			message: `檔案大小不得超過 ${MAX_IMAGE_FILE_SIZE / 1024 / 1024}MB`,
		};
	}

	// 5. MIME Type 與副檔名一致性檢查
	const expectedExtensions = MIME_TO_EXTENSION_MAP[fileType];
	if (!expectedExtensions?.includes(fileExtension)) {
		return {
			type: "error",
			message: "檔案類型與副檔名不符",
		};
	}

	const s3Key = `avatars/${userId}/${nanoid()}-${fileName.replace(/\s+/g, "_")}`;

	const command = new PutObjectCommand({
		Bucket: BUCKET_NAME,
		Key: s3Key,
		ContentType: fileType,
	});

	try {
		const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
		const finalImageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

		return {
			type: "success",
			signedUrl,
			finalImageUrl,
			s3Key,
			message: SETTINGS_MESSAGES.FILE_UPLOAD.PRESIGNED_URL_SUCCESS,
		};
	} catch (error) {
		console.error(SETTINGS_MESSAGES.FILE_UPLOAD.PRESIGNED_URL_FAILURE, error);
		return {
			type: "error",
			message: SETTINGS_MESSAGES.FILE_UPLOAD.PRESIGNED_URL_FAILURE,
		};
	}
}
