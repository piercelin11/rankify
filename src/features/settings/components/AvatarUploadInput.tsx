import { PLACEHOLDER_PIC } from "@/config/variables";
import Image from "next/image";
import React from "react";

type AvatarUploadInputProps = {
	img: string | null;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	name: string;
};

export default function AvatarUploadInput({
	img,
	onChange,
	name,
}: AvatarUploadInputProps) {
	return (
		<div className="flex items-center gap-4">
			<div className="relative h-24 w-24">
				<Image
					className="rounded-full object-cover"
					src={img || PLACEHOLDER_PIC }
					fill
					sizes="96px"
					alt={"your profile picture"}
				/>
			</div>
			<label
				htmlFor="avatar"
				className="rounded-xl bg-neutral-900 px-4 py-2 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100"
			>
				<input
					id="avatar"
					name={name}
					type="file"
					accept="image/*"
					onChange={onChange}
					hidden
				/>
				Edit picture
			</label>
		</div>
	);
}
