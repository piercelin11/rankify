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
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import saveProfileSettings from "../actions/saveProfileSettings";
import { useSession } from "next-auth/react";

type ProfileSettingsForm = {
	user: UserData;
};

export default function ProfileSettingsForm({ user }: ProfileSettingsForm) {
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isPending, setPending] = useState<boolean>(false);

	const { register, handleSubmit } = useForm<ProfileSettingsType>({
		resolver: zodResolver(profileSettingsSchema),
		defaultValues: {
			name: user.name || undefined,
			username: user.username || undefined,
		},
	});

	async function onSubmit(formData: ProfileSettingsType) {
		setPending(true);
		try {
			const response = await saveProfileSettings(formData);
			setResponse(response);
		} catch (error) {
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
				<div className="flex items-center gap-4">
					<Image
						className="rounded-full"
						src={user.image || ""}
						width={100}
						height={100}
						alt={`${user.name}'s profile picture`}
					/>
					<Button variant="secondary" type="button">
						Change
					</Button>
				</div>
				<FormInput label="name" {...register("name")} />
				<FormInput label="username" {...register("username")} />
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
