"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { fetchAlbumPreviewUrls } from "../actions/fetchAlbumPreviewUrls";

type Props = {
	albumId: string;
};

export default function FetchPreviewUrlsButton({ albumId }: Props) {
	const [isPending, startTransition] = useTransition();

	function handleClick() {
		startTransition(async () => {
			const result = await fetchAlbumPreviewUrls(albumId);
			alert(result.message);
		});
	}

	return (
		<Button variant="outline" onClick={handleClick} disabled={isPending}>
			{isPending ? "Fetching..." : "Fetch Preview URLs"}
		</Button>
	);
}
