"use server";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
	imageUrlToDelete: string | null
}

export default async function deleteUserImageOnS3({imageUrlToDelete}: DeleteUserImageOnS3) {

	if (imageUrlToDelete && typeof imageUrlToDelete === "string") {
		const s3Domain = `${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
		if (imageUrlToDelete.includes(s3Domain)) {
			try {
				const oldS3Key = imageUrlToDelete.substring(
					imageUrlToDelete.indexOf(s3Domain) + s3Domain.length + 1
				);

				const deleteParams = {
					Bucket: process.env.S3_BUCKET_NAME!,
					Key: oldS3Key,
				};
				const deleteCommand = new DeleteObjectCommand(deleteParams);

				await s3Client.send(deleteCommand);
			} catch (deleteError) {
				console.error(
					`Failed to delete old avatar ${imageUrlToDelete}:`,
					deleteError
				);
			}
		}
	}
}
