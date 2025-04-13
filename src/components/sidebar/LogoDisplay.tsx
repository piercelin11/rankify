import { StitchesLogoIcon } from "@radix-ui/react-icons";
import React from "react";

export default function LogoDisplay() {
	return (
		<div className="flex items-center gap-2 p-4">
			<StitchesLogoIcon width={35} height={35} />
			<p className="text-xl font-semibold">rankify.fm</p>
		</div>
	);
}
