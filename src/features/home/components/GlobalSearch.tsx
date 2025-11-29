"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import searchArtistsAndAlbums from "@/features/home/actions/searchArtistsAndAlbums";
import type { SearchResultType } from "@/types/home";
import { PLACEHOLDER_PIC } from "@/constants/placeholder.constants";

export default function GlobalSearch() {
	const router = useRouter();
	const [inputValue, setInputValue] = useState("");
	const [results, setResults] = useState<SearchResultType | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Debounce 搜尋 + 🟢 Race Condition 防護
	useEffect(() => {
		if (!inputValue.trim()) {
			setResults(null);
			setIsOpen(false);
			return;
		}

		setIsSearching(true);
		const abortController = new AbortController(); // 🟢 用於取消過時的請求

		const timer = setTimeout(async () => {
			try {
				const data = await searchArtistsAndAlbums({ query: inputValue });

				// 🟢 只在請求未被取消時更新狀態
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
		}, 1000); // 1 秒 debounce

		return () => {
			clearTimeout(timer);
			abortController.abort(); // 🟢 清理時取消請求
		};
	}, [inputValue]);

	const handleNavigate = (
		type: "artist" | "album",
		id: string,
		artistId?: string,
	) => {
		setIsOpen(false);
		setInputValue("");

		if (type === "artist") {
			router.push(`/artist/${id}/my-stats`);
		} else if (artistId) {
			// ✅ 修正: 跳轉到正確的 Album 頁面
			router.push(`/artist/${artistId}/album/${id}`);
		}
	};

	const hasResults =
		results && (results.artists.length > 0 || results.albums.length > 0);

	return (
		<Popover open={isOpen && !!hasResults} onOpenChange={setIsOpen}>
			<div className="relative w-full">
				<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder="Search for artists or albums..."
					className="pl-9"
					autoComplete="off"
				/>
			</div>

			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] p-0"
				align="start"
				onOpenAutoFocus={(e) => e.preventDefault()}
			>
				<div className="max-h-[400px] overflow-y-auto">
					{/* Artists */}
					{results?.artists && results.artists.length > 0 && (
						<div className="p-2">
							<p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
								Artists
							</p>
							{results.artists.map((artist) => (
								<div
									key={artist.id}
									onClick={() => handleNavigate("artist", artist.id)}
									className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
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
								</div>
							))}
						</div>
					)}

					{/* Separator */}
					{results?.artists && results.artists.length > 0 && results?.albums && results.albums.length > 0 && (
						<Separator />
					)}

					{/* Albums */}
					{results?.albums && results.albums.length > 0 && (
						<div className="p-2">
							<p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
								Albums
							</p>
							{results.albums.map((album) => (
								<div
									key={album.id}
									onClick={() =>
										handleNavigate("album", album.id, album.artistId)
									}
									className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent"
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
								</div>
							))}
						</div>
					)}

					{/* No results */}
					{!isSearching && results && !hasResults && (
						<div className="p-4 text-center text-sm text-muted-foreground">
							No results found
						</div>
					)}

					{/* Loading - 🟢 避免閃爍 */}
					{isSearching && !results && (
						<div className="p-4 text-center text-sm text-muted-foreground">
							Searching...
						</div>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
