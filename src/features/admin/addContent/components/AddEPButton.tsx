"use client"

import ModalWrapper from "@/components/general/ModalWrapper";
import { useState } from "react";
import ContentSelectionForm from "./ContentSelectionForm";
import { AddButton } from "@/components/ui/Button";
import addAlbum from "@/features/admin/addContent/actions/addAlbum";

type AddEPButtonProps = {
    artistId: string;
};

export default function AddEPButton({ artistId }: AddEPButtonProps) {
    const [isOpen, setOpen] = useState(false);

    function handleSubmit(EPId: string[], token: string) {
        return addAlbum(artistId, EPId, "EP", token);
    }

    return (
        <>
            {isOpen && (
                <ModalWrapper setOpen={setOpen}>
                    <ContentSelectionForm
                        artistId={artistId}
                        onCancel={() => setOpen(false)}
                        type="EP"
                        submitAction={handleSubmit}
                    />
                </ModalWrapper>
            )}

            <AddButton variant="gray" onClick={() => setOpen(true)} />
        </>
    );
}
