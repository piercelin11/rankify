"use server";

import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/types/schemas/settings";
import { getUserSession } from "../../../../auth";
import { ActionResponse } from "@/types/action";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { S3Client } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { Upload } from "@aws-sdk/lib-storage";

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

export default async function saveProfileSettings(
	data: ProfileSettingsType
): Promise<ActionResponse> {
	const { id: userId } = await getUserSession();

	const validatedField = profileSettingsSchema.safeParse(data);
	if (!validatedField)
		return { success: false, message: "Invalid Field", error: "Invalid Field" };

	let s3Url: string | undefined;

	try {
		if (data.image) {
			const file = data.image[0] as File;
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
				partSize: 1024 * 1024 * 2,
				queueSize: 4,
			});

			const resultData = await upload.done();

			s3Url = resultData.Location;
		}
	} catch (error) {
		console.error("Error during avatar upload Server Action:", error);
		return {
			success: false,
			message: "An unexpected error occurred during upload.",
		};
	}

	try {
		const existedUsername = await db.user.findFirst({
			where: {
				username: data.username,
			},
			select: {
				id: true,
			},
		});

		if (existedUsername && existedUsername.id !== userId)
			return { success: false, message: "Username already exist." };

		await db.user.update({
			where: {
				id: userId,
			},
			data: {
				name: data.name,
				username: data.username,
				image: s3Url,
			},
		});
	} catch (error) {
		console.error("Failed to save profile settings:", error);
		return { success: false, message: "Failed to save profile settings." };
	}
	revalidatePath("/settings/profile");
	return { success: true, message: "Profile settings is successfully saved." };
}
