import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
	id: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export default function WeightToggle({ id, checked, onCheckedChange }: Props) {
	return (
		<div className="flex items-center gap-2">
			<Label htmlFor={id} className="text-sm text-muted-foreground">
				Unweighted
			</Label>
			<Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
			<Label htmlFor={id} className="text-sm text-muted-foreground">
				Weighted
			</Label>
		</div>
	);
}
