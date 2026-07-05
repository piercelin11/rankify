"use client";

import { useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { useAudioPlayerState, useAudioPlayerActions } from "@/contexts";

type Props = {
	id: string;
	previewUrl: string;
};

export default function PreviewPlayButton({ id, previewUrl }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const { playingId } = useAudioPlayerState();
	const { play, stop } = useAudioPlayerActions();
	const isPlaying = playingId === id;

	function toggle() {
		const audio = audioRef.current;
		if (!audio) return;
		if (isPlaying) {
			audio.pause();
			stop(id);
		} else {
			audio.play();
			play(id);
		}
	}

	useEffect(() => {
		if (playingId !== id) {
			audioRef.current?.pause();
		}
	}, [playingId, id]);

	useEffect(() => {
		const audio = audioRef.current;
		return () => {
			audio?.pause();
			stop(id);
		};
	}, [id, stop]);

	return (
		<div className="flex items-center">
			<audio
				ref={audioRef}
				src={previewUrl}
				onEnded={() => stop(id)}
				preload="none"
			/>
			<button
				onClick={toggle}
				className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-accent"
				aria-label={isPlaying ? "Pause" : "Play"}
			>
				{isPlaying ? (
					<Pause size={13} fill="currentColor" />
				) : (
					<Play size={13} fill="currentColor" className="ml-0.5" />
				)}
			</button>
		</div>
	);
}
