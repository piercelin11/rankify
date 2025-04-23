import Button from "@/components/buttons/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

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
	return (
		<div className="mb-30 flex items-center justify-between gap-3">
			<Link href={`/artist/${artistId}/${type}/${prevData.id}`}>
				<Button variant="outline" type="button">
					<ChevronLeftIcon className="self-center" width={25} height={25} />
					<p className="text-left">{prevData.name}</p>
				</Button>
			</Link>
			<Link href={`/artist/${artistId}/${type}/${nextData.id}`}>
				<Button variant="outline" type="button">
					<p className="text-right">{nextData.name}</p>
					<ChevronRightIcon className="self-center" width={25} height={25} />
				</Button>
			</Link>
		</div>
	);
}
