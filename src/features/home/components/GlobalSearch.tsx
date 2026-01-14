"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import searchArtistsAndAlbums from "@/features/home/actions/searchArtistsAndAlbums";
import type { SearchResultType } from "@/types/home";
import { PLACEHOLDER_PIC } from "@/constants/placeholder.constants";

export default function GlobalSearch() {
	const router = useRouter();
	const [inputValue, setInputValue] = useState("");
	const [results, setResults] = useState<SearchResultType | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (!inputValue.trim()) {
			setResults(null);
			setIsOpen(false);
			return;
		}

		setIsSearching(true);
		const abortController = new AbortController(); // 用於取消過時的請求

		const timer = setTimeout(async () => {
			try {
				const data = await searchArtistsAndAlbums({ query: inputValue });

				// 只在請求未被取消時更新狀態
				if (!abortController.signal.aborted) {
					setResults(data);
					setIsOpen(true);
				}
			} catch (error) {
				if (!abortController.signal.aborted) {
					console.error("Search error:", error);
					setResults(null);
				}
			} finally {
				if (!abortController.signal.aborted) {
					setIsSearching(false);
				}
			}
		}, 500);

		return () => {
			clearTimeout(timer);
			abortController.abort();
		};
	}, [inputValue]);

	function handleNavigate(
		type: "artist" | "album",
		id: string,
		artistId?: string
	) {
		setIsOpen(false);
		setInputValue("");

		if (type === "artist") {
			router.push(`/artist/${id}`);
		} else if (artistId) {
			router.push(`/artist/${artistId}/album/${id}`);
		}
	}

	const hasResults =
		results && (results.artists.length > 0 || results.albums.length > 0);

	return (
		<Command
			shouldFilter={false}
			loop
			className="relative overflow-visible rounded-lg border"
		>
			<CommandInput
				value={inputValue}
				onValueChange={setInputValue}
				placeholder="Search for artists or albums..."
				className="border-none"
			/>

			<CommandList
				className={`absolute top-full z-50 mt-1 max-h-[300px] w-full overflow-y-auto rounded-md border bg-popover shadow-md ${
					isOpen && !!hasResults ? "block" : "hidden"
				}`}
			>
				{/* Loading */}
				{isSearching && !results && (
					<div className="p-4 text-center text-sm text-muted-foreground">
						Searching...
					</div>
				)}

				{/* No results */}
				{!isSearching && results && !hasResults && (
					<CommandEmpty>No results found</CommandEmpty>
				)}

				{/* Artists */}
				{results?.artists && results.artists.length > 0 && (
					<CommandGroup heading="Artists">
						{results.artists.map((artist) => (
							<CommandItem
								key={artist.id}
								value={`artist-${artist.id}`}
								onSelect={() => handleNavigate("artist", artist.id)}
								className="flex cursor-pointer items-center gap-3"
							>
								<Image
									src={artist.img || PLACEHOLDER_PIC}
									alt={artist.name}
									width={40}
									height={40}
									className="rounded-full"
								/>
								<div>
									<p className="font-medium">{artist.name}</p>
									<p className="text-xs text-muted-foreground">Artist</p>
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				)}

				{/* Separator */}
				{results?.artists &&
					results.artists.length > 0 &&
					results?.albums &&
					results.albums.length > 0 && <CommandSeparator />}

				{/* Albums */}
				{results?.albums && results.albums.length > 0 && (
					<CommandGroup heading="Albums">
						{results.albums.map((album) => (
							<CommandItem
								key={album.id}
								value={`album-${album.id}`}
								onSelect={() =>
									handleNavigate("album", album.id, album.artistId)
								}
								className="flex cursor-pointer items-center gap-3"
							>
								<Image
									src={album.img || PLACEHOLDER_PIC}
									alt={album.name}
									width={40}
									height={40}
									className="rounded-lg"
								/>
								<div className="overflow-hidden">
									<p className="truncate font-medium">{album.name}</p>
									<p className="truncate text-xs text-muted-foreground">
										{album.artistName}
									</p>
								</div>
							</CommandItem>
						))}
					</CommandGroup>
				)}
			</CommandList>
		</Command>
	);
}
