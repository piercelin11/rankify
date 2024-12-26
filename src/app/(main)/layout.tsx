import SignOutButton from "@/components/auth/SignOutButton";
import LogoDisplay from "@/components/sidebar/LogoDisplay";
import SidebarLayout from "@/components/sidebar/SidebarLayout";
import Button from "@/components/ui/Button";
import { mainMenuData } from "@/config/menuData";
import Link from "next/link";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default function MainLayout({ children }: AdminLayoutProps) {
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

			<div>{children}</div>
		</SidebarLayout>
	);
}
