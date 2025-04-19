import SignOutButton from "@/features/auth/components/SignOutButton";
import SidebarWrapper from "@/components/sidebar/SidebarWrapper";
import Button from "@/components/ui/Button";
import { mainMenuData } from "@/config/menuData";
import Link from "next/link";
import { getUserSession } from "../../../auth";
import getLoggedArtists from "@/lib/database/user/getLoggedArtists";
import { LockClosedIcon } from "@radix-ui/react-icons";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default async function MainLayout({ children }: AdminLayoutProps) {
	const { id: userId, role } = await getUserSession();
	const loggedArtists = await getLoggedArtists({ userId });

	return (
		<SidebarWrapper>
			<div className="flex h-full flex-col p-4">
				<div className="mb-6">
					<div>
						{mainMenuData.map((item) => (
							<Link href={item.link} key={item.name}>
								<Button variant="menu">
									{item.icon()}
									{item.name}
								</Button>
							</Link>
						))}
						{role === "ADMIN" && (
							<Link href={"/admin/artist"}>
								<Button variant="menu">
									<LockClosedIcon />
									Admin
								</Button>
							</Link>
						)}
					</div>
					<SignOutButton />
				</div>

				<div className="flex-1 overflow-auto scrollbar-hidden hidden lg:block">
					{loggedArtists.map((artist) => (
						<Link key={artist.id} href={`/artist/${artist.id}/overview`}>
							<div className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-zinc-900">
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
			</div>
			<div>{children}</div>
		</SidebarWrapper>
	);
}
