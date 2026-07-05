"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useAudioPlayerState, useAudioPlayerActions } from "@/contexts";

type Props = {
	id: string;
	previewUrl: string;
};

export default function CustomAudioPlayer({ id, previewUrl }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const { playingId } = useAudioPlayerState();
	const { play, stop } = useAudioPlayerActions();
	const isPlaying = playingId === id;
	const [progress, setProgress] = useState(0);

	function togglePlay() {
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

	function handleTimeUpdate() {
		const audio = audioRef.current;
		if (!audio || !audio.duration) return;
		setProgress((audio.currentTime / audio.duration) * 100);
	}

	function handleEnded() {
		stop(id);
		setProgress(0);
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

	const size = 72;
	const center = size / 2;
	const strokeWidth = size * (2.5 / 44);
	const radius = center - strokeWidth;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - progress / 100);
	const buttonSize = size * (32 / 44);
	const iconSize = size * (14 / 44);

	return (
		<div className="relative shrink-0 group" style={{ width: size, height: size }}>
			<audio
				ref={audioRef}
				src={previewUrl}
				onTimeUpdate={handleTimeUpdate}
				onEnded={handleEnded}
				preload="metadata"
			/>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				className="absolute inset-0 -rotate-90"
			>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					className="stroke-transparent"
				/>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					className="stroke-foreground transition-[stroke-dashoffset] duration-100 ease-linear"
				/>
			</svg>
			<button
				onClick={(e) => {
					e.stopPropagation();
					togglePlay();
				}}
				style={{ width: buttonSize, height: buttonSize }}
				className="absolute inset-0 m-auto flex items-center justify-center rounded-full bg-foreground text-background transition-colors group-hover:bg-primary"
				aria-label={isPlaying ? "Pause" : "Play"}
			>
				{isPlaying ? (
					<Pause size={iconSize} fill="currentColor" />
				) : (
					<Play size={iconSize} fill="currentColor" className="ml-0.5" />
				)}
			</button>
		</div>
	);
}
