"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";

type Props = {
	previewUrl: string;
};

export default function CustomAudioPlayer({ previewUrl }: Props) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);

	function togglePlay() {
		const audio = audioRef.current;
		if (!audio) return;
		if (isPlaying) {
			audio.pause();
		} else {
			audio.play();
		}
		setIsPlaying(!isPlaying);
	}

	function handleTimeUpdate() {
		const audio = audioRef.current;
		if (!audio || !audio.duration) return;
		setProgress((audio.currentTime / audio.duration) * 100);
	}

	function handleEnded() {
		setIsPlaying(false);
		setProgress(0);
	}

	useEffect(() => {
		const audio = audioRef.current;
		return () => {
			audio?.pause();
		};
	}, []);

	const size = 44;
	const center = size / 2;
	const radius = 20;
	const circumference = 2 * Math.PI * radius;
	const dashOffset = circumference * (1 - progress / 100);

	return (
		<div className="relative h-11 w-11 shrink-0">
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
					strokeWidth={2.5}
					className="stroke-muted"
				/>
				<circle
					cx={center}
					cy={center}
					r={radius}
					fill="none"
					strokeWidth={2.5}
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
				className="absolute inset-0 m-auto flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-colors hover:opacity-80"
				aria-label={isPlaying ? "Pause" : "Play"}
			>
				{isPlaying ? (
					<Pause size={14} fill="currentColor" />
				) : (
					<Play size={14} fill="currentColor" className="ml-0.5" />
				)}
			</button>
		</div>
	);
}
