import getArtistById from "@/lib/data/getArtistById";
import { notFound } from "next/navigation";
import React from "react";
import SpotifyIcon from "../../../../../public/icon/SpotifyIcon";
import Link from "next/link";
import GalleryGridLayout from "@/components/latout/GalleryGridLayout";
import getAlbumByArtist from "@/lib/data/getAlbumByArtist";

export default async function AdminArtistPage({
	params,
}: {
	params: Promise<{ artistId: string }>;
}) {
	const { artistId } = await params;

	const artist = await getArtistById(artistId);
	const albums = await getAlbumByArtist(artistId);

	if (!artist) notFound();

	return (
		<>
			<div className="bg-zinc-900/50 p-14">
				<div className="flex items-center gap-6 pt-24">
					<img
						width={220}
						className="rounded-full"
						src={artist.img || undefined}
						alt={artist.name}
					/>
					<div>
						<h1>{artist.name}</h1>
						<p className="mb-4 text-lg text-zinc-500">
							{artist.spotifyFollowers} followers
						</p>
						<Link href={artist.spotifyUrl}>
							<SpotifyIcon size={30} />
						</Link>
					</div>
				</div>
			</div>
			<div className="p-14">
				<h2>Albums</h2>
				<GalleryGridLayout>
					{albums.map((album) => (
						<Link key={album.id} href={`/admin/album/${album.id}`}>
							<div className="rounded p-3 hover:bg-zinc-900">
								<img
									className="mb-4 rounded"
									src={album.img ?? undefined}
									alt={album.name}
								/>
								<p>{album.name}</p>
								<p className="text-sm text-zinc-400">Album</p>
							</div>
						</Link>
					))}
				</GalleryGridLayout>
			</div>
		</>
	);
}
