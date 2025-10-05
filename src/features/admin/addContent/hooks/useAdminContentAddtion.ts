"use client";

import { AppResponseType } from "@/types/response";
import { useEffect, useState } from "react";
import { Album, Artist } from "spotify-types";
import {
	ContentSubmitActionType,
	ContentType,
} from "../components/ContentSelectionForm";
import fetchArtistsAlbum from "@/lib/spotify/fetchArtistsAlbum";
import fetchArtist from "@/lib/spotify/fetchArtist";
import fetchSpotifyToken from "@/lib/spotify/fetchSpotifyToken";
import { useServerAction } from "@/lib/hooks/useServerAction";

export default function useAdminContentAddtion(
	type: ContentType,
	artistId: string,
	submitAction: ContentSubmitActionType,
) {
	const [albums, setAlbums] = useState<Album[] | null>(null);
	const [artist, setArtist] = useState<Artist | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [response, setResponse] = useState<AppResponseType | null>(null);
	const [isLoading, setLoading] = useState<boolean>(false);
	const { execute, isPending } = useServerAction(submitAction);

	useEffect(() => {
		async function fetchaDatas() {
			setLoading(true);
			try {
				if (type === "Album") {
					const data = await fetchArtistsAlbum(artistId, 20, "album");
					setAlbums(data);
				}
				const artist = await fetchArtist(artistId);
				setArtist(artist);
			} catch (error) {
				console.error("Failed to fetch album data:", error);
				setAlbums(null);
				setArtist(null);
			} finally {
				setLoading(false);
			}
		}

		fetchaDatas();
	}, [artistId, type]);

	function handleCheckboxClick(projectId: string) {
		setSelectedIds((prev) =>
			prev.includes(projectId)
				? prev.filter((id) => id !== projectId)
				: [...prev, projectId]
		);
	}

	async function handleSubmit() {
		const accessToken = await fetchSpotifyToken();
		const response = await execute(selectedIds, accessToken);
		setResponse(response);
	}

	return {
		albums,
		artist,
		selectedIds,
		response,
		isLoading,
		isPending,
		handleCheckboxClick,
		handleSubmit,
	};
}
