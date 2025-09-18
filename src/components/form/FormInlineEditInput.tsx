import { cn } from "@/lib/utils";



export default function FormInlineEditInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			className={cn(
				" bg-transparent py-1 focus:border-b focus:outline-none focus:text-foreground",
				className
			)}
			autoComplete="off"
			{...props}
		/>
	);
}

