import React, { useEffect, useRef, useState } from "react";
import { Album, Artist } from "spotify-types";
import SelectableItem from "./SelectableItem";
import Button from "@/components/ui/Button";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import fetchArtistsAlbum from "@/lib/spotify/fetchArtistsAlbum";
import addArtist from "@/lib/action/admin/addArtist";
import FormMessage from "@/components/ui/FormMessage";
import addAlbum from "@/lib/action/admin/addAlbum";
import { ActionResponse } from "@/types/action";
import { SearchInput } from "../ui/Input";
import useSearchInput from "@/lib/hooks/useSearchInput";
import fetchArtist from "@/lib/spotify/fetchArtist";
import addSingle from "@/lib/action/admin/addSingle";

type SelectSectionProps = {
	artistId: string;
	handleCancel: () => void;
	type: "Album" | "EP" | "Single" | "Artist";
};

export default function SelectSection({
	artistId,
	handleCancel,
	type,
}: SelectSectionProps) {
	const [albums, setAlbums] = useState<Album[] | null>(null);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [message, setMessage] = useState<string | null>(null);
	const [isError, setError] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isPending, setPending] = useState<boolean>(false);

	const timer = useRef<NodeJS.Timeout | null>(null);

	const isButtonDisabled = isPending || (!!message && !isError);
	const listItemType =
		type === "Album" || type === "Artist"
			? "Album"
			: type === "Single"
				? "Track"
				: "Single/EP";

	useEffect(() => {
		async function fetchaDatas() {
			setLoading(true);
			try {
				const data = await fetchArtistsAlbum(
					artistId,
					50,
					type === "Album" || type === "Artist" ? "album" : "single"
				);
				setAlbums(data);
				if (type !== "Artist") {
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

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [artistId]);

	function handleCheckboxClick(projectId: string) {
		setSelectedIds((prev) =>
			prev.includes(projectId)
				? prev.filter((id) => id !== projectId)
				: [...prev, projectId]
		);
	}

	function handleResponse(response: ActionResponse) {
		setMessage(response.message);
		if (response.success) setError(false);
		else setError(true);
	}

	async function handleSubmit() {
		setPending(true);
		try {
			if (type === "Artist") {
				const response = await addArtist(artistId, selectedIds);
				handleResponse(response);
			} else if (type === "Album" || type === "EP") {
				const response = await addAlbum(
					artistId,
					selectedIds,
					type === "EP" ? "EP" : "ALBUM"
				);
				handleResponse(response);
				if (response.success) timer.current = setTimeout(handleCancel, 1000);
			} else {
				const response = await addSingle(artistId, selectedIds);
				handleResponse(response);
				if (response.success) timer.current = setTimeout(handleCancel, 1000);
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setError(true);
					setMessage("Something went wrong.");
				}
			}
		} finally {
			setPending(false);
		}
	}

	const { inputValue, handleInput, result, isSearcing } = useSearchInput(
		type === "Single" ? "track" : "album",
		type !== "Artist" ? artist?.name : undefined
	);

	const searchResult =
		type === "Single"
			? result?.tracks?.items
			: result?.albums?.items.filter((item) => {
					if (type === "EP") return item.album_type === "single";
					else return item.album_type === "album";
				});

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
							{(searchResult || (type !== "Single" && albums) || []).map(
								(item) => (
									<SelectableItem
										key={item.id}
										data={item}
										handleClick={handleCheckboxClick}
										checked={selectedIds.includes(item.id)}
										type={listItemType}
									/>
								)
							)}
						</>
					)}
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button
					variant="transparent"
					onClick={handleCancel}
					disabled={isButtonDisabled}
				>
					Cancel
				</Button>
				<Button
					variant="lime"
					onClick={handleSubmit}
					disabled={isButtonDisabled}
				>
					Add {type === "Artist" ? "Album" : type}
				</Button>
				{isPending && (
					<div className="px-5">
						<LoadingAnimation />
					</div>
				)}
				{message && !isPending && (
					<FormMessage message={message} isError={isError} />
				)}
			</div>
		</div>
	);
}
