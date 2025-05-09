import React, { useEffect, useRef, useState } from "react";
import FormItem from "@/components/form/FormInput";
import Button from "@/components/buttons/Button";
import { useForm } from "react-hook-form";
import { updateArtistSchema, UpdateArtistType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArtistData } from "@/types/data";
import FormMessage from "@/components/form/FormMessage";
import { AppResponseType } from "@/types/response";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import updateArtist from "@/features/admin/editContent/actions/updateArtist";
import { ADMIN_MESSAGES } from "@/constants/messages";

type ArtistEditingFormProps = {
	data: ArtistData;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ArtistEditingForm({
	data,
	setOpen,
}: ArtistEditingFormProps) {
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const isMounted = useRef<HTMLFormElement | null>(null);

	const {
		register,
		handleSubmit,
		setFocus,
		formState: { errors, isSubmitting },
	} = useForm<UpdateArtistType>({
		resolver: zodResolver(updateArtistSchema),
	});

	async function onSubmit(formData: UpdateArtistType) {
		try {
			const updateAlbumResponse = await updateArtist({
				artistId: data.id,
				formData,
			});
			if (isMounted.current) setResponse(updateAlbumResponse);
			if (updateAlbumResponse.type === "success" && isMounted.current)
				setOpen(false);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT" && isMounted.current) {
					setResponse({
						type: "error",
						message: ADMIN_MESSAGES.ARTIST.UPDATE.FAILURE,
					});
				}
			}
			console.error(`Failed to updaye artist ${data.name}`, error);
		}
	}

	useEffect(() => {
		setFocus("name");
	}, []);

	return (
		<div className="space-y-8">
			<div>
				<h2>Edit Artist</h2>
				<p className="text-description">edit artist name.</p>
			</div>
			<hr />
			<form
				ref={isMounted}
				className="space-y-10"
				onSubmit={handleSubmit(onSubmit)}
			>
				<FormItem
					{...register("name")}
					label="Artist name"
					defaultValue={data.name}
					message={errors.name?.message}
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
						<FormMessage message={response.message} type={response.type} />
					)}
				</div>
			</form>
		</div>
	);
}
