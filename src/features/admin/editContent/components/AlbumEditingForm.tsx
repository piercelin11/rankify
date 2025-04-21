import React, { useEffect, useState } from "react";
import Description from "@/components/typography/Description";
import FormItem from "@/components/form/FormInput";
import Button from "@/components/buttons/Button";
import AlbumColorSelector from "./AlbumColorSelector";
import { Controller, useForm } from "react-hook-form";
import { updateAlbumSchema, updateAlbumType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlbumData } from "@/types/data";
import updateAlbum from "@/features/admin/editContent/actions/updateAlbum";
import FormMessage from "@/components/form/FormMessage";
import { ActionResponse } from "@/types/action";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";

type AlbumEditingFormProps = {
	data: AlbumData;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AlbumEditingForm({
	data,
	setOpen,
}: AlbumEditingFormProps) {
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isPending, setPending] = useState<boolean>(false);

	const {
		control,
		register,
		handleSubmit,
		setFocus,
		formState: { errors },
	} = useForm<updateAlbumType>({
		resolver: zodResolver(updateAlbumSchema),
		defaultValues: {
			name: data.name,
			color: data.color || "",
		},
	});

	async function onSubmit(formData: updateAlbumType) {
		setPending(true);
		try {
			const updateAlbumResponse = await updateAlbum(data.id, formData);
			setResponse(updateAlbumResponse);
			if (updateAlbumResponse.success) setOpen(false);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setResponse({ success: false, message: "Something went wrong." });
				}
			}
			console.error(`Error editing album ${data.name}`, error);
		} finally {
			setPending(false);
		}
	}

	useEffect(() => {
		setFocus("name");
	}, []);

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
					title="Album name"
					message={errors.name?.message}
				/>
				<Controller
					name="color"
					control={control}
					render={({ field }) => (
						<AlbumColorSelector
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
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button variant="primary" type="submit" disabled={isPending}>
						Save
					</Button>
					{isPending && (
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
