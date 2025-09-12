
import { CubeIcon } from "@radix-ui/react-icons";

export default function NoData() {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-3">
			<CubeIcon width={25} height={25} />
			<div>
				<p className="text-center font-medium">No Data</p>
				<p className="text-description text-center">No data available</p>
			</div>
		</div>
	);
}
