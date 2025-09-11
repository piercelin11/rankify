import { $Enums } from "@prisma/client";
import * as z from "zod";

export const updateTrackSchema = z.object({
	name: z.string(),
	album: z.string().or(z.literal("")),
	trackNumber: z.coerce.number(),
	discNumber: z.coerce.number().optional(),
	type: z.nativeEnum($Enums.TrackType),
	color: z
		.string()
		.refine(
			(value) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value),
			"Must be a valid HEX color, e.g., #FFF or #FFFFFF"
		)
		.optional(),
});

export type UpdateTrackType = z.infer<typeof updateTrackSchema>;

export const updateAlbumSchema = z.object({
	img: z.string().min(1, "Album cover is required."),
	name: z.string().min(1, "Album name is required."),
	color: z
		.string()
		.refine(
			(value) => /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value),
			"Must be a valid HEX color, e.g., #FFF or #FFFFFF"
		),
});

export type UpdateAlbumType = z.infer<typeof updateAlbumSchema>;

export const updateArtistSchema = z.object({
	name: z.string().min(1, "Artist name is required."),
});

export type UpdateArtistType = z.infer<typeof updateArtistSchema>;
