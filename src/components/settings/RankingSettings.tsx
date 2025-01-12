"use client";

import React, { useState } from "react";
import { Description } from "../ui/Text";
import ToggleButton from "../ui/ToggleButton";
import { useForm } from "react-hook-form";
import Button from "../ui/Button";
import {
	rankingSettingsSchema,
	RankingSettingsType,
} from "@/types/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPreferenceData } from "@/types/data";
import saveRankingSettings from "@/lib/action/settings/saveRankingSettings";
import { ActionResponse } from "@/types/action";
import FormMessage from "../form/FormMessage";
import LoadingAnimation from "../ui/LoadingAnimation";

type RankingSettingsProps = {
	settings: UserPreferenceData | null;
};

export const defaultRankingSettings: RankingSettingsType = {
	includeInterlude: true,
	includeIntroOutro: true,
	includeReissueTrack: true,
};

export default function RankingSettings({ settings }: RankingSettingsProps) {
	const defaultSettings = settings?.rankingSettings || defaultRankingSettings;
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isPending, setPending] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		watch,
	} = useForm<RankingSettingsType>({
		resolver: zodResolver(rankingSettingsSchema),
	});

	const [includeInterlude, includeIntroOutro, includeReissueTrack] = watch(
		["includeInterlude", "includeIntroOutro", "includeReissueTrack"],
		{
			includeInterlude: defaultSettings.includeInterlude,
			includeIntroOutro: defaultSettings.includeIntroOutro,
			includeReissueTrack: defaultSettings.includeReissueTrack,
		}
	);

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
					<Description>
						Configure how album stats are calculated and displayed.
					</Description>
				</div>
				<div className="flex items-center gap-10">
					<h4>Include interlude</h4>
					<label>
						<ToggleButton selected={includeInterlude} />
						<input
							{...register("includeInterlude")}
							className="hidden"
							defaultChecked={includeInterlude}
							type="checkbox"
						/>
					</label>
				</div>
				<div className="flex items-center gap-10">
					<h4>Include intro/outro</h4>
					<label>
						<ToggleButton selected={includeIntroOutro} />
						<input
							{...register("includeIntroOutro")}
							className="hidden"
							defaultChecked={includeIntroOutro}
							type="checkbox"
						/>
					</label>
				</div>
				<div className="flex items-center gap-10">
					<h4>Include deluxe/reissue track</h4>
					<label>
						<ToggleButton selected={includeReissueTrack} />
						<input
							{...register("includeReissueTrack")}
							className="hidden"
							defaultChecked={includeReissueTrack}
							type="checkbox"
						/>
					</label>
				</div>
			</div>
			<div className="flex gap-4 items-center">
				<Button variant="lime" type="submit" disabled={isPending}>
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
