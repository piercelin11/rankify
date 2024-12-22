"use client";

import React, { useEffect, useState } from "react";
import { SearchInput } from "@/components/ui/Input";
import SearchResultItem from "./SearchResultItem";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import searchForArtist from "@/lib/spotify/searchForArtist";
import { SearchContent } from "spotify-types";

type SearchSectionProps = {
	handleClick: (artistId: string) => void;
};

export default function SearchSection({ handleClick }: SearchSectionProps) {
	const [inputValue, setinputValue] = useState<string>("");
	const [result, setResult] = useState<SearchContent | null>(null);
	const [isLoading, setLoading] = useState<boolean>(false);

	function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		setinputValue(value);
	}

	useEffect(() => {
		async function fetchData() {
			if (!inputValue.trim()) {
				setResult(null);
				return;
			}
			setLoading(true);

			try {
				const data = await searchForArtist(inputValue);
				setResult(data);
			} catch (error) {
				console.error("Failed to fetch artist data:", error);
				setResult(null);
			} finally {
				setLoading(false);
			}
		}

		const timer = setTimeout(fetchData, 1000);
		return () => clearTimeout(timer);
	}, [inputValue]);

	return (
		<div className="space-y-8">
			<SearchInput
				onChange={handleInput}
				value={inputValue}
				placeholder="search for artists"
				spellCheck={false}
			/>
			{isLoading && !result && <LoadingAnimation />}
			{result && (
				<div>
					{result.artists?.items.map((resultItem) => (
						<SearchResultItem
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
