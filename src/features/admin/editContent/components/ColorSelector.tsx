import useDominantColor from "@/lib/hooks/useDominantColor";
import Button from "@/components/buttons/Button";
import { InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/cn";
import { Pencil1Icon } from "@radix-ui/react-icons";
import FormMessage from "@/components/form/FormMessage";
import { Input } from "@/components/form/FormInput";
import colorConvert from "color-convert";

type ColorSelectorProps = {
	data: { img: string | null };
	message?: string;
} & InputHTMLAttributes<HTMLInputElement>;

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
		<div className="space-y-4">
			<p className="text-sm text-neutral-500">Album color</p>
			<div className="flex items-center justify-between gap-2">
				{isRadio ? (
					<div className="flex flex-wrap gap-2">
						{hexArray?.map((colorOption) => (
							<label
								key={`${name}-${colorOption}`}
								htmlFor={`${name}-${colorOption}`}
								className={cn(
									"aspect-square w-10 rounded-full border border-neutral-800 lg:w-12",
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
									onChange={onChange}
								/>
							</label>
						))}
					</div>
				) : (
					<Input
						type="text"
						name={name}
						value={value || ""}
						onChange={onChange}
						onBlur={onBlur}
						placeholder="Hex color (#rrggbb) or name"
					/>
				)}
				<Button
					className="h-10 w-10 p-3"
					type="button"
					variant="secondary"
					onClick={() => setRadio((prev) => !prev)}
					rounded
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
