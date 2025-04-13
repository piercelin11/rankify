import { useEffect, useState } from "react";
import fetchSearchResults from "../spotify/fetchSearchResults";
import { SpotifyTypeMap } from "../spotify/fetchSearchResults";

export default function useSearchInput<T extends keyof SpotifyTypeMap>(
	searchFor: T,
	artistName?: string
) {
	const [inputValue, setinputValue] = useState<string>("");
	const [result, setResult] = useState<SpotifyTypeMap[T] | null>(null);
	const [isSearcing, setSearcing] = useState<boolean>(false);

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
			setSearcing(true);

			try {
				const data = await fetchSearchResults(
					`${artistName ? `artist:${artistName} ${searchFor}:${inputValue}` : inputValue}`,
					searchFor
				);
				setResult(data);
			} catch (error) {
				console.error("Failed to fetch artist data:", error);
				setResult(null);
			} finally {
				setSearcing(false);
			}
		}

		const timer = setTimeout(fetchData, 1000);
		return () => clearTimeout(timer);
	}, [inputValue]);


	return {
		inputValue,
		handleInput,
		result,
		isSearcing,
	};
}
