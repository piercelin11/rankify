import React, { useEffect, useState } from "react";
import Description from "@/components/typography/Description";
import FormItem from "@/components/form/FormInput";
import Button from "@/components/buttons/Button";
import { useForm } from "react-hook-form";
import { updateArtistSchema, updateArtistType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArtistData } from "@/types/data";
import FormMessage from "@/components/form/FormMessage";
import { ActionResponse } from "@/types/action";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import updateArtist from "@/features/admin/editContent/actions/updateArtist";

type ArtistEditingFormProps = {
	data: ArtistData;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ArtistEditingForm({
	data,
	setOpen,
}: ArtistEditingFormProps) {
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isPending, setPending] = useState<boolean>(false);

	const {
		register,
		handleSubmit,
		setFocus,
		formState: { errors },
	} = useForm<updateArtistType>({
		resolver: zodResolver(updateArtistSchema),
	});

	async function onSubmit(formData: updateArtistType) {
		setPending(true);
		try {
			const updateAlbumResponse = await updateArtist(data.id, formData);
			setResponse(updateAlbumResponse);
			if (updateAlbumResponse.success) setOpen(false);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setResponse({ success: false, message: "Something went wrong." });
				}
			}
			console.error(`Error editing artist ${data.name}`, error);
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
				<h2>Edit Artist</h2>
				<Description>edit artist name.</Description>
			</div>
			<hr />
			<form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
				<FormItem
					{...register("name")}
					title="Artist name"
					defaultValue={data.name}
					message={errors.name?.message}
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
