import SignOutButton from "@/components/auth/SignOutButton";
import LogoDisplay from "@/components/sidebar/LogoDisplay";
import SidebarLayout from "@/components/sidebar/SidebarLayout";
import Button from "@/components/ui/Button";
import { mainMenuData } from "@/config/menuData";
import Link from "next/link";
import { auth } from "../../../auth";
import getLoggedArtists from "@/lib/data/user/getLoggedArtists";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const session = await auth();
	if (!session) return null;
	const userId = session.user.id;

	const loggedArtists = await getLoggedArtists({ userId });

	return (
		<SidebarLayout>
			<div className="p-4">
				<div className="mb-10">
					<LogoDisplay />
					<div>
						{mainMenuData.map((item) => (
							<Link href={item.link} key={item.name}>
								<Button variant="menu">
									{item.icon()}
									{item.name}
								</Button>
							</Link>
						))}
					</div>
					<SignOutButton />
				</div>
				{loggedArtists.map((artist) => (
					<Link key={artist.id} href={`/artist/${artist.id}/overview`}>
						<div className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-zinc-900">
							<img
								className="w-14 rounded-full"
								src={artist.img || "/pic/placeholder.jpg"}
								alt={artist.name}
							/>
							<p>{artist.name}</p>
						</div>
					</Link>
				))}
			</div>

			<div>{children}</div>
		</SidebarLayout>
	);
}
