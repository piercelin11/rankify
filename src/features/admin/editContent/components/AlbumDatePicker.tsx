import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import FormMessage from "@/components/form/FormMessage";
import { CalendarIcon } from "@radix-ui/react-icons";
import { dateToLong } from "@/lib/utils";

type AlbumDatePickerProps = {
	message?: string;
	value?: Date;
	name?: string;
	onChange: (date: Date) => void;
	onBlur: () => void;
};

export default function AlbumDatePicker({
	message,
	value,
	name,
	onChange,
	onBlur,
}: AlbumDatePickerProps) {
	return (
		<div className="space-y-1">
			<Label htmlFor={`releaseDate-${name}`} className="text-neutral-200">
				Release Date
			</Label>
			<Popover onOpenChange={(open) => !open && onBlur()}>
				<PopoverTrigger asChild>
					<Button
						id={`releaseDate-${name}`}
						type="button"
						variant="outline"
						className="w-full justify-start gap-2"
					>
						<CalendarIcon width={16} height={16} />
						{value ? dateToLong(value) : "Select a date"}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
						mode="single"
						captionLayout="dropdown"
						startMonth={new Date(1950, 0)}
						endMonth={new Date(new Date().getFullYear() + 1, 11)}
						selected={value}
						onSelect={(date) => date && onChange(date)}
						defaultMonth={value}
						autoFocus
					/>
				</PopoverContent>
			</Popover>
			{message && (
				<FormMessage message={message} type="error" border={false} />
			)}
		</div>
	);
}
