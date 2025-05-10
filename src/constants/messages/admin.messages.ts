import { capitalizeFirstLetter } from "@/lib/utils";

export const ADMIN_MESSAGES = {
	// 通用或共享的訊息
	ALBUM_SELECTION_REQUIRED: "You need to select at least one album.",
	TRACK_SELECTION_REQUIRED: "You need to select at least one track.",

	// Album 相關訊息
	ALBUM: {
		ADD: {
			SUCCESS: "Albums and their tracks added successfully.",
			FAILURE: "Failed to save album details.",
		},
		UPDATE: {
			SUCCESS: "Album information has been updated successfully.",
			FAILURE: "Failed to update album information.",
			ERROR_NOT_FOUND: "Album not found. Update failed.",
			ERROR_INVALID_FIELDS:
				"Invalid data provided for album update. Please check your input.",
		},
	},

	// Artist 相關訊息
	ARTIST: {
		ADD: {
			SUCCESS: "Artist, associated albums, and tracks added successfully.",
			FAILURE: "Failed to save artist details.",
		},
		UPDATE: {
			SUCCESS: "Artist information has been updated successfully.",
			FAILURE: "Failed to update artist information.",
			ERROR_NOT_FOUND: "Artist not found. Update failed.",
			ERROR_INVALID_FIELDS:
				"Invalid data provided for artist update. Please check your input.",
		},
		ALREADY_EXISTS: "This artist already exists in the database.",
		FETCH_NOT_FOUND: "Artist with the given ID was not found on Spotify.",
	},

	// Track 相關訊息
	TRACK: {
		ADD: { FAILURE: "Failed to save tracks for the album(s)." },
		UPDATE: {
			SUCCESS: "Track information has been updated successfully.",
			FAILURE: "Failed to update track information.",
			ERROR_INVALID_FIELDS:
				"Invalid data provided for track update. Please check your input.",
		},
	},

	// Single 相關訊息
	SINGLE: {
		ADD: {
			SUCCESS: "Singles added successfully.",
			FAILURE: "Failed to save single details.",
		},
	},

	OPERATION_MESSAGES: {
		DELETE: {
			SUCCESS: (itemType: string) =>
				`Successfully deleted ${capitalizeFirstLetter(itemType)}.`,
			FAILURE: (itemType: string) =>
				`Failed to delete ${capitalizeFirstLetter(itemType)}.`,
		},
		UPDATE: {
			SUCCESS: (itemType: string) =>
				`Successfully updated ${capitalizeFirstLetter(itemType)}.`,
			FAILURE: (itemType: string) =>
				`Failed to update ${capitalizeFirstLetter(itemType)}.`,
		},
	},
};
