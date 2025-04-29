"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	rankingSettingsSchema,
	RankingSettingsType,
} from "@/types/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPreferenceData } from "@/types/data";
import { ActionResponse } from "@/types/action";
import Button from "@/components/buttons/Button";
import FormMessage from "@/components/form/FormMessage";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import ToggleSwitch from "@/components/form/ToggleSwitch";
import saveRankingSettings from "../actions/saveRankingSettings";

type RankingSettingsFormProps = {
	settings: UserPreferenceData | null;
};

export const defaultRankingSettings: RankingSettingsType = {
	includeInterlude: true,
	includeIntroOutro: true,
	includeReissueTrack: true,
};

export default function RankingSettingsForm({ settings }: RankingSettingsFormProps) {
	const defaultSettings = settings?.rankingSettings || defaultRankingSettings;
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isPending, setPending] = useState<boolean>(false);

	const { handleSubmit, control } = useForm<RankingSettingsType>({
		resolver: zodResolver(rankingSettingsSchema),
		defaultValues: {
			includeInterlude: defaultSettings.includeInterlude,
			includeIntroOutro: defaultSettings.includeIntroOutro,
			includeReissueTrack: defaultSettings.includeReissueTrack,
		},
	});

	async function onSubmit(formData: RankingSettingsType) {
		setPending(true);
		try {
			
			const response = await saveRankingSettings(formData);
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
