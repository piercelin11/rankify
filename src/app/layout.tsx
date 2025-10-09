import type { Metadata } from "next";
import { Geist_Mono, Outfit, Inter } from "next/font/google";
import "./globals.css";
import { ModalManager } from "@/components/modals/ModalManager";
import { ModalProvider } from "@/contexts";

const serif = Geist_Mono({
	variable: "--font-serif",
	subsets: ["latin"],
});

const numeric = Outfit({
	variable: "--font-numeric",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
});

const sans = Inter({
	variable: "--font-sans",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Rankify",
	description:
		"Rankify - Discover, rank, and share your favorite songs effortlessly. Join a vibrant music-loving community to create personalized song rankings and explore trending tunes worldwide!",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<ModalProvider>
				<body
					className={`${serif.variable} ${sans.variable} ${numeric.variable} font-poppins antialiased`}
				>
					{children}
					<ModalManager />
				</body>
			</ModalProvider>
		</html>
	);
}
