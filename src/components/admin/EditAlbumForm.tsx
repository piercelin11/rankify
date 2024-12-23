import React, { useEffect, useRef, useState } from "react";
import { Description } from "../ui/Text";
import FormItem from "../form/FormItem";
import Button from "../ui/Button";
import AlbumColorSelector from "./AlbumColorSelector";
import { useForm } from "react-hook-form";
import { updateAlbumSchema, updateAlbumType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlbumData } from "@/types/data";
import updateAlbum from "@/lib/action/admin/updateAlbum";
import FormMessage from "../form/FormMessage";
import { ActionResponse } from "@/types/action";
import LoadingAnimation from "../ui/LoadingAnimation";
import { useFormStatus } from "react-dom";

type EditAlbumFormProps = {
	data: AlbumData;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function EditAlbumForm({ data, setOpen }: EditAlbumFormProps) {
	const [colorMode, setcolorMode] = useState<"radio" | "text">("radio");
	const [response, setResponse] = useState<ActionResponse | null>(null);

	const { pending } = useFormStatus();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<updateAlbumType>({
		resolver: zodResolver(updateAlbumSchema),
	});

	async function onSubmit(formData: updateAlbumType) {
		try {
			const updateAlbumResponse = await updateAlbum(data.id, formData);
			setResponse(updateAlbumResponse);
			setOpen(false)
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setResponse({ success: false, message: "Something went wrong." });
				}
			}
		}
	}

	return (
		<div className="space-y-8 p-5">
			<div>
				<h2>Edit Album</h2>
				<Description>edit album name and album color.</Description>
			</div>
			<hr />
			<form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
				<FormItem
					{...register("name")}
					label="Album name"
					defaultValue={data.name}
					message={errors.name?.message}
				/>
				<div className="space-y-4">
					<AlbumColorSelector
						{...register("color")}
						data={data}
						mode={colorMode}
						setMode={setcolorMode}
						message={errors.color?.message}
					/>
				</div>
				<div className="flex items-center gap-6">
					<Button
						variant="transparent"
						onClick={() => setOpen(false)}
						disabled={pending}
					>
						Cancel
					</Button>
					<Button variant="lime" type="submit" disabled={pending}>
						Save
					</Button>
					{pending && (
						<div className="px-5">
							<LoadingAnimation />
						</div>
					)}
					{response && (
						<FormMessage
							message={response.message}
							isError={!response.success}
						/>
					)}
				</div>
			</form>
		</div>
	);
}
