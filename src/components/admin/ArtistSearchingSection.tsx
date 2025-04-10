"use client";

import React from "react";
import { SearchInput } from "@/components/ui/Input";
import ArtistSearchResultItem from "./ArtistSearchResultItem";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import useSearchInput from "@/lib/hooks/useSearchInput";

type ArtistSearchingSectionProps = {
	handleClick: (artistId: string) => void;
};

export default function ArtistSearchingSection({ handleClick }: ArtistSearchingSectionProps) {

	const { inputValue, handleInput, result, isSearcing } = useSearchInput("artist");

	return (
		<div className="space-y-8">
			<SearchInput
				onChange={handleInput}
				value={inputValue}
				placeholder="search for artists"
				spellCheck={false}
			/>
			{isSearcing && !result && <LoadingAnimation />}
			{result && (
				<div>
					{result.map((resultItem) => (
						<ArtistSearchResultItem
							key={resultItem.id}
							data={resultItem}
							onClick={() => handleClick(resultItem.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
