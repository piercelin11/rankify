import useMediaQuery from "@/lib/hooks/useMediaQuery";


type DropdownContainerProps = {
	children: React.ReactNode;
	width: number;
};

export default function DropdownContainer({
	children,
	width,
}: DropdownContainerProps) {
	const isMobile = useMediaQuery("max", 640);
	return (
		<div
			className="relative select-none"
			style={{ width: isMobile ? "100%" : `${width}px` }}
		>
			{children}
		</div>
	);
}
