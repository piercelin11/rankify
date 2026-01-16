"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dices } from "lucide-react";

type Album = {
	id: string;
	name: string;
};

type SurpriseMeButtonProps = {
	albums: Album[];
	artistId?: string;
};

export default function SurpriseMeButton({
	albums,
}: SurpriseMeButtonProps) {
	const router = useRouter();

	const handleSurpriseMe = () => {
		if (albums.length === 0) return;

		// Client-side 隨機選擇,避免 refetch
		const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
		router.push(`/sorter/album/${randomAlbum.id}`);
	};

	if (albums.length === 0) {
		return null;
	}

	return (
		<Button
			variant="outline"
			size="lg"
			onClick={handleSurpriseMe}
			className="w-full sm:w-auto"
		>
			<Dices className="h-4 w-4 mr-2" />
			Surprise Me
		</Button>
	);
}
