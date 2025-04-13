import ContentWrapper from "@/components/general/ContentWrapper";
import {
	SettingsSidebarWrapper,
} from "@/components/sidebar/SidebarWrapper";
import { settingsMenuData } from "@/config/menuData";
import Link from "next/link";

type SettingsLayoutProps = {
	children: React.ReactNode;
};

export default async function SettingsLayout({
	children,
}: SettingsLayoutProps) {
	return (
		<SettingsSidebarWrapper>
			<ContentWrapper>
				<div className="space-y-6">
					{settingsMenuData.map((menuItem) => (
						<Link
							className="block text-zinc-400 hover:text-zinc-100"
							key={menuItem.name}
							href={menuItem.link}
						>
							{menuItem.name}
						</Link>
					))}
				</div>
			</ContentWrapper>
			<ContentWrapper className="w-[800px]">{children}</ContentWrapper>
		</SettingsSidebarWrapper>
	);
}
