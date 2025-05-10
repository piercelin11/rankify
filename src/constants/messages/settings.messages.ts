export const SETTINGS_MESSAGES = {
	FILE_UPLOAD: {
		FILE_REQUIRED: "A file is required. Please select one.",
		FILENAME_AND_TYPE_REQUIRED: "Filename and file type are required.",
		INVALID_TYPE_IMAGE_ONLY: "Invalid file type. Only image files are allowed.", 
		S3_UPLOAD_ERROR:
			"Failed to upload file to cloud storage. Please try again.",
		UPLOAD_CANCELLED: "File upload cancelled by user.",
		COMPRESSION_ERROR:
			"Failed to process image for upload. Please try a different image or try again.",
		PRESIGNED_URL_SUCCESS:
			"Upload URL generated successfully. You can now upload your file.",
		PRESIGNED_URL_FAILURE:
			"Could not generate an upload URL. Please try again later.",
	},

	PROFILE: {
		ERROR_INVALID_FIELDS:
			"Invalid profile data. Please check the fields for errors.",
		USERNAME_EXISTS_ERROR:
			"This username is already taken. Please choose another.",
		SAVE_FAILURE: "Failed to save your profile settings. Please try again.",
		SAVE_SUCCESS: "Your profile settings have been saved successfully.",
	},

	RANKING: {
		ERROR_INVALID_FIELDS:
			"Invalid ranking settings data. Please check your input.",
		SAVE_FAILURE: "Failed to save your ranking settings. Please try again.",
		SAVE_SUCCESS: "Your ranking settings have been saved successfully.",
	},

	PROFILE_IMAGE: {
		SELECT_PICTURE_REQUIRED: "You need to upload a picture for your profile.",
		UPDATE_FAILURE: "Failed to update your profile picture. Please try again.",
		UPDATE_SUCCESS: "Your profile picture has been updated successfully.",
	},

	GENERAL_ERROR_INVALID_FIELDS:
		"Invalid fields. Please check your input and try again.",
};
