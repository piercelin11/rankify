import { AlbumData, TrackData } from "@/types/data.types";
import { updateTrackSchema, UpdateTrackType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import updateTrack from "../actions/updateTrack";
import Button from "@/components/buttons/Button";
import FormItem from "@/components/form/FormInput";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import FormMessage from "@/components/form/FormMessage";
import { AppResponseType } from "@/types/response.types";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import FormSelect from "@/components/form/FormSelect";
import ColorSelector from "./ColorSelector";

type TrackEditingFormProps = {
	trackData: TrackData;
	albums: AlbumData[];
	onCancel: () => void;
};

const radioOptions = [
	{
		id: "STANDARD",
		label: "STANDARD",
		value: "STANDARD",
	},
	{
		id: "REISSUE",
		label: "REISSUE",
		value: "REISSUE",
	},
];

export default function TrackEditingForm({
	albums,
	trackData,
	onCancel,
}: TrackEditingFormProps) {
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const isMounted = useRef<HTMLFormElement | null>(null);

	const selectOptions = [
		{ id: "non-album-track", value: "", label: "Non-album track" },
		...albums.map((album) => ({
			id: album.id,
			value: album.name,
			label: album.name,
		})),
	];

	const {
		register,
		control,
		setFocus,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UpdateTrackType>({
		resolver: zodResolver(updateTrackSchema),
		defaultValues: {
			name: trackData.name,
			album: trackData.album?.name,
			type: trackData.type,
		},
	});

	async function onSubmit(formData: UpdateTrackType) {
		try {
			const editTrackResponse = await updateTrack(trackData, formData);
			if (isMounted.current) setResponse(editTrackResponse);
			if (editTrackResponse.success && isMounted.current) onCancel();
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT" && isMounted.current) {
					setResponse({ type: "error", message: "Something went wrong." });
				}
			}
			console.error(`Error editing track ${trackData.name}`, error);
		}
	}

	useEffect(() => {
		setFocus("name");
	}, []);

	return (
		<div className="space-y-8">
			<div>
				<h2>Edit Track</h2>
				<p className="text-description">edit track info.</p>
			</div>
			<hr />
			<form
				ref={isMounted}
				className="space-y-10"
				onSubmit={handleSubmit(onSubmit)}
			>
				<FormItem
					label="Track name"
					message={errors.name?.message}
					{...register("name")}
				/>
				<FormSelect
					title={"Album"}
					options={selectOptions}
					{...register("album")}
				/>
				{!trackData.albumId && (
					<Controller
						name="color"
						control={control}
						render={({ field }) => (
							<ColorSelector
								data={trackData}
								message={errors.color?.message}
								onChange={field.onChange}
								onBlur={field.onBlur}
								value={field.value}
								name={field.name}
							/>
						)}
					/>
				)}
				<Controller
					name="type"
					control={control}
					render={({ field }) => (
						<FormRadioGroup
							options={radioOptions}
							title="Track type"
							value={field.value}
							onChange={field.onChange}
						/>
					)}
				/>

				<div className="flex items-center gap-6">
					<Button
						variant="outline"
						type="button"
						onClick={onCancel}
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
