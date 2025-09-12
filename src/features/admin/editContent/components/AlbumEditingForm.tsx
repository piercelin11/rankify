import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import ColorSelector from "./ColorSelector";
import { Controller, useForm } from "react-hook-form";
import { updateAlbumSchema, UpdateAlbumType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlbumData } from "@/types/data";
import updateAlbum from "@/features/admin/editContent/actions/updateAlbum";
import FormMessage from "@/components/form/FormMessage";
import { AppResponseType } from "@/types/response";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import CoverSelector from "./AlbumCoverSelector";
import { ADMIN_MESSAGES } from "@/constants/messages";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type AlbumEditingFormProps = {
	data: AlbumData;
	onClose: () => void;
};

export default function AlbumEditingForm({
	data,
	onClose,
}: AlbumEditingFormProps) {
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const isMounted = useRef<HTMLFormElement | null>(null);

	const {
		control,
		register,
		handleSubmit,
		setFocus,
		formState: { errors, isSubmitting },
	} = useForm<UpdateAlbumType>({
		resolver: zodResolver(updateAlbumSchema),
		defaultValues: {
			img: data.img!,
			name: data.name,
			color: data.color || "",
		},
	});

	async function onSubmit(formData: UpdateAlbumType) {
		try {
			const updateAlbumResponse = await updateAlbum({
				albumId: data.id,
				formData,
			});
			if (isMounted.current) setResponse(updateAlbumResponse);
			if (updateAlbumResponse.type === "success" && isMounted.current)
				onClose();
		} catch (error) {
			console.log(error);
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT" && isMounted.current) {
					setResponse({
						type: "error",
						message: ADMIN_MESSAGES.ALBUM.UPDATE.FAILURE,
					});
				}
			}
			console.error(`Failed to update album ${data.name}`, error);
		}
	}

	useEffect(() => {
		setFocus("name");
	}, [setFocus]);

	return (
		<div className="space-y-6">
			<form
				ref={isMounted}
				className="space-y-6"
				onSubmit={handleSubmit(onSubmit)}
			>
				<Controller
					name="img"
					control={control}
					render={({ field }) => (
						<CoverSelector
							album={data}
							onChange={field.onChange}
							onBlur={field.onBlur}
							value={field.value}
						/>
					)}
				/>
				<div>
					<Label htmlFor={`albumName-${data.id}`} className="text-neutral-200">
						Album Name
					</Label>
					<Input
						id={`albumName-${data.id}`}
						{...register("name")}
						className="mt-1"
					/>
					{errors.name && (
						<p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
					)}
				</div>
				<Controller
					name="color"
					control={control}
					render={({ field }) => (
						<ColorSelector
							data={data}
							message={errors.color?.message}
							onChange={field.onChange}
							onBlur={field.onBlur}
							value={field.value}
							name={field.name}
						/>
					)}
				/>
				<div className="flex items-center gap-3">
					<Button type="submit" disabled={isSubmitting} className="flex-1">
						Save
					</Button>
					<Button
						variant="outline"
						type="button"
						className="flex-1"
						onClick={onClose}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					{isSubmitting && (
						<div className="px-5">
							<LoadingAnimation />
						</div>
					)}
					{response && (
						<FormMessage message={response.message} type={response.type} />
					)}
				</div>
			</form>
		</div>
	);
}
