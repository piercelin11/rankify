"use client"

import React from "react";
import ActionIconsSection from "./ActionIcons";
import AlbumEditingForm from "./AlbumEditingForm";
import { AlbumData } from "@/types/data";

type AlbumActionIconsProps = {
	data: AlbumData;
};

export default function AlbumActionIcons({ data }: AlbumActionIconsProps) {
	return (
		<ActionIconsSection data={data} type="album">
			{(setOpen) => <AlbumEditingForm setOpen={setOpen} data={data} />}
		</ActionIconsSection>
	);
}
