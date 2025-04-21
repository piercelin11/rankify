import SidebarLayout from "@/components/layout/SidebarLayout";
import Button from "@/components/buttons/Button";
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

			<div>{children}</div>
		</SidebarLayout>
	);
}
