"use client";

import React, { useState } from "react";
import ArtistSearchSection from "./ArtistSearchSection";
import ContentSelectionForm from "./ContentSelectionForm";
import addArtist from "@/features/admin/addContent/actions/addArtist";

export default function ArtistAddWizard() {
	const [currentView, setCurrentView] = useState<"search" | "album">("search");
	const [selecteArtistId, setSelecteArtistId] = useState<string | null>(null);

	function handleClick(artistId: string) {
		setCurrentView("album");
		setSelecteArtistId(artistId);
	}

	function handleSubmit(selectedIds: string[], accessToken: string) {
		return addArtist({
			artistId: selecteArtistId!,
			albumId: selectedIds,
			token: accessToken,
		});
	}

	return (
		<>
			{currentView === "album" && selecteArtistId ? (
				<ContentSelectionForm
					artistId={selecteArtistId}
					onCancel={() => setCurrentView("search")}
					type="Album"
					submitAction={handleSubmit}
				/>
			) : (
				<ArtistSearchSection handleClick={handleClick} />
			)}
		</>
	);
}
