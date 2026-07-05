import { cn } from "@/lib/utils";
import { TrackData } from "@/types/data";
import { PLACEHOLDER_PIC } from "@/constants";
import Image from "next/image";
import CustomAudioPlayer from "@/components/audio/CustomAudioPlayer";

type TrackBtnProps = {
	isPressed: boolean;
	isSelected?: boolean;
	onClick: () => void;
	data?: TrackData;
};

export default function TrackBtn({
	isPressed,
	isSelected,
	onClick,
	data,
}: TrackBtnProps) {
	return (
		<div
			role="button"
			tabIndex={0}
			className={cn(
				"col-span-2 row-span-1 flex cursor-pointer select-none gap-2 rounded-xl border bg-secondary p-2 outline-none transition-all duration-150 ease-out hover:bg-accent hover:shadow-lg sm:col-span-1 sm:row-span-2 sm:inline lg:p-5",
				{
					"scale-95 bg-accent shadow-md": isPressed,
					"border-green-500 bg-green-900/30": isSelected,
				}
			)}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick();
				}
			}}
		>
			<div className="relative aspect-square h-auto w-full rounded-lg">
				<Image src={data?.img || PLACEHOLDER_PIC} alt="cover" fill sizes="" />
				{data?.previewUrl && (
					<div className="absolute bottom-2 right-2">
						<CustomAudioPlayer key={data.id} id={data.id} previewUrl={data.previewUrl} />
					</div>
				)}
			</div>
			<div className="m-auto flex-1 space-y-1 sm:pb-6 sm:pt-8">
				<p className="line-clamp-1 text-lg font-semibold">{data?.name}</p>
				<p className="line-clamp-1 text-muted-foreground">
					{data?.album?.name || "Non-album track"}
				</p>
			</div>
		</div>
	);
}
