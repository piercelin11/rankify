import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Lato } from "next/font/google";
import "./globals.css";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import Scroll from "@/components/ui/Scroll";
import StoreProvider from "@/components/general/StoreProvider";

const geistSans = Geist({
	variable: "--font-geist",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const lato = Lato({
	variable: "--font-lato",
	weight: ["100", "300", "400", "700", "900"],
	subsets: ["latin"],
});

const poppins = Poppins({
	variable: "--font-poppins",
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
		<html lang="en">
			<Scroll />
			<StoreProvider>
				<body
					className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${lato.variable} antialiased`}
				>
					{children}
				</body>
			</StoreProvider>
		</html>
	);
}
