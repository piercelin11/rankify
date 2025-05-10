"use client";

import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	rankingSettingsSchema,
	RankingSettingsType,
} from "@/types/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPreferenceData } from "@/types/data";
import { AppResponseType } from "@/types/response";
import Button from "@/components/buttons/Button";
import FormMessage from "@/components/form/FormMessage";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import ToggleSwitch from "@/components/form/ToggleSwitch";
import saveRankingSettings from "../actions/saveRankingSettings";
import { SETTINGS_MESSAGES } from "@/constants/messages";

type RankingSettingsFormProps = {
	settings: UserPreferenceData | null;
};

export const defaultRankingSettings: RankingSettingsType = {
	includeInterlude: true,
	includeIntroOutro: true,
	includeReissueTrack: true,
};

export default function RankingSettingsForm({
	settings,
}: RankingSettingsFormProps) {
	const defaultSettings = settings?.rankingSettings || defaultRankingSettings;
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const isMounted = useRef<HTMLFormElement | null>(null);

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = useForm<RankingSettingsType>({
		resolver: zodResolver(rankingSettingsSchema),
		defaultValues: {
			includeInterlude: defaultSettings.includeInterlude,
			includeIntroOutro: defaultSettings.includeIntroOutro,
			includeReissueTrack: defaultSettings.includeReissueTrack,
		},
	});

	async function onSubmit(formData: RankingSettingsType) {
		try {
			const response = await saveRankingSettings(formData);
			if (isMounted.current) setResponse(response);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT" && isMounted.current) {
					setResponse({
						message: SETTINGS_MESSAGES.RANKING.SAVE_FAILURE,
						type: "error",
					});
				}
			}
		}
	}

	return (
		<form
			ref={isMounted}
			className="space-y-14"
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="space-y-4">
				<div>
					<h3>Album Stats</h3>
					<p className="text-description">
						Configure how album stats are calculated and displayed.
					</p>
				</div>
				<Controller
					name="includeInterlude"
					control={control}
					render={({ field }) => (
						<ToggleSwitch
							label="Include interlude"
							value="includeInterlude"
							onChange={field.onChange}
							name="includeInterlude"
							isChecked={field.value}
						/>
					)}
				/>
				<Controller
					name="includeIntroOutro"
					control={control}
					render={({ field }) => (
						<ToggleSwitch
							label="Include intro/outro"
							value="includeIntroOutro"
							onChange={field.onChange}
							name="includeIntroOutro"
							isChecked={field.value}
						/>
					)}
				/>
				<Controller
					name="includeReissueTrack"
					control={control}
					render={({ field }) => (
						<ToggleSwitch
							label="Include deluxe/reissue track"
							value="includeReissueTrack"
							onChange={field.onChange}
							name="includeReissueTrack"
							isChecked={field.value}
						/>
					)}
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
	);
}
