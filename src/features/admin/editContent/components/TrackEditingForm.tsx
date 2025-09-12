import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlbumData, TrackData } from "@/types/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { $Enums } from "@prisma/client";
import { trackEditSchema, TrackEditFormData } from "../schemas/trackEditSchema";
import { useEffect } from "react";
import updateTrack from "../actions/updateTrack";

type TrackEditingFormProps = {
	track: TrackData;
	albums: AlbumData[];
	isOpen?: boolean;
	onClose: () => void;
	onOpenChange?: (open: boolean) => void;
	onUpdateTrack?: (trackId: string, updates: Partial<TrackData>) => void;
};

export default function TrackEditingForm({
	track,
	albums,
	onClose,
}: TrackEditingFormProps) {
	const form = useForm<TrackEditFormData>({
		resolver: zodResolver(trackEditSchema),
		defaultValues: {
			name: track.name,
			album: track.album?.name || "",
			trackNumber: track.trackNumber || 1,
			discNumber: track.discNumber || 1,
			type: track.type,
		},
	});

	// 重置表單當 track 變更或模態框打開時
	useEffect(() => {
		form.reset({
			name: track.name,
			album: track.album?.name || "",
			trackNumber: track.trackNumber || 1,
			discNumber: track.discNumber || 1,
			type: track.type,
		});
	}, [track, form]);

	const onSubmit = async (data: TrackEditFormData) => {
		const response = await updateTrack({
			originalData: track,
			formData: {
				name: data.name,
				album: data.album || "",
				trackNumber: data.trackNumber,
				discNumber: data.discNumber,
				type: data.type,
				color: track.color || undefined,
			},
		});
		if (response.type === "success") {
			onClose();
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			<hr />
			<div className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label
							htmlFor={`trackName-${track.id}`}
							className="text-neutral-200"
						>
							Track Name
						</Label>
						<Input
							id={`trackName-${track.id}`}
							{...form.register("name")}
							className="mt-1"
						/>
						{form.formState.errors.name && (
							<p className="mt-1 text-sm text-red-400">
								{form.formState.errors.name.message}
							</p>
						)}
					</div>
					<div>
						<Label htmlFor={`album-${track.id}`} className="text-neutral-200">
							Album
						</Label>
						<Select
							value={form.watch("album") || "no-album"}
							onValueChange={(value) =>
								form.setValue("album", value === "no-album" ? "" : value)
							}
						>
							<SelectTrigger
								id={`album-${track.id}`}
								className="mt-1 border-muted bg-neutral-900 text-white"
							>
								<SelectValue placeholder="Select album" />
							</SelectTrigger>
							<SelectContent className="border-muted bg-neutral-900">
								<SelectItem value="no-album">No album</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album.id} value={album.name}>
										{album.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-4">
					<div>
						<Label
							htmlFor={`trackNumber-${track.id}`}
							className="text-neutral-200"
						>
							Track #
						</Label>
						<Input
							id={`trackNumber-${track.id}`}
							type="number"
							{...form.register("trackNumber", { valueAsNumber: true })}
							className="mt-1"
						/>
						{form.formState.errors.trackNumber && (
							<p className="mt-1 text-sm text-red-400">
								{form.formState.errors.trackNumber.message}
							</p>
						)}
					</div>
					<div>
						<Label
							htmlFor={`discNumber-${track.id}`}
							className="text-neutral-200"
						>
							Disc #
						</Label>
						<Input
							id={`discNumber-${track.id}`}
							type="number"
							{...form.register("discNumber", { valueAsNumber: true })}
							className="mt-1"
						/>
						{form.formState.errors.discNumber && (
							<p className="mt-1 text-sm text-red-400">
								{form.formState.errors.discNumber.message}
							</p>
						)}
					</div>
					<div>
						<Label htmlFor={`type-${track.id}`} className="text-neutral-200">
							Type
						</Label>
						<Select
							value={form.watch("type")}
							onValueChange={(value) =>
								form.setValue("type", value as $Enums.TrackType)
							}
						>
							<SelectTrigger
								id={`type-${track.id}`}
								className="mt-1 border-muted bg-neutral-900 text-white"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="border-muted bg-neutral-900">
								{Object.values($Enums.TrackType).map((type) => (
									<SelectItem key={type} value={type}>
										{type}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</div>

			<div className="flex gap-3 pt-4">
				<Button type="submit" className="flex-1">
					Save Changes
				</Button>
				<Button
					type="button"
					variant="outline"
					onClick={onClose}
					className="flex-1 border-neutral-600 text-neutral-200 hover:bg-neutral-800"
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}
