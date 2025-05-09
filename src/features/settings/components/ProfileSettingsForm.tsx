"use client";

import Button from "@/components/buttons/Button";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import FormInput from "@/components/form/FormInput";
import FormMessage from "@/components/form/FormMessage";
import { ActionResponse } from "@/types/action";
import { UserData } from "@/types/data";
import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/types/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import saveProfileSettings from "../actions/saveProfileSettings";
import Compressor from "compressorjs";
import ImageUploadInput from "./ImageUploadInput";
import ModalWrapper from "@/components/modals/ModalWrapper";

type ProfileSettingsForm = {
	user: UserData;
};

export default function ProfileSettingsForm({ user }: ProfileSettingsForm) {
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(user.image);
	const isMounted = useRef<HTMLFormElement | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		trigger,
	} = useForm<ProfileSettingsType>({
		resolver: zodResolver(profileSettingsSchema),
		defaultValues: {
			name: user.name || undefined,
			username: user.username || undefined,
		},
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

					setValue("image", optimizedFileList);
					if (previewUrl) URL.revokeObjectURL(previewUrl);
					setPreviewUrl(URL.createObjectURL(optimizedBlob));

					trigger("image");

					//解決原生瀏覽器在處理檔案時，若上傳同個檔案不會觸發 onChange 的問題
					const inputElement = e.target;
					inputElement.value = "";
				},
				error(err: Error) {
					console.error("Image compression failed:", err.message);

					setValue("image", null);
					if (previewUrl) URL.revokeObjectURL(previewUrl);
					setPreviewUrl(null);

					trigger("image");

					const inputElement = e.target;
					inputElement.value = "";
				},
			});
		} else {
			setValue("image", null);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
			const inputElement = e.target;
			inputElement.value = "";
			trigger("image");
		}
	}

	async function onSubmit(formData: ProfileSettingsType) {
		try {
			const response = await saveProfileSettings(formData);
			if (isMounted.current) setResponse(response);
		} catch (error) {
			console.error("Something went wrong:", error);
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT" && isMounted.current) {
					setResponse({
						message: "Something went wrong.",
						success: false,
					});
				}
			}
		}
	}

	return (
		<form
			className="space-y-14"
			ref={isMounted}
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="space-y-4">
				<ImageUploadInput
					img={previewUrl}
					onChange={handleFileChange}
					name="image"
				/>

				<FormInput
					label="name"
					{...register("name")}
					message={errors.name?.message}
				/>
				<FormInput
					label="username"
					{...register("username")}
					message={errors.username?.message}
				/>
			</div>
			<div className="flex items-center gap-4">
				<Button variant="primary" type="submit" disabled={isSubmitting}>
					Save
				</Button>
				{!isSubmitting && response && (
					<FormMessage message={response.message} isError={!response.success} />
				)}
				{isSubmitting && (
					<div>
						<LoadingAnimation />
					</div>
				)}
			</div>
		</form>
	);
}
