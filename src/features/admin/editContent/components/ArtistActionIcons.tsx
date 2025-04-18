"use client"

import React from "react";
import ActionIconsSection from "./ActionIcons";
import { ArtistData } from "@/types/data";
import ArtistEditingForm from "./ArtistEditingForm";

type ArtistActionIconsProps = {
    data: ArtistData;
};

export default function ArtistActionIcons({ data }: ArtistActionIconsProps) {
    return (
        <ActionIconsSection data={data} type="artist">
            {(setOpen) => <ArtistEditingForm data={data} setOpen={setOpen} />}
        </ActionIconsSection>
    );
}
