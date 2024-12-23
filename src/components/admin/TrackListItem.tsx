"use client";
import deleteItem from "@/lib/action/admin/deleteItem";
import { AlbumData, TrackData } from "@/types/data";
import { CheckIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import React, {
	startTransition,
	useEffect,
	useOptimistic,
	useState,
} from "react";
import { InlineEditInput } from "../ui/Input";
import Button from "../ui/Button";
import { useForm } from "react-hook-form";
import { updateTrackSchema, updateTrackType } from "@/types/schemas/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import FormMessage from "../form/FormMessage";
import updateTrack from "@/lib/action/admin/updateTrack";

type TrackListItemProps = {
	trackData: TrackData;
	savedAlbums: AlbumData[];
	number?: number;
};

const gridStyles = "grid grid-cols-[1fr,_1fr,_60px]";

export default function TrackListItem({
	trackData,
	savedAlbums,
	number,
}: TrackListItemProps) {
	const [isEditing, setEditing] = useState(false);
	const [optimisticTrackData, setOptimisticTrackData] = useOptimistic(
		{
			name: trackData.name,
			album: trackData.album?.name,
		},
		(_, newTrackData: updateTrackType) => {
			return newTrackData;
		}
	);

	const albumNames = savedAlbums.map((album) => album.name);

	const schema = updateTrackSchema(albumNames);
	const {
		register,
		setFocus,
		handleSubmit,
		formState: { errors },
	} = useForm<updateTrackType>({
		resolver: zodResolver(schema),
	});

	useEffect(() => {
		if (isEditing) setFocus("name");
	}, [isEditing]);

	function onSubmit(formData: updateTrackType) {
		startTransition(() => {
			setOptimisticTrackData(formData);
			setEditing(false);
			updateTrack(trackData, formData);
		});
	}

	return (
		<div
			key={trackData.id}
			className="grid cursor-pointer select-none grid-cols-[25px,_65px,_1fr] items-center gap-3 rounded px-6 py-2 hover:bg-zinc-900"
		>
			<p className="mr-2 justify-self-end font-serif text-lg font-medium text-zinc-500">
				{number || trackData.trackNumber}
			</p>
			<img
				className="rounded"
				src={trackData.img || undefined}
				alt={optimisticTrackData.name}
				width={65}
				height={65}
			/>
			{isEditing ? (
				<form
					className={`${gridStyles} gap-6`}
					onSubmit={handleSubmit(onSubmit)}
				>
					<InlineEditInput
						className="self-center"
						{...register("name")}
						defaultValue={optimisticTrackData.name}
					/>
					<div className="flex items-center gap-4">
						<InlineEditInput
							{...register("album")}
							className="flex-1 text-zinc-500"
							defaultValue={optimisticTrackData.album}
						/>
						{errors.album?.message && (
							<FormMessage message={errors.album.message} isError={true} />
						)}
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
			) : (
				<div className={`${gridStyles}`}>
					<p>{trackData.name}</p>
					<p className="text-zinc-500">{trackData.album?.name || "Single"}</p>
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
