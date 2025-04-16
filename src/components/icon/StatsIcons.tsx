type StatsIconsProps = {
	size?: number;
} & React.SVGProps<SVGSVGElement>;

export function ArrowUpRoundIcon({ size, className }: StatsIconsProps) {
	return (
		<svg
			className={className}
			width={`${size}px`}
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor" 
		>
			<path d="M50.774.61c27.596 0 50.003 22.407 50.003 50.002 0 27.595-22.407 50.002-50.003 50.002C23.18 100.614.772 78.207.772 50.612.772 23.017 23.179.61 50.774.61zm4.305 78.697V38.394l18.289 18.304 6.086-6.086-28.68-28.679-28.694 28.68 6.086 6.085 18.303-18.304v40.913h8.61z" />
		</svg>
	);
}

export function ArrowDownRoundIcon({ size, className }: StatsIconsProps) {
	return (
		<svg
			className={className}
			width={`${size}px`}
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
		>
			<path d="M50.62 100.628C23.025 100.628.617 78.22.617 50.625S23.025.623 50.62.623s50.002 22.407 50.002 50.002c0 27.595-22.407 50.003-50.002 50.003zM46.315 21.93v40.912L28.026 44.54l-6.085 6.086 28.679 28.68 28.694-28.68-6.086-6.086-18.303 18.304V21.931h-8.61z" />
		</svg>
	);
}

export function RankUpIcon({ size, className }: StatsIconsProps) {
	return (
		<svg
			className={className}
			width={`${size}px`}
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
		>
			<path d="M50.952.9c27.595 0 50 22.405 50 49.998 0 27.593-22.405 49.998-50 49.998-27.596 0-50-22.405-50-49.998C.951 23.305 23.355.9 50.951.9zm0 19.158L25.482 71h50.94l-25.47-50.942z" />
		</svg>
	);
}

export function RankDownIcon({ size, className }: StatsIconsProps) {
	return (
		<svg
			className={className}
			width={`${size}px`}
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
		>
			<path d="M50.956 100.727c-27.596 0-50-22.406-50-49.998C.956 23.136 23.36.73 50.956.73s50 22.405 50 49.998c0 27.592-22.404 49.998-50 49.998zm0-19.158l25.47-50.942h-50.94l25.47 50.942z" />
		</svg>
	);
}

export function RankStableIcon({ size, className }: StatsIconsProps) {
	return (
		<svg
			className={className}
			width={`${size}px`}
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
		>
			<path d="M100.875 50.894c0 27.595-22.403 50.007-50 50.007-27.595 0-50-22.412-50-50.007C.876 23.3 23.28.898 50.876.898c27.597 0 50 22.402 50 49.996zm-21.44-7.04h-57.12v14.081h57.12V43.853z" />
		</svg>
	);
}

export function RankDebutIcon({ size, className }: StatsIconsProps) {
	return (
		<svg
			className={className}
			width={`${size}px`}
			viewBox="0 0 101 101"
			xmlns="http://www.w3.org/2000/svg"
			fill="currentColor"
		>
			<circle cx="50.5" cy="50.5" r="49.5" />
		</svg>
	);
}
