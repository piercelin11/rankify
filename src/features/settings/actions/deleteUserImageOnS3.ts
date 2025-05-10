"use server";

import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import React from "react";
import { getUserSession } from "@/../auth";
import { db } from "@/lib/prisma";

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

export default async function deleteUserImageOnS3() {
	const { id: userId } = await getUserSession();
	const userData = await db.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			image: true,
		},
	});

	const oldImageUrl = userData?.image;

	if (oldImageUrl && typeof oldImageUrl === "string") {
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
}
