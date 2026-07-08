import useDominantColor from "@/lib/hooks/useDominantColor";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil1Icon } from "@radix-ui/react-icons";
import FormMessage from "@/components/form/FormMessage";
import colorConvert from "color-convert";
import { Label } from "@/components/ui/label";
import { HexColorPicker } from "react-colorful";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type ColorSelectorProps = {
	data: { img: string | null };
	message?: string;
	value?: string;
	name?: string;
	onChange: (value: string) => void;
	onBlur: () => void;
};

export default function ColorSelector({
	data,
	message,
	onChange,
	onBlur,
	value,
	name,
}: ColorSelectorProps) {
	const [isRadio, setRadio] = useState(true);
	const [color] = useDominantColor(data.img!);
	const colorPalette = color?.colorPalette;

	const hexArray = [
		...new Set(colorPalette?.map((color) => `#${colorConvert.rgb.hex(color)}`)),
	];

	return (
		<div className="space-y-1">
			<Label className="text-neutral-200">Album Color</Label>
			<div className="flex items-center justify-between gap-2">
				{isRadio ? (
					<div className="flex flex-wrap gap-1">
						{hexArray?.map((colorOption) => (
							<label
								key={`${name}-${colorOption}`}
								htmlFor={`${name}-${colorOption}`}
								className={cn(
									"aspect-square w-8 rounded-full border  lg:w-10",
									{
										"border-2 border-neutral-200": value === colorOption,
									}
								)}
								style={{ backgroundColor: `${colorOption}` }}
							>
								<input
									type="radio"
									id={`${name}-${colorOption}`}
									value={colorOption}
									className="hidden"
									checked={value === colorOption}
									onChange={(e) => onChange(e.target.value)}
								/>
							</label>
						))}
					</div>
				) : (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="outline"
								className="flex items-center gap-2"
								onBlur={onBlur}
							>
								<span
									className="h-5 w-5 rounded-full border"
									style={{ backgroundColor: value || "#000000" }}
								/>
								<span>{value || "Pick a color"}</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto">
							<HexColorPicker
								color={value || "#000000"}
								onChange={onChange}
							/>
						</PopoverContent>
					</Popover>
				)}
				<Button
					className="h-10 w-10 p-3"
					type="button"
					variant="secondary"
					onClick={() => setRadio((prev) => !prev)}
				>
					<Pencil1Icon width={16} height={16} />
				</Button>
			</div>
			{message && (
				<FormMessage message={message} type="error" border={false} />
			)}
		</div>
	);
}
