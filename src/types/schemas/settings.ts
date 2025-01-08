import * as z from "zod";

export type RankingSettingsType = z.infer<typeof rankingSettingsSchema>

export const rankingSettingsSchema = z.object({
    includeInterlude: z.boolean(),
    includeIntroOutro: z.boolean(),
})