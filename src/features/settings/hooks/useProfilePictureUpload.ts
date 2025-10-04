"use client";

import { PLACEHOLDER_PIC } from "@/constants";
import compressImg from "@/lib/utils/compressor.utils";
import { AppResponseType } from "@/types/response";
import {
	profilePictureSchema,
	ProfilePictureType,
} from "@/lib/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
	generatePresignedUploadUrl,
	GenerateUrlResponse,
} from "../actions/generatePresignedUploadUrl";
import updateUserProfileImage from "../actions/updateUserProfileImage";
import deleteUserImageOnS3 from "../actions/deleteUserImageOnS3";
import { SETTINGS_MESSAGES } from "@/constants/messages";

export default function useProfilePictureUpload(initialImgUrl: string | null, onClose: () => void) {
	const [optimisticImgUrl, setOptimisticImgUrl] = useState(initialImgUrl);
	const [previewImgUrl, setPreviewImgUrl] = useState<string | null>(
		initialImgUrl || PLACEHOLDER_PIC
	);
	const [response, setResponse] = useState<AppResponseType | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);

	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		trigger,
	} = useForm<ProfilePictureType>({
		resolver: zodResolver(profilePictureSchema),
	});

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const originalFile = e.target.files?.[0];
		if (!originalFile) return;
		try {
			const optimizedFile = await compressImg({ file: originalFile });

			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(optimizedFile);
			const optimizedFileList = dataTransfer.files;

			if (previewImgUrl) URL.revokeObjectURL(previewImgUrl);
			setPreviewImgUrl(URL.createObjectURL(optimizedFile));

			setValue("image", optimizedFileList);
			trigger("image");
		} catch (err) {
			console.error(SETTINGS_MESSAGES.FILE_UPLOAD.COMPRESSION_ERROR, err);

			if (previewImgUrl) URL.revokeObjectURL(previewImgUrl);
			setPreviewImgUrl(null);

			setValue("image", undefined);
			trigger("image");

			const inputElement = e.target;
			inputElement.value = "";
		}
	}

	async function onSubmit(formData: ProfilePictureType) {
		const file = formData.image?.[0];

		if (!file) {
			setResponse({
				type: "error",
				message: SETTINGS_MESSAGES.FILE_UPLOAD.FILE_REQUIRED,
			});
			return;
		}

		if (!file.type.includes("image")) {
			setResponse({
				type: "error",
				message: SETTINGS_MESSAGES.FILE_UPLOAD.INVALID_TYPE_IMAGE_ONLY,
			});
			return;
		}

		let presignedResponse: GenerateUrlResponse | undefined = undefined;
		try {
			presignedResponse = await generatePresignedUploadUrl({
				fileName: file.name,
				fileType: file.type,
			});
			onClose();
		} catch (err) {
			console.error(SETTINGS_MESSAGES.FILE_UPLOAD.PRESIGNED_URL_FAILURE, err);
			setResponse({
				type: "error",
				message: SETTINGS_MESSAGES.FILE_UPLOAD.PRESIGNED_URL_FAILURE,
			});
			throw err;
		}

		if (
			presignedResponse &&
			presignedResponse.signedUrl &&
			presignedResponse.finalImageUrl
		) {
			let s3UploadSuccessful = false;
			try {
				abortControllerRef.current = new AbortController();

				await fetch(presignedResponse.signedUrl, {
					method: "PUT",
					body: file,
					headers: {
						"Content-type": file.type,
					},
					signal: abortControllerRef.current.signal,
				});
				s3UploadSuccessful = true;

				setOptimisticImgUrl(presignedResponse?.finalImageUrl || initialImgUrl);
				await updateUserProfileImage({
					imageUrl: presignedResponse.finalImageUrl,
				});
				await deleteUserImageOnS3({ imageUrlToDelete: initialImgUrl });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} catch (err: any) {
				const newImageUrl = presignedResponse.finalImageUrl;
				setOptimisticImgUrl(initialImgUrl);

				if (s3UploadSuccessful) {
					console.warn(
						"DB update failed. Attempting to delete newly uploaded image from S3:",
						newImageUrl
					);
					try {
						await deleteUserImageOnS3({ imageUrlToDelete: newImageUrl }); // Or your specific delete function
					} catch (rollbackErr) {
						console.error(
							"CRITICAL: Rollback failed to delete new image from S3:",
							rollbackErr
						);
					}
					setResponse({
						type: "error",
						message: SETTINGS_MESSAGES.FILE_UPLOAD.S3_UPLOAD_ERROR,
					});
				} else {
					setResponse({
						type: "error",
						message: SETTINGS_MESSAGES.FILE_UPLOAD.S3_UPLOAD_ERROR,
					});
					console.error(SETTINGS_MESSAGES.FILE_UPLOAD.S3_UPLOAD_ERROR, err);
				}
				if (err.name === "AbortError") {
					setResponse({
						type: "error",
						message: SETTINGS_MESSAGES.FILE_UPLOAD.UPLOAD_CANCELLED,
					});
				}
				throw err;
			} finally {
				abortControllerRef.current = null;
			}
		}
	}

	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	return {
		handleSubmit: handleSubmit(onSubmit),
		errors,
		isSubmitting,
		optimisticImgUrl,
		response,
		handleFileChange,
		previewImgUrl,
		setPreviewImgUrl
	};
}
