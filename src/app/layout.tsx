import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, /* Lato, Archivo, */ Raleway} from "next/font/google";
import "./globals.css";
import { ModalManager } from "@/components/modals/ModalManager";
import { ModalProvider } from "@/contexts";

const geistSans = Geist({
	variable: "--font-geist",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

/* const lato = Lato({
	variable: "--font-lato",
	weight: ["100", "300", "400", "700", "900"],
	subsets: ["latin"],
});

const archivo = Archivo({
	variable: "--font-archivo",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
}); */

const poppins = Poppins({
	variable: "--font-poppins",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	subsets: ["latin"],
});

const raleway = Raleway({
	variable: "--font-raleway",
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
						className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${raleway.variable} antialiased`}
					>
						{children}
						<ModalManager />
					</body>
				</ModalProvider>
		</html>
	);
}
