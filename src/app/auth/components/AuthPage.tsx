import React from "react";
import Link from "next/link";
import SocialButton from "@/features/auth/components/SocialButton";

type AuthMode = "signin" | "signup";

type AuthPageProps = {
	mode: AuthMode;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const authConfig = {
	signin: {
		title: "Welcome back",
		description: "Sign in and ranked your favorite artist.",
		footer: {
			text: "Don't have an account yet?",
			linkText: "Sign up",
			href: "/auth/signup",
		},
	},
	signup: {
		title: "Join rankify.fm",
		description: "Sign up and ranked your favorite artist.",
		footer: {
			text: "Already have an account?",
			linkText: "Sign in",
			href: "/auth/signin",
		},
	},
};

export default async function AuthPage({
	mode,
	searchParams,
}: AuthPageProps) {
	const params = await searchParams;
	const callbackUrl =
		typeof params.callbackUrl === "string" ? params.callbackUrl : "/";
	const config = authConfig[mode];

	return (
		<div className="rounded-xl border p-24">
			<div className="space-y-10">
				<div>
					<h2 className="text-center">{config.title}</h2>
					<p className="text-description text-center">{config.description}</p>
				</div>

				<SocialButton callbackUrl={callbackUrl} />

				<p className="text-center text-secondary-foreground">
					{config.footer.text}{" "}
					<span className="text-foreground underline">
						<Link
							href={`${config.footer.href}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
						>
							{config.footer.linkText}
						</Link>
					</span>
				</p>
			</div>
		</div>
	);
}
