import React, { useEffect, useRef, useState } from "react";
import { Album } from "spotify-types";
import AlbumItem from "./AlbumItem";
import Button from "@/components/ui/Button";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import fetchArtistsAlbum from "@/lib/spotify/fetchArtistsAlbum";
import addArtist from "@/lib/action/admin/addArtist";
import FormMessage from "@/components/ui/FormMessage";
import addAlbum from "@/lib/action/admin/addAlbum";
import { AlbumData } from "@/types/data";
import { ActionResponse } from "@/types/action";

type AlbumSelectSectionProps = {
	artistId: string;
	handleCancel: () => void;
	savedAlbums?: AlbumData[];
};

export default function AlbumSelectSection({
	artistId,
	handleCancel,
	savedAlbums,
}: AlbumSelectSectionProps) {
	const [albums, setAlbums] = useState<Album[] | null>(null);
	const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
	const [message, setMessage] = useState<string | null>(null);
	const [isError, setError] = useState<boolean>(false);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isPending, setPending] = useState<boolean>(false);

	const timer = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		async function fetchaAlbums() {
			setLoading(true);
			try {
				const data = await fetchArtistsAlbum(artistId, 50, "album");
				if (savedAlbums) {
					const savedAlbumIds = savedAlbums.map((album) => album.id);
					setAlbums(
						data?.filter((item) => !savedAlbumIds.includes(item.id)) ?? null
					);
				} else setAlbums(data);
			} catch (error) {
				console.error("Failed to fetch album data:", error);
				setAlbums(null);
			} finally {
				setLoading(false);
			}
		}

		fetchaAlbums();

		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, [artistId]);

	function handleCheckboxClick(albumId: string) {
		setSelectedAlbums((prev) =>
			prev.includes(albumId)
				? prev.filter((id) => id !== albumId)
				: [...prev, albumId]
		);
	}

	async function handleAddArtist() {
		const response = await addArtist(artistId, selectedAlbums);
		handleResponse(response);
	}

	async function handleAddAlbum() {
		const response = await addAlbum(artistId, selectedAlbums);
		handleResponse(response);
	}

	function handleResponse(response: ActionResponse) {
		setMessage(response.message);
		if (response.success) setError(false);
		else setError(true);
	}

	async function handleSubmit() {
		setPending(true);
		try {
			if (!savedAlbums) await handleAddArtist();
			else {
				await handleAddAlbum();
				timer.current = setTimeout(handleCancel, 1000);
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== "NEXT_REDIRECT") {
					setError(true);
					setMessage("Someting went wrong.");
				}
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="mt-4">
			{isLoading ? (
				<LoadingAnimation />
			) : (
				<div className="space-y-8">
					<div className="relaive h-[500px] overflow-y-auto">
						{albums?.map((albumItem) => (
							<AlbumItem
								key={albumItem.id}
								data={albumItem}
								handleClick={handleCheckboxClick}
								checked={selectedAlbums.includes(albumItem.id)}
							/>
						))}
					</div>
					<div className="flex items-center gap-4">
						<Button
							variant="transparent"
							onClick={handleCancel}
							disabled={isPending || (!!message && !isError)}
						>
							Cancel
						</Button>
						<Button variant="lime" onClick={handleSubmit} disabled={isPending || (!!message && !isError)}>
							Add Album
						</Button>
						{isPending && (
							<div className="px-5">
								{" "}
								<LoadingAnimation />
							</div>
						)}
						{message && !isPending && (
							<FormMessage message={message} isError={isError} />
						)}
					</div>
				</div>
			)}
		</div>
	);
}
