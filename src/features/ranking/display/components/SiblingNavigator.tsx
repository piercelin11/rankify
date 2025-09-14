"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";

import { SCROLL_SESSION_KEY } from "../hooks/useListScroll";

export default function SiblingNavigator({
	type,
	prevData,
	nextData,
}: {
	type: "track" | "album";
	prevData: { id: string; name: string; artistId: string };
	nextData: { id: string; name: string; artistId: string };
}) {
	const artistId = prevData.artistId;
	function handleClick() {
		if (sessionStorage.getItem(SCROLL_SESSION_KEY))
			sessionStorage.removeItem(SCROLL_SESSION_KEY);
	}
	return (
		<div className="mb-30 flex items-center justify-between gap-3">
			<Link
				href={`/artist/${artistId}/${type}/${prevData.id}`}
				onClick={handleClick}
			>
				<Button variant="outline" type="button">
					<ChevronLeftIcon className="self-center" width={25} height={25} />
					<p className="text-left">{prevData.name}</p>
				</Button>
			</Link>
			<Link
				href={`/artist/${artistId}/${type}/${nextData.id}`}
				onClick={handleClick}
			>
				<Button variant="outline" type="button">
					<p className="text-right">{nextData.name}</p>
					<ChevronRightIcon className="self-center" width={25} height={25} />
				</Button>
			</Link>
		</div>
	);
}
