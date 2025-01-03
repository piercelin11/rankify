import LogoDisplay from "@/components/sidebar/LogoDisplay";
import SidebarLayout from "@/components/sidebar/SidebarLayout";
import Button from "@/components/ui/Button";
import { adminMenuData } from "@/config/menuData";
import {
	AvatarIcon,
	GearIcon,
	StarIcon,
	StitchesLogoIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";

type AdminLayoutProps = {
	children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<SidebarLayout>
			<div className="p-4">
				<div className="py-5">
					<LogoDisplay />
				</div>
				<div>
					{adminMenuData.map((item) => (
						<Link href={item.link} key={item.name}>
							<Button variant="menu">
								{item.icon()}
								{item.name}
							</Button>
						</Link>
					))}
				</div>
			</div>

			<div>{children}</div>
		</SidebarLayout>
	);
}
