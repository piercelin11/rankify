"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getUserSession } from "../../../../auth";
import { nanoid } from "nanoid";
import { AppResponseType } from "@/types/response";
import { SETTINGS_MESSAGES } from "@/constants/messages";

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

type GenerateUrlParams = {
	fileName: string;
	fileType: string;
};

export type GenerateUrlResponse = {
	signedUrl?: string;
	finalImageUrl?: string;
	s3Key?: string;
} & AppResponseType;

export async function generatePresignedUploadUrl({
	fileName,
	fileType,
}: GenerateUrlParams): Promise<GenerateUrlResponse> {
	const { id: userId } = await getUserSession();

	if (!fileName || !fileType) {
		return {
			type: "error",
			message: SETTINGS_MESSAGES.FILE_UPLOAD.FILENAME_AND_TYPE_REQUIRED,
		};
	}
	if (!fileType.startsWith("image/")) {
		return {
			type: "error",
			message: SETTINGS_MESSAGES.FILE_UPLOAD.INVALID_TYPE_IMAGE_ONLY,
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
