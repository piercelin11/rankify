"use client";

import React, { useState } from "react";
import SearchSection from "./SearchSection";
import AlbumSelectSection from "./AlbumSelectSection";

export default function AddArtistaModal() {
	const [currentView, setCurrentView] = useState<"search" | "album">("search");
	const [selecteArtistId, setSelecteArtistId] = useState<string | null>(null);

	function handleClick(artistId: string) {
		setCurrentView("album");
		setSelecteArtistId(artistId);
	}

	return (
		<>
			{currentView === "album" && selecteArtistId ? (
				<AlbumSelectSection artistId={selecteArtistId} handleCancel={() => setCurrentView("search")}  />
			) : (
				<SearchSection handleClick={handleClick} />
			)}
		</>
	);
}
