import { cn } from "@/lib/utils";
import { ResponseType } from "@/types/response";
import {
	CheckCircledIcon,
	ExclamationTriangleIcon,
} from "@radix-ui/react-icons";


type ErrorMessageProps = {
	message: string;
	type: ResponseType;
	border?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function FormMessage({
	message,
	type,
	border = true,
	className,
}: ErrorMessageProps) {
	return (
		<div
			className={cn("flex items-center gap-1 rounded-xl text-xs", className, {
				"p-4": border,
				"border border-danger-500 bg-danger-700/10 text-danger-500":
					type === "error" && border,
				"border border-success-500 bg-success-700/10 text-success-500":
					type === "success" && border,
				"text-danger-600": type === "error" && !border,
				"text-success-600": type === "success" && !border,
			})}
		>
			{type === "error" ? <ExclamationTriangleIcon /> : <CheckCircledIcon />}
			<p>{message}</p>
		</div>
	);
}
