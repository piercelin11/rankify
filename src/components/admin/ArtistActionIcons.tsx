"use client"

import React from "react";
import ActionIconsSection from "./ActionIcons";
import { ArtistData } from "@/types/data";
import EditArtistForm from "./EditArtistForm";

type ArtistActionIconsProps = {
    data: ArtistData;
};

export default function ArtistActionIcons({ data }: ArtistActionIconsProps) {
    return (
        <ActionIconsSection data={data} type="artist">
            {(setOpen) => <EditArtistForm data={data} setOpen={setOpen} />}
        </ActionIconsSection>
    );
}
