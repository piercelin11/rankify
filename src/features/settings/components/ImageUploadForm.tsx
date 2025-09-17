"use client";

import { PLACEHOLDER_PIC } from "@/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FormMessage from "@/components/form/FormMessage";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import useProfilePictureUpload from "../hooks/useProfilePictureUpload";
import { useRef, useState } from "react";

type ImageUploadFormProps = {
	img: string | null;
};

export default function ImageUploadForm({ img }: ImageUploadFormProps) {
	const [isEditing, setIsEditing] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	const {
		handleSubmit,
		errors,
		isSubmitting,
		optimisticImgUrl,
		response,
		handleFileChange,
		previewImgUrl,
		setPreviewImgUrl
	} = useProfilePictureUpload(img, () => setIsEditing(false));

	const handleEditClick = () => {
		if (isEditing) {
			// 如果正在編輯，執行保存
			handleSubmit();
		} else {
			// 如果不在編輯，打開文件選擇器
			fileInputRef.current?.click();
		}
	};

	const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFileChange(e);
		setIsEditing(true); // 選擇文件後進入編輯模式
	};

	const handleCancel = () => {
		setIsEditing(false);
		setPreviewImgUrl(img)
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="flex items-center gap-4">
			<div className="relative h-24 w-24">
				{isSubmitting && (
					<div className="absolute z-10 flex h-full w-full items-center justify-center rounded-full bg-neutral-950/50">
						<LoadingAnimation />
					</div>
				)}
				<Image
					className="rounded-full object-cover"
					src={previewImgUrl || optimisticImgUrl || PLACEHOLDER_PIC}
					fill
					sizes="96px"
					alt={"your profile picture"}
				/>
			</div>

			<div className="flex items-center gap-2">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={onFileChange}
					hidden
				/>
				
				<Button
					variant={isEditing ? "primary" : "secondary"}
					onClick={handleEditClick}
					disabled={isSubmitting}
				>
					{isEditing ? "Save picture" : "Edit picture"}
				</Button>
				
				{isEditing && (
					<Button
						variant="secondary"
						onClick={handleCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				)}
				
				{errors.image?.message && (
					<FormMessage
						message={errors.image?.message}
						type="error"
					/>
				)}
				
				{response && (
					<FormMessage message={response.message} type={response.type} />
				)}
			</div>
		</div>
	);
}