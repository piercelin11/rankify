import { Info } from "lucide-react";
import Tooltip from "./Tooltip";

type Props = {
	content: string | React.ReactNode;
};

export default function InfoTooltip({ content }: Props) {
	return (
		<Tooltip content={content}>
			<Info className="h-4 w-4 text-muted-foreground" />
		</Tooltip>
	);
}
