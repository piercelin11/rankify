"use client";

import { PLACEHOLDER_PIC } from "@/constants";
import Image from "next/image";
import Button from "@/components/buttons/Button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import FormMessage from "@/components/form/FormMessage";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import useProfilePictureUpload from "../hooks/useProfilePictureUpload";
import { useModal } from "@/lib/hooks/useModal";

type ImageUploadFormProps = {
	img: string | null;
};

export default function ImageUploadForm({ img }: ImageUploadFormProps) {
	const { showCustom, closeTop } = useModal();
	const {
		handleSubmit,
		errors,
		isSubmitting,
		optimisticImgUrl,
		response,
		handleFileChange,
		previewImgUrl,
	} = useProfilePictureUpload(img, closeTop);

	function Form() {
		return (
			<form
				className="flex flex-col items-center justify-center space-y-8"
				onSubmit={handleSubmit}
			>
				<div className="group relative h-44 w-44 rounded-full border border-neutral-600">
					<label
						htmlFor="image"
						className="absolute z-10 hidden h-full w-full items-center justify-center rounded-full bg-neutral-950/50 group-hover:flex"
					>
						<input
							id="image"
							name="image"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							hidden
						/>
						<Pencil1Icon width={32} height={32} className="text-neutral-100" />
					</label>
					<Image
						className="rounded-full object-cover p-1"
						src={previewImgUrl || PLACEHOLDER_PIC}
						fill
						sizes="96px"
						alt={"your profile picture"}
					/>
				</div>
				{errors.image?.message && (
					<FormMessage
						message={errors.image?.message}
						type="error"
						border={false}
					/>
				)}
				<div className="flex gap-2">
					<Button variant="primary" type="submit">
						Save
					</Button>
					<Button variant="secondary" onClick={closeTop}>
						Cancel
					</Button>
				</div>
			</form>
		);
	}

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
					src={optimisticImgUrl || PLACEHOLDER_PIC}
					fill
					sizes="96px"
					alt={"your profile picture"}
				/>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="secondary"
					onClick={() =>
						showCustom({
							title: "Edit Picture",
							description: "upload and change your profile picture.",
							content: <Form />,
						})
					}
					disabled={isSubmitting}
				>
					Edit picture
				</Button>
				{response && (
					<FormMessage message={response.message} type={response.type} />
				)}
			</div>
		</div>
	);
}
