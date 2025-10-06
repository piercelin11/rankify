import z from "zod/v4";

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

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

export type ProfilePictureType = z.infer<typeof profilePictureSchema>;

export const profilePictureSchema = z.object({
	image: z
		.custom<FileList>(
			(value): value is FileList =>
				typeof window !== "undefined" && value instanceof FileList,
			{
				message: "Image is required",
			}
		)
		.optional()
		.superRefine((fileList, ctx) => {
			if (
				!fileList ||
				typeof fileList.length !== "number" ||
				fileList.length === 0
			) {
				return;
			}

			const file = fileList[0];

			if (file.size > MAX_FILE_SIZE) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
				});
			}

			if (!ALLOWED_FILE_TYPES.includes(file.type)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Only JPG, PNG, and GIF files are allowed.",
				});
			}
		}),
});
