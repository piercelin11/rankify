import React, { useEffect, useState } from "react";
import { Album, Artist } from "spotify-types";
import SelectableItem from "./SelectableItem";
import Button from "@/components/ui/Button";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import fetchArtistsAlbum from "@/lib/spotify/fetchArtistsAlbum";
import addArtist from "@/lib/action/admin/addArtist";
import FormMessage from "@/components/form/FormMessage";
import addAlbum from "@/lib/action/admin/addAlbum";
import { ActionResponse } from "@/types/action";
import { SearchInput } from "../ui/Input";
import useSearchInput from "@/lib/hooks/useSearchInput";
import fetchArtist from "@/lib/spotify/fetchArtist";
import addSingle from "@/lib/action/admin/addSingle";
import fetchSpotifyToken from "@/lib/spotify/fetchSpotifyToken";

type SelectItemFormProps = {
	artistId: string;
	handleCancel: () => void;
	type: "Album" | "EP" | "Single";
	actionType?: "addArtist";
}; 

export default function SelectItemForm({
	artistId,
	handleCancel,
	type,
	actionType,
}: SelectItemFormProps) {
	const [albums, setAlbums] = useState<Album[] | null>(null);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [response, setResponse] = useState<ActionResponse | null>(null);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isPending, setPending] = useState<boolean>(false);

	useEffect(() => {
		async function fetchaDatas() {
			setLoading(true);
			try {
				const data = await fetchArtistsAlbum(
					artistId,
					50,
					type === "Album" ? "album" : "single"
				);
				setAlbums(data);
				if (actionType !== "addArtist") {
					const artist = await fetchArtist(artistId);
					setArtist(artist);
				}
			} catch (error) {
				console.error("Failed to fetch album data:", error);
				setAlbums(null);
			} finally {
				setLoading(false);
			}
		}

		fetchaDatas();
	}, [artistId]);

	function handleCheckboxClick(projectId: string) {
		setSelectedIds((prev) =>
			prev.includes(projectId)
				? prev.filter((id) => id !== projectId)
				: [...prev, projectId]
		);
	}

	async function handleSubmit() {
		const accessToken = await fetchSpotifyToken();
		setPending(true);
		try {
			if (actionType === "addArtist") {
				const response = await addArtist(artistId, selectedIds, accessToken);
				setResponse(response);
			} else if (type === "Album" || type === "EP") {
				const response = await addAlbum(
					artistId,
					selectedIds,
					type.toUpperCase() as "EP" | "ALBUM",
					accessToken
				);
				setResponse(response);
				if (response.success) handleCancel();
			} else {
				const response = await addSingle(artistId, selectedIds, accessToken);
				setResponse(response);
				if (response.success) handleCancel();
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setResponse({
						message: "Something went wrong.",
						success: false
					});
				}
			}
		} finally {
			setPending(false);
		}
	}

	const { inputValue, handleInput, result, isSearcing } = useSearchInput(
		type === "Single" ? "track" : "album",
		actionType !== "addArtist" ? artist?.name : undefined
	);

	return (
		<div className="mt-4 space-y-8">
			<SearchInput
				onChange={handleInput}
				value={inputValue}
				placeholder={`search for ${type.toLowerCase()}s`}
				spellCheck={false}
			/>

			<div className="space-y-8">
				<div className="relaive h-[500px] overflow-y-auto">
					{isLoading || isSearcing ? (
						<div className="flex h-full items-center justify-center">
							<LoadingAnimation />
						</div>
					) : (
						<>
							{(result || (type !== "Single" && albums) || []).map((item) => (
								<SelectableItem
									key={item.id}
									data={item}
									handleClick={handleCheckboxClick}
									checked={selectedIds.includes(item.id)}
									type={
										type === "Album"
											? "Album"
											: type === "Single"
												? "Track"
												: "Single/EP"
									}
								/>
							))}
						</>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button
					variant="outline"
					onClick={handleCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button
					variant="lime"
					onClick={handleSubmit}
					disabled={isPending}
				>
					Add {type}
				</Button>
				{isPending && (
					<div className="px-5">
						<LoadingAnimation />
					</div>
				)}
				{response && !isPending && (
					<FormMessage message={response.message} isError={!response.success} />
				)}
			</div>
		</div>
	);
}
