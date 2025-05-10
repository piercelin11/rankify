"use client";

import Button from "@/components/buttons/Button";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import FormInput from "@/components/form/FormInput";
import FormMessage from "@/components/form/FormMessage";
import { AppResponseType } from "@/types/response";
import { UserData } from "@/types/data";
import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/types/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import saveProfileSettings from "../actions/saveProfileSettings";
import ImageUploadForm from "./ImageUploadForm";
import { SETTINGS_MESSAGES } from "@/constants/messages";

type ProfileSettingsForm = {
	user: UserData;
};

export default function ProfileSettingsForm({ user }: ProfileSettingsForm) {
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const isMounted = useRef<HTMLFormElement | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<ProfileSettingsType>({
		resolver: zodResolver(profileSettingsSchema),
		defaultValues: {
			name: user.name || undefined,
			username: user.username || undefined,
		},
	});

	async function onSubmit(formData: ProfileSettingsType) {
		try {
			const response = await saveProfileSettings(formData);
			if (isMounted.current) setResponse(response);
		} catch (error) {
			console.error(SETTINGS_MESSAGES.PROFILE.SAVE_FAILURE, error);
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT" && isMounted.current) {
					setResponse({
						message: SETTINGS_MESSAGES.PROFILE.SAVE_FAILURE,
						type: "error",
					});
				}
			}
		}
	}

	return (
		<>
			<ImageUploadForm img={user.image} />
			<form
				className="space-y-14"
				ref={isMounted}
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="space-y-4">
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
						<FormMessage message={response.message} type={response.type} />
					)}
					{isSubmitting && (
						<div>
							<LoadingAnimation />
						</div>
					)}
				</div>
			</form>
		</>
	);
}
