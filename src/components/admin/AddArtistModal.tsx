"use client";

import React, { useState } from "react";
import SearchSection from "./SearchSection";
import SelectSection from "./SelectSection";

export default function AddArtistModal() {
	const [currentView, setCurrentView] = useState<"search" | "album">("search");
	const [selecteArtistId, setSelecteArtistId] = useState<string | null>(null);

	function handleClick(artistId: string) {
		setCurrentView("album");
		setSelecteArtistId(artistId);
	}

	return (
		<>
			{currentView === "album" && selecteArtistId ? (
				<SelectSection
					artistId={selecteArtistId}
					handleCancel={() => setCurrentView("search")}
					type="Artist"
				/>
			) : (
				<SearchSection handleClick={handleClick} />
			)}
		</>
	);
}
