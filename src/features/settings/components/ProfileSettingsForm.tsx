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
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import saveProfileSettings from "../actions/saveProfileSettings";
import AvatarUploadInput from "./AvatarUploadInput";

type ProfileSettingsForm = {
	user: UserData;
};

export default function ProfileSettingsForm({ user }: ProfileSettingsForm) {
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isPending, setPending] = useState<boolean>(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(user.image);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		trigger,
		watch,
	} = useForm<ProfileSettingsType>({
		resolver: zodResolver(profileSettingsSchema),
		defaultValues: {
			name: user.name || undefined,
			username: user.username || undefined,
		},
	});

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const fileList = e.target.files;
		if (fileList && fileList.length > 0) {
			const file = fileList[0];
			setValue("image", fileList);
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
			setPreviewUrl(URL.createObjectURL(file));
			trigger("image");
		} else {
			setValue("image", fileList as any);
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
				setPreviewUrl(null);
			}
			trigger("image");
		}
	}

	async function onSubmit(formData: ProfileSettingsType) {
		setPending(true);
		try {
			const response = await saveProfileSettings(formData);
			setResponse(response);
		} catch (error) {
			console.error("Something went wrong:", error);
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setResponse({
						message: "Something went wrong.",
						success: false,
					});
				}
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<form className="space-y-14" onSubmit={handleSubmit(onSubmit)}>
			<div className="space-y-4">
				<AvatarUploadInput
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
				<Button variant="primary" type="submit" disabled={isPending}>
					Save
				</Button>
				{!isPending && response && (
					<FormMessage message={response.message} isError={!response.success} />
				)}
				{isPending && (
					<div>
						<LoadingAnimation />
					</div>
				)}
			</div>
		</form>
	);
}
