import { AlbumData, TrackData } from "@/types/data";
import { updateTrackSchema, UpdateTrackType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useEffect, useOptimistic } from "react";
import { useForm } from "react-hook-form";
import updateTrack from "../actions/updateTrack";
import { AdminTrackListStyle } from "./TrackListItem";
import FormInlineEditInput from "@/components/form/FormInlineEditInput";
import SelectorInput from "@/components/form/SelectorInput";
import RadioItem from "@/components/form/RadioItem";
import Button from "@/components/ui/Button";
import { CheckIcon } from "@radix-ui/react-icons";

type TrackInlineEditingFormProps = {
	trackData: TrackData;
	albums: AlbumData[];
	isEditing: boolean;
    onCancel: () => void;
};

const radioData = [
	{
		label: "STANDARD",
		value: "STANDARD",
	},
	{
		label: "REISSUE",
		value: "REISSUE",
	},
];

export default function TrackInlineEditingForm({
	albums,
	trackData,
    onCancel,
	isEditing,
}: TrackInlineEditingFormProps) {
	const menuData = albums.map((album) => ({
		id: album.id,
		value: album.name,
		label: album.name,
	}));

	const [optimisticTrackData, setOptimisticTrackData] = useOptimistic(
		{
			name: trackData.name,
			album: trackData.album?.name,
			type: trackData.type,
		},
		(_, newTrackData: UpdateTrackType) => {
			return newTrackData;
		}
	);

	const { register, setFocus, handleSubmit, watch, setValue } =
		useForm<UpdateTrackType>({
			resolver: zodResolver(updateTrackSchema),
		});

	const [trackType, album] = watch(["type", "album"], {
		type: trackData.type,
		album: trackData.album?.name,
	});

	function handleKeyUp(e: KeyboardEvent): void {
		const key = e.key;
		if (key === "Enter") {
			handleSubmit(onSubmit)();
		}
	}

	function onSubmit(formData: UpdateTrackType) {
		startTransition(() => {
			setOptimisticTrackData(formData);
			onCancel();
			updateTrack(trackData, formData);
		});
	}

	useEffect(() => {
		if (isEditing) setFocus("name");
		document.addEventListener("keyup", handleKeyUp);

		return function cleanup() {
			document.removeEventListener("keyup", handleKeyUp);
		};
	}, [isEditing, handleKeyUp]);

	return (
		<form className={`${AdminTrackListStyle}`} onSubmit={handleSubmit(onSubmit)}>
			<FormInlineEditInput
				className="self-center text-base"
				{...register("name")}
				defaultValue={optimisticTrackData.name}
			/>
			<div className="self-center">
				<SelectorInput
					defaultValue={trackData.album?.name}
					menuData={menuData}
					setValue={setValue}
					value={album}
					{...register("album")}
				/>
			</div>
			<div className="space-y-2">
				{/* {radioData.map((data) => (
					<RadioItem
						key={data.value}
						label={data.label}
						isChecked={trackType === data.value}
						defaultChecked={optimisticTrackData.type === data.value}
						value={data.value}
						{...register("type")}
					/>
				))} */}
			</div>
			<div className="self-center justify-self-end">
				<Button
					className="aspect-square p-2"
					variant="lime"
					type="submit"
					rounded
				>
					<CheckIcon width={20} height={20} />
				</Button>
			</div>
		</form>
	);
}