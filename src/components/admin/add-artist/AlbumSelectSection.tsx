import React, { useEffect, useState, useTransition } from "react";
import { Album } from "spotify-types";
import AlbumItem from "./AlbumItem";
import Button from "@/components/ui/Button";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import fetchArtistsAlbum from "@/lib/spotify/fetchArtistsAlbum";
import addNewArtist from "@/lib/action/admin/addNewArtist";
import ErrorMessage from "@/components/ui/ErrorMessage";

type AlbumSelectSectionProps = {
	artistId: string;
	setCurrentView: React.Dispatch<React.SetStateAction<"search" | "album">>;
};

export default function AlbumSelectSection({
	artistId,
	setCurrentView,
}: AlbumSelectSectionProps) {
	const [albums, setAlbums] = useState<Album[] | null>(null);
	const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		async function fetchaAlbums() {
			setLoading(true);
			try {
				const data = await fetchArtistsAlbum(artistId, 50, "album");
				setAlbums(data);
			} catch (error) {
				console.error("Failed to fetch album data:", error);
				setAlbums(null);
			} finally {
				setLoading(false);
			}
		}

		fetchaAlbums();
	}, [artistId]);

	function handleCheckboxClick(albumId: string) {
		setSelectedAlbums((prev) =>
			prev.includes(albumId)
				? prev.filter((id) => id !== albumId)
				: [...prev, albumId]
		);
	}

	async function handleSubmit() {
		const response = await addNewArtist(artistId, selectedAlbums);
		if (response?.error) setError(response.error);
		else setError(null);
	}

	return (
		<div className="mt-4">
			{isLoading ? (
				<LoadingAnimation size="small" />
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
					<div className="flex gap-4">
						<Button
							variant="transparent"
							onClick={() => setCurrentView("search")}
						>
							Back
						</Button>
						<Button variant="lime" onClick={handleSubmit}>
							Add Album
						</Button>
						{error && <ErrorMessage message={error} />}
					</div>
				</div>
			)}
		</div>
	);
}
