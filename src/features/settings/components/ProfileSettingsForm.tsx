"use client";

import { Button } from "@/components/ui/button";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import FormInput from "@/components/form/FormInput";
import FormMessage from "@/components/form/FormMessage";
import { AppResponseType } from "@/types/response";
import { UserData } from "@/types/data";
import {
	profileSettingsSchema,
	ProfileSettingsType,
} from "@/lib/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import saveProfileSettings from "../actions/saveProfileSettings";
import ImageUploadForm from "./ImageUploadForm";
import { SETTINGS_MESSAGES } from "@/constants/messages";
import { useServerAction } from "@/lib/hooks/useServerAction";

type ProfileSettingsForm = {
	user: UserData;
};

export default function ProfileSettingsForm({ user }: ProfileSettingsForm) {
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const isMounted = useRef<HTMLFormElement | null>(null);
	const { execute, isPending } = useServerAction(saveProfileSettings);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileSettingsType>({
		resolver: zodResolver(profileSettingsSchema),
		defaultValues: {
			name: user.name || undefined,
			username: user.username || undefined,
		},
	});

	async function onSubmit(formData: ProfileSettingsType) {
		try {
			const response = await execute(formData);
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
					<Button type="submit" disabled={isPending}>
						Save
					</Button>
					{!isPending && response && (
						<FormMessage message={response.message} type={response.type} />
					)}
					{isPending && (
						<div>
							<LoadingAnimation />
						</div>
					)}
				</div>
			</form>
		</>
	);
}
