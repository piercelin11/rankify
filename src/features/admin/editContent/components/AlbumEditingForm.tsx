import React, { useEffect, useRef, useState } from "react";
import FormItem from "@/components/form/FormInput";
import Button from "@/components/buttons/Button";
import ColorSelector from "./ColorSelector";
import { Controller, useForm } from "react-hook-form";
import { updateAlbumSchema, UpdateAlbumType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlbumData } from "@/types/data";
import updateAlbum from "@/features/admin/editContent/actions/updateAlbum";
import FormMessage from "@/components/form/FormMessage";
import { ActionResponse } from "@/types/action";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import CoverSelector from "./AlbumCoverSelector";

type AlbumEditingFormProps = {
	data: AlbumData;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AlbumEditingForm({
	data,
	setOpen,
}: AlbumEditingFormProps) {
	const [response, setResponse] = useState<ActionResponse | null>(null);
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
			const updateAlbumResponse = await updateAlbum(data.id, formData);
			if (isMounted.current) setResponse(updateAlbumResponse);
			if (updateAlbumResponse.success && isMounted.current) setOpen(false);
		} catch (error) {
			console.log(error);
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT" && isMounted.current) {
					setResponse({ success: false, message: "Something went wrong." });
				}
			}
			console.error(`Error editing album ${data.name}`, error);
		}
	}

	useEffect(() => {
		setFocus("name");
	}, []);

	return (
		<div className="space-y-8">
			<div>
				<h2>Edit Album</h2>
				<p className="text-description">edit album info.</p>
			</div>
			<hr />
			<form ref={isMounted} className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
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

				<FormItem
					{...register("name")}
					label="Album name"
					message={errors.name?.message}
				/>
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
				<div className="flex items-center gap-6">
					<Button
						variant="outline"
						type="button"
						onClick={() => setOpen(false)}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<Button variant="primary" type="submit" disabled={isSubmitting}>
						Save
					</Button>
					{isSubmitting && (
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
