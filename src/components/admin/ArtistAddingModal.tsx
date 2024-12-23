"use client";

import React, { useState } from "react";
import ArtistSearchingSection from "./ArtistSearchingSection";
import SelectItemForm from "./SelectItemForm";

export default function ArtistAddingModal() {
	const [currentView, setCurrentView] = useState<"search" | "album">("search");
	const [selecteArtistId, setSelecteArtistId] = useState<string | null>(null);

	function handleClick(artistId: string) {
		setCurrentView("album");
		setSelecteArtistId(artistId);
	}

	return (
		<>
			{currentView === "album" && selecteArtistId ? (
				<SelectItemForm
					artistId={selecteArtistId}
					handleCancel={() => setCurrentView("search")}
					type="Album"
					actionType="addArtist"
				/>
			) : (
				<ArtistSearchingSection handleClick={handleClick} />
			)}
		</>
	);
}
