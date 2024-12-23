"use client"

import React from "react";
import ActionIconsSection from "./ActionIcons";
import EditAlbumForm from "./EditAlbumForm";
import { AlbumData } from "@/types/data";

type AlbumActionIconsProps = {
	data: AlbumData;
};

export default function AlbumActionIcons({ data }: AlbumActionIconsProps) {
	return (
		<ActionIconsSection data={data} type="album">
			{(setOpen) => <EditAlbumForm setOpen={setOpen} data={data} />}
		</ActionIconsSection>
	);
}
