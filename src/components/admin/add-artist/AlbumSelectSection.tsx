import React, { useEffect, useState } from "react";
import { Album } from "spotify-api.js";
import AlbumItem from "./AlbumItem";
import Button from "@/components/ui/Button";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import getArtistsAlbum from "@/lib/spotify/getArtistsAlbum";
import getAlbumsTrack from "@/lib/spotify/getAlbumsTrack";

type AlbumSelectSectionProps = { artistId: string };

export default function AlbumSelectSection({
	artistId,
}: AlbumSelectSectionProps) {
	const [albums, setAlbums] = useState<Album[] | null>(null);
	const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
	const [isLoading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		async function fetchaAlbums() {
			setLoading(true);
			try {
				const data = await getArtistsAlbum(artistId, 50, "album");
				const tracks = await getAlbumsTrack();
				console.log(tracks)
				setAlbums(data.items as Album[]);
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

	function handleAddAlbum() {}

	return (
		<div className="mt-4 space-y-8">
			{isLoading ? (
				<LoadingAnimation size="small" />
			) : (
				<div className="relaive h-[500px] overflow-y-scroll">
					{albums?.map((albumItem) => (
						<AlbumItem
							key={albumItem.id}
							data={albumItem}
							handleClick={handleCheckboxClick}
							checked={selectedAlbums.includes(albumItem.id)}
						/>
					))}
				</div>
			)}
			<div className="flex gap-2">
				<Button variant="transparent">
					Add Album
					<ChevronRightIcon width={20} height={20} />
				</Button>
			</div>
		</div>
	);
}
