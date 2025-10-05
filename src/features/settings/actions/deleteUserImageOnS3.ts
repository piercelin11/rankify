"use server";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getUserSession } from "@/../auth";
import { AppResponseType } from "@/types/response";
import { SETTINGS_MESSAGES } from "@/constants/messages";

if (
	!process.env.AWS_REGION ||
	!process.env.AWS_ACCESS_KEY_ID ||
	!process.env.AWS_SECRET_ACCESS_KEY
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

type DeleteUserImageOnS3 = {
	imageUrlToDelete: string | null;
};

export default async function deleteUserImageOnS3({
	imageUrlToDelete,
}: DeleteUserImageOnS3): Promise<AppResponseType> {
	try {
		await getUserSession();

		if (!imageUrlToDelete || typeof imageUrlToDelete !== "string") {
			return { type: "success", message: "No image to delete" };
		}

		const s3Domain = `${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
		if (!imageUrlToDelete.includes(s3Domain)) {
			return { type: "success", message: "Image is not hosted on S3" };
		}

		const oldS3Key = imageUrlToDelete.substring(
			imageUrlToDelete.indexOf(s3Domain) + s3Domain.length + 1
		);

		const deleteParams = {
			Bucket: process.env.S3_BUCKET_NAME!,
			Key: oldS3Key,
		};
		const deleteCommand = new DeleteObjectCommand(deleteParams);

		await s3Client.send(deleteCommand);

		return { type: "success", message: "Image deleted successfully" };
	} catch (error) {
		console.error("deleteUserImageOnS3 error:", error);
		return {
			type: "error",
			message: SETTINGS_MESSAGES.PROFILE_IMAGE.UPDATE_FAILURE,
		};
	}
}
