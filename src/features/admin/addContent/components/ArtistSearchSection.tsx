"use client";



import ArtistSearchResultItem from "./ArtistSearchResultItem";
import LoadingAnimation from "@/components/feedback/LoadingAnimation";
import useSearchInput from "@/features/admin/addContent/hooks/useSpotifySearch";
import SearchInput from "@/components/form/SearchInput";

type ArtistSearchingSectionProps = {
	handleClick: (artistId: string) => void;
};

export default function ArtistSearchSection({ handleClick }: ArtistSearchingSectionProps) {

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
