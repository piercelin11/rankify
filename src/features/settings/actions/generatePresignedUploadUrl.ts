"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getUserSession } from "../../../../auth";
import { nanoid } from "nanoid";
import { ActionResponse } from "@/types/action";

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
} & ActionResponse;

export async function generatePresignedUploadUrl({
	fileName,
	fileType,
}: GenerateUrlParams): Promise<GenerateUrlResponse> {
	const { id: userId } = await getUserSession();

	if (!userId) {
		return { success: false, message: "Unauthorized" };
	}

	if (!fileName || !fileType) {
		return { success: false, message: "Filename and filetype are required." };
	}
	if (!fileType.startsWith("image/")) {
		return {
			success: false,
			message: "Invalid file type. Only images are allowed.",
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
			success: true,
			signedUrl,
			finalImageUrl,
			s3Key,
			message: "Successfully uploaded your profile picture.",
		};
	} catch (error) {
		console.error("Error generating signed URL:", error);
		return { success: false, message: "Could not generate upload URL." };
	}
}
