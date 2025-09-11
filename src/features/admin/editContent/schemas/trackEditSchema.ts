import { z } from "zod";
import { $Enums } from "@prisma/client";

export const trackEditSchema = z.object({
	name: z.string().min(1, "Track name is required"),
	album: z.string().optional(),
	trackNumber: z.number().min(1, "Track number must be at least 1"),
	discNumber: z.number().min(1, "Disc number must be at least 1"),
	type: z.nativeEnum($Enums.TrackType),
});

export type TrackEditFormData = z.infer<typeof trackEditSchema>;