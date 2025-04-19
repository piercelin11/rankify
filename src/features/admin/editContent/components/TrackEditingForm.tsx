import { AlbumData, TrackData } from "@/types/data";
import { updateTrackSchema, UpdateTrackType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import updateTrack from "../actions/updateTrack";
import Button from "@/components/ui/Button";
import { Description } from "@/components/ui/Text";
import FormItem from "@/components/form/FormInput";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import FormMessage from "@/components/form/FormMessage";
import { ActionResponse } from "@/types/action";
import FormRadioGroup from "@/components/form/FormRadioGroup";
import FormSelect from "@/components/form/FormSelect";

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
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isPending, setPending] = useState<boolean>(false);

	const selectOptions = albums.map((album) => ({
		id: album.id,
		value: album.name,
		label: album.name,
	}));

	const {
		register,
		control,
		setFocus,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateTrackType>({
		resolver: zodResolver(updateTrackSchema),
		defaultValues: {
			name: trackData.name,
			album: trackData.album?.name,
			type: trackData.type,
		},
	});

	async function onSubmit(formData: UpdateTrackType) {
		setPending(true);
		try {
			const editTrackResponse = await updateTrack(trackData, formData);
			setResponse(editTrackResponse);
			if (editTrackResponse.success) onCancel();
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setResponse({ success: false, message: "Something went wrong." });
				}
			}
			console.error(`Error editing track ${trackData.name}`, error);
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
				<h2>Edit Track</h2>
				<Description>edit track info.</Description>
			</div>
			<hr />
			<form className="space-y-10" onSubmit={handleSubmit(onSubmit)}>
				<FormItem
					title="Track name"
					message={errors.name?.message}
					{...register("name")}
				/>
				<FormSelect
					title={"Album"}
					options={selectOptions}
					{...register("album")}
				/>
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
						disabled={isPending}
					>
						Cancel
					</Button>
					<Button variant="lime" type="submit" disabled={isPending}>
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
