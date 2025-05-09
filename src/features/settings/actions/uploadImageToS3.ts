"use server";

import { nanoid } from "nanoid";
import { getUserSession } from "@/../auth";
import { Upload } from "@aws-sdk/lib-storage";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

type UploadImageProps = {
	imageFile: File;
	oldImageUrl: string | null;
};

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

export default async function uploadImageToS3({
	imageFile,
	oldImageUrl,
}: UploadImageProps) {
	const { id: userId } = await getUserSession();
	let s3Url: string | undefined;
	try {
		const file = imageFile;
		const fileStream = file.stream();

		const fileExtension = file.name.split(".").pop();
		const uniqueFileName = `${nanoid()}.${fileExtension}`;
		const s3Key = `avatars/${userId}/${uniqueFileName}`;

		const upload = new Upload({
			client: s3Client,
			params: {
				Bucket: process.env.S3_BUCKET_NAME,
				Key: s3Key,
				Body: fileStream,
				ContentType: file.type,
			},
		});

		const resultData = await upload.done();
		s3Url = resultData.Location;
		
	} catch (error) {
		console.error("Error during avatar upload Server Action:", error);
	}

	if (oldImageUrl && typeof oldImageUrl === "string" && oldImageUrl !== s3Url) {
		const s3Domain = `${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;
		if (oldImageUrl.includes(s3Domain)) {
			try {
				const oldS3Key = oldImageUrl.substring(
					oldImageUrl.indexOf(s3Domain) + s3Domain.length + 1
				);

				const deleteParams = {
					Bucket: process.env.S3_BUCKET_NAME!,
					Key: oldS3Key,
				};
				const deleteCommand = new DeleteObjectCommand(deleteParams);

				await s3Client.send(deleteCommand);
			} catch (deleteError) {
				console.error(
					`Failed to delete old avatar ${oldImageUrl}:`,
					deleteError
				);
			}
		}
	}

	return s3Url;
}
