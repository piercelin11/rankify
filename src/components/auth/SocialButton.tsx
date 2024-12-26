"use client";

import React from "react";
import Button from "../ui/Button";
import { GoogleIcon, SpotifyIcon } from "../../../public/icon/LogoIcons";
import handleOath from "@/lib/action/auth/handleOath";

export default function SocialButton() {
	return (
		<div className="flex gap-4">
			<Button
				className="w-full justify-center"
				variant="outline"
				onClick={() => handleOath("google")}
			>
				<GoogleIcon size={27} />
			</Button>
			<Button
				className="w-full justify-center"
				variant="outline"
				onClick={() => console.log("Haven't setup yet.")}
			>
				<SpotifyIcon size={30} />
			</Button>
		</div>
	);
}
