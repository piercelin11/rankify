"use client";

import { PLACEHOLDER_PIC } from "@/config/variables";
import {
	profilePictureSchema,
	ProfilePictureType,
} from "@/types/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Compressor from "compressorjs";
import Button from "@/components/buttons/Button";
import ModalWrapper from "@/components/modals/ModalWrapper";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/cn";
import FormMessage from "@/components/form/FormMessage";
import { ActionResponse } from "@/types/action";
import {
	generatePresignedUploadUrl,
	GenerateUrlResponse,
} from "../actions/generatePresignedUploadUrl";
import updateUserProfileImage from "../actions/updateUserProfileImage";
import deleteImageOnS3 from "../actions/deleteUserImageOnS3";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";

type ImageUploadFormProps = {
	img: string | null;
};

export default function ImageUploadForm({ img }: ImageUploadFormProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(
		img || PLACEHOLDER_PIC
	);
	const [isFormOpen, setFormOpen] = useState(false);
	const [response, setResponse] = useState<ActionResponse | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);

	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		trigger,
	} = useForm<ProfilePictureType>({
		resolver: zodResolver(profilePictureSchema),
	});

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const originalFile = e.target.files?.[0];
		if (originalFile) {
			new Compressor(originalFile, {
				maxWidth: 500,
				maxHeight: 500,
				quality: 0.6,
				mimeType: "image/jpeg",

				success(optimizedBlob: Blob) {
					const optimizedFile = new File([optimizedBlob], originalFile.name, {
						type: optimizedBlob.type,
						lastModified: Date.now(),
					});

					const dataTransfer = new DataTransfer();
					dataTransfer.items.add(optimizedFile);
					const optimizedFileList = dataTransfer.files;

					if (previewUrl) URL.revokeObjectURL(previewUrl);
					setPreviewUrl(URL.createObjectURL(optimizedBlob));

					setValue("image", optimizedFileList);
					trigger("image");

					//解決原生瀏覽器在處理檔案時，若上傳同個檔案不會觸發 onChange 的問題
					const inputElement = e.target;
					inputElement.value = "";
				},
				error(err: Error) {
					console.error("Image compression failed:", err.message);

					if (previewUrl) URL.revokeObjectURL(previewUrl);
					setPreviewUrl(null);

					setValue("image", undefined);
					trigger("image");

					const inputElement = e.target;
					inputElement.value = "";
				},
			});
		} else {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);

			setValue("image", undefined);
			trigger("image");

			const inputElement = e.target;
			inputElement.value = "";
		}
	}

	async function onSubmit(formData: ProfilePictureType) {
		const file = formData.image?.[0];

		if (!file) {
			setResponse({ success: false, message: "You need to upload a picture." });
			return;
		}

		let presignedResponse: GenerateUrlResponse | undefined = undefined;
		try {
			presignedResponse = await generatePresignedUploadUrl({
				fileName: file.name,
				fileType: file.type,
			});
		} catch (err) {
			console.error("Failed to generate presigned upload url:", err);
			setResponse({
				success: false,
				message: "Failed to generate presigned upload url.",
			});
			return;
		} finally {
			setFormOpen(false);
		}

		if (
			presignedResponse &&
			presignedResponse.signedUrl &&
			presignedResponse.finalImageUrl
		) {
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
				await deleteImageOnS3();
				await updateUserProfileImage({
					imageUrl: presignedResponse.finalImageUrl,
				});
			} catch (err: any) {
				if (err.name === "AbortError") {
					setResponse({ success: false, message: "Upload cancelled by user." });
				} else {
					setResponse({
						success: false,
						message: "Failed to upload image to S3.",
					});
				}
				return;
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

	return (
		<div className="flex items-center gap-4">
			<div className="relative h-24 w-24">
				{isSubmitting && (
					<div className="absolute z-10 flex h-full w-full items-center justify-center rounded-full bg-neutral-950/50">
						<LoadingAnimation />
					</div>
				)}
				<Image
					className="rounded-full object-cover"
					src={img || PLACEHOLDER_PIC}
					fill
					sizes="96px"
					alt={"your profile picture"}
				/>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					onClick={() => setFormOpen(true)}
					disabled={isSubmitting}
				>
					Edit picture
				</Button>
				{response && (
					<FormMessage message={response.message} isError={!response.success} />
				)}
			</div>
			<ModalWrapper
				className="w-[500px]"
				onRequestClose={() => setFormOpen(false)}
				isRequestOpen={isFormOpen}
			>
				<form
					className="flex flex-col items-center justify-center space-y-8"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div>
						<h2 className="text-center">Edit Profile Picture</h2>
						<p className="text-description text-center">
							upload and change your profile picture.
						</p>
					</div>
					<div className="group relative h-44 w-44 rounded-full border border-neutral-600">
						<label
							htmlFor="image"
							className="absolute z-10 hidden h-full w-full items-center justify-center rounded-full bg-neutral-950/50 group-hover:flex"
						>
							<input
								id="image"
								name="image"
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								hidden
							/>
							<Pencil1Icon
								width={32}
								height={32}
								className="text-neutral-100"
							/>
						</label>
						<Image
							className="rounded-full object-cover p-1"
							src={previewUrl || PLACEHOLDER_PIC}
							fill
							sizes="96px"
							alt={"your profile picture"}
						/>
					</div>
					<div className="flex gap-2">
						<Button variant="primary" type="submit">
							Save
						</Button>
						<Button variant="secondary" onClick={() => setFormOpen(false)}>
							Cancel
						</Button>
					</div>
					{response && (
						<FormMessage
							message={response.message}
							isError={!response.success}
						/>
					)}
				</form>
			</ModalWrapper>
		</div>
	);
}
