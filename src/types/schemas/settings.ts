import * as z from "zod";

export type RankingSettingsType = z.infer<typeof rankingSettingsSchema>;

export const rankingSettingsSchema = z.object({
	includeInterlude: z.boolean(),
	includeIntroOutro: z.boolean(),
	includeReissueTrack: z.boolean(),
});

export type ProfileSettingsType = z.infer<typeof profileSettingsSchema>;

export const profileSettingsSchema = z.object({
	name: z.string().min(1, "name required at lest 1 characters."),
	username: z.string().min(1, "username required at lest 1 characters."),
});
