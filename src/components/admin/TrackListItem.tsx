"use client";
import deleteItem from "@/lib/action/admin/deleteItem";
import { AlbumData, TrackData } from "@/types/data";
import {
	ArrowTopRightIcon,
	CheckIcon,
	Pencil1Icon,
	TrashIcon,
} from "@radix-ui/react-icons";
import React, {
	Dispatch,
	HTMLAttributes,
	SetStateAction,
	startTransition,
	useEffect,
	useOptimistic,
	useState,
} from "react";
import { InlineEditInput } from "../ui/Input";
import Button from "../ui/Button";
import { useForm } from "react-hook-form";
import { updateTrackSchema, UpdateTrackType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import FormMessage from "../form/FormMessage";
import updateTrack from "@/lib/action/admin/updateTrack";
import { cn } from "@/lib/cn";
import RadioItem from "../form/RadioItem";
import SelectorInput from "../form/SelectorInput";

type TrackListItemProps = {
	trackData: TrackData;
	albums: AlbumData[];
	number?: number;
} & HTMLAttributes<HTMLDivElement>;

const gridStyles = "grid grid-cols-[2fr,_2fr,_1fr,_60px] gap-10";

export default function TrackListItem({
	trackData,
	albums,
	number,
	className,
	...props
}: TrackListItemProps) {
	const [isEditing, setEditing] = useState(false);

	return (
			<div
				className={cn(
					"grid cursor-pointer select-none grid-cols-[25px,_65px,_1fr] items-center gap-3 rounded bg-zinc-950 px-6 py-2 hover:bg-zinc-900",
					className,
				)}
				{...props}
			>
				<p className="mr-2 justify-self-end font-serif text-lg font-medium text-zinc-500">
					{number || trackData.trackNumber}
				</p>
				<img
					className="rounded"
					src={trackData.img || undefined}
					alt={trackData.name}
					width={65}
					height={65}
				/>
				{isEditing ? (
					<TrackListForm
						trackData={trackData}
						albums={albums}
						isEditing={isEditing}
						setEditing={setEditing}
					/>
				) : (
					<div className={`${gridStyles}`}>
						<p onClick={() => setEditing(true)}>{trackData.name}</p>
						<p onClick={() => setEditing(true)} className="text-zinc-500">
							{trackData.album?.name || "Non-album track"}
						</p>
						<p onClick={() => setEditing(true)} className="text-zinc-500">
							{trackData.type}
						</p>

						<div className="flex items-center justify-between justify-self-stretch">
							<Pencil1Icon
								onClick={() => setEditing(true)}
								className="text-zinc-400 hover:text-zinc-100"
								width={18}
								height={18}
							/>
							<TrashIcon
								onClick={() => deleteItem("track", trackData.id)}
								className="text-zinc-400 hover:text-zinc-100"
								width={20}
								height={20}
							/>
						</div>
					</div>
				)}
			</div>
	);
}

type TrackListFormProps = {
	trackData: TrackData;
	albums: AlbumData[];
	isEditing: boolean;
	setEditing: Dispatch<SetStateAction<boolean>>;
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

function TrackListForm({
	albums,
	trackData,
	isEditing,
	setEditing,
}: TrackListFormProps) {
	const menuData = albums.map((album) => ({
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
			setEditing(false);
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
		<form className={`${gridStyles}`} onSubmit={handleSubmit(onSubmit)}>
			<InlineEditInput
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
				{radioData.map((data) => (
					<RadioItem
						key={data.value}
						label={data.label}
						isChecked={trackType === data.value}
						defaultChecked={optimisticTrackData.type === data.value}
						value={data.value}
						{...register("type")}
					/>
				))}
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
