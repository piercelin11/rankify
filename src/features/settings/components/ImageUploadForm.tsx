"use client";

import { PLACEHOLDER_PIC } from "@/config/variables";
import {
	profilePictureSchema,
	ProfilePictureType,
} from "@/types/schemas/settings";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Compressor from "compressorjs";
import Button from "@/components/buttons/Button";
import ModalWrapper from "@/components/modals/ModalWrapper";

type ImageUploadFormProps = {
	img: string | null;
};

export default function ImageUploadForm({ img }: ImageUploadFormProps) {
	const [previewUrl, setPreviewUrl] = useState<string | null>(img);
	const [isFormOpen, setFormOpen] = useState(false);

	const {
		handleSubmit,
		formState: { errors, isSubmitting },
		setValue,
		trigger,
	} = useForm<ProfilePictureType>({
		resolver: zodResolver(profilePictureSchema),
	});

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		/* const originalFile = e.target.files?.[0];
		if (originalFile) {
			new Compressor(originalFile, {
				maxWidth: 500,
				maxHeight: 500,
				quality: 0.6,
				mimeType: "image/jpeg",

				success(optimizedBlob: Blob) {
					const optimizedFile = new File([optimizedBlob], originalFile.name, {
						type: optimizedBlob.type,
						lastModified: Date.now(),
					});

					const dataTransfer = new DataTransfer();
					dataTransfer.items.add(optimizedFile);
					const optimizedFileList = dataTransfer.files;

					setValue("image", optimizedFileList);
					if (previewUrl) URL.revokeObjectURL(previewUrl);
					setPreviewUrl(URL.createObjectURL(optimizedBlob));

					trigger("image");

					//解決原生瀏覽器在處理檔案時，若上傳同個檔案不會觸發 onChange 的問題
					const inputElement = e.target;
					inputElement.value = "";
				},
				error(err: Error) {
					console.error("Image compression failed:", err.message);

					setValue("image", null);
					if (previewUrl) URL.revokeObjectURL(previewUrl);
					setPreviewUrl(null);

					trigger("image");

					const inputElement = e.target;
					inputElement.value = "";
				},
			});
		} else {
			setValue("image", null);
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			setPreviewUrl(null);
			const inputElement = e.target;
			inputElement.value = "";
			trigger("image");
		} */
	}

	return (
		<div className="flex items-center gap-4">
			<div className="relative h-24 w-24">
				<Image
					className="rounded-full object-cover"
					src={img || PLACEHOLDER_PIC}
					fill
					sizes="96px"
					alt={"your profile picture"}
				/>
			</div>

			<Button
				variant="secondary"
				className="px-4 py-2"
				onClick={() => setFormOpen(true)}
			>
				Edit picture
			</Button>
			<ModalWrapper onRequestClose={() => setFormOpen(false)} isRequestOpen={isFormOpen}>
				<Image
					className="rounded-full object-cover"
					src={previewUrl || PLACEHOLDER_PIC}
					fill
					sizes="96px"
					alt={"your profile picture"}
				/>
				<label
					htmlFor="image"
					className="rounded-xl bg-neutral-900 px-4 py-2 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100"
				>
					<input
						id="image"
						name="image"
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						hidden
					/>
					Edit picture
				</label>
			</ModalWrapper>

			{/* <label
				htmlFor="image"
				className="rounded-xl bg-neutral-900 px-4 py-2 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100"
			>
				<input
					id="image"
					name="image"
					type="file"
					accept="image/*"
					onChange={handleFileChange}
					hidden
				/>
				Edit picture
			</label> */}
		</div>
	);
}
