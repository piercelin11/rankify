"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useMemo,
	ReactNode,
} from "react";

const AudioPlayerStateContext = createContext<{
	playingId: string | null;
} | undefined>(undefined);

const AudioPlayerActionsContext = createContext<{
	play: (id: string) => void;
	stop: (id?: string) => void;
} | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
	const [playingId, setPlayingId] = useState<string | null>(null);

	const play = useCallback((id: string) => {
		setPlayingId(id);
	}, []);

	const stop = useCallback((id?: string) => {
		if (id === undefined) {
			setPlayingId(null);
			return;
		}
		setPlayingId((prev) => (prev === id ? null : prev));
	}, []);

	const actions = useMemo(() => ({ play, stop }), [play, stop]);

	const state = useMemo(() => ({ playingId }), [playingId]);

	return (
		<AudioPlayerActionsContext.Provider value={actions}>
			<AudioPlayerStateContext.Provider value={state}>
				{children}
			</AudioPlayerStateContext.Provider>
		</AudioPlayerActionsContext.Provider>
	);
}

export function useAudioPlayerState() {
	const context = useContext(AudioPlayerStateContext);
	if (context === undefined) {
		throw new Error(
			"useAudioPlayerState must be used within an AudioPlayerProvider"
		);
	}
	return context;
}

export function useAudioPlayerActions() {
	const context = useContext(AudioPlayerActionsContext);
	if (context === undefined) {
		throw new Error(
			"useAudioPlayerActions must be used within an AudioPlayerProvider"
		);
	}
	return context;
}
