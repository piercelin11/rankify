"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Props = {
	artists: { id: string; name: string }[];
	value: string;
	onChange: (artistId: string) => void;
};

export default function ArtistSelect({ artists, value, onChange }: Props) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className="w-[240px]">
				<SelectValue placeholder="Select artist" />
			</SelectTrigger>
			<SelectContent>
				{artists.map((artist) => (
					<SelectItem key={artist.id} value={artist.id}>
						{artist.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
