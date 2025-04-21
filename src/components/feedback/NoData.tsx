import React from "react";
import { Description } from "../typography/Text";
import { CubeIcon } from "@radix-ui/react-icons";

export default function NoData() {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-3">
			<CubeIcon width={25} height={25} />
			<div>
				<p className="text-center font-medium">No Data</p>
				<Description className="text-center">No data available</Description>
			</div>
		</div>
	);
}
