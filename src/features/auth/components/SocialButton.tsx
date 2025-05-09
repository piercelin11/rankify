"use client";

import React from "react";
import Button from "@/components/buttons/Button";
import { GoogleIcon, SpotifyIcon } from "@/components/icons/LogoIcons";
import handleOath from "@/features/auth/actions/handleOath";

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
