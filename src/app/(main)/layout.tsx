import SignOutButton from "@/components/auth/SignOutButton";
import LogoDisplay from "@/components/sidebar/LogoDisplay";
import SidebarLayout from "@/components/sidebar/SidebarLayout";
import Button from "@/components/ui/Button";
import { mainMenuData } from "@/config/menuData";
import Link from "next/link";
import { getUserSession } from "../../../auth";
import getLoggedArtists from "@/lib/database/user/getLoggedArtists";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const { id: userId } = await getUserSession();
	const loggedArtists = await getLoggedArtists({ userId });

	return (
		<SidebarLayout>
			<div className="flex h-full flex-col p-4">
				<div className="mb-6">
					<div className="py-5">
						<LogoDisplay />
					</div>
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

				<div className="flex-1 overflow-auto scrollbar-hidden">
					{loggedArtists.map((artist) => (
						<Link key={artist.id} href={`/artist/${artist.id}/overview`}>
							<div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-zinc-900">
								<img
									className="w-16 rounded-full"
									src={artist.img || "/pic/placeholder.jpg"}
									alt={artist.name}
								/>
								<div className="space-y-1">
									<p>{artist.name}</p>
									<p className="text-sm text-zinc-500">
										{artist.dates.length} logs
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
			<div>{children}</div>
		</SidebarLayout>
	);
}
