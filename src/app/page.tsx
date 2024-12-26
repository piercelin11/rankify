import SidebarLayout from "@/components/sidebar/SidebarLayout";
import { auth } from "../../auth";
import LogoDisplay from "@/components/sidebar/LogoDisplay";
import { mainMenuData } from "@/config/menuData";
import Link from "next/link";
import Button from "@/components/ui/Button";
import SignOutButton from "@/components/auth/SignOutButton";

export default async function HomePage() {

	return (
		<SidebarLayout>
			<div className="p-4">
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

			<div>contents</div>
		</SidebarLayout>
	);
}
