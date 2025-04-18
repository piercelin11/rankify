import useDominantColor from "@/lib/hooks/useDominantColor";
import { rgbToHex } from "@/lib/utils/adjustColor";
import Button from "@/components/ui/Button";
import { InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/cn";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { AlbumData } from "@/types/data";
import FormMessage from "@/components/form/FormMessage";
import Input from "@/components/ui/Input";

type AlbumColorSelectorProps = {
	data: AlbumData;
	mode: "text" | "radio";
	setMode: React.Dispatch<React.SetStateAction<"text" | "radio">>;
	message?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function AlbumColorSelector({
	data,
	mode,
	setMode,
	message,
	...props
}: AlbumColorSelectorProps) {
	const [selectedColor, setSelectedColor] = useState<string | null>(data.color);
	const [color] = useDominantColor(data.img!);
	const colorPalette = color?.colorPalette;

	const hexArray = [...new Set(colorPalette?.map((color) => rgbToHex(color)))];

	function handleClick(color: string) {
		setSelectedColor(color);
	}

	return (
		<div className="space-y-3">
			<p className="text-sm text-zinc-500">Album color</p>
			{mode === "radio" ? (
				<div className="flex gap-2">
					{hexArray?.map((color) => (
						<label
							key={color}
							htmlFor={color}
							className={cn("aspect-square w-10 rounded-full", {
								"border-2 border-zinc-200": selectedColor === color,
							})}
							style={{ backgroundColor: `${color}` }}
							onClick={() => handleClick(color)}
						>
							<input
								type="radio"
								id={color}
								value={color}
								className="hidden"
								defaultChecked={data.color === color}
								{...props}
							/>
						</label>
					))}
					<Button
						className="h-10 w-10 p-3"
						variant="gray"
						onClick={() => setMode("text")}
						rounded
					>
						<Pencil1Icon width={16} height={16} />
					</Button>
				</div>
			) : (
				<Input {...props} />
			)}
			{message && (
				<FormMessage message={message} isError={true} border={false} />
			)}
		</div>
	);
}
