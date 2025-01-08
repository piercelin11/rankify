import ContentWrapper from "@/components/general/ContentWrapper";
import {
	SettingsSidebarLayout,
} from "@/components/sidebar/SidebarLayout";
import { settingsMenuData } from "@/config/menuData";
import Link from "next/link";

type SettingsLayoutProps = {
	children: React.ReactNode;
};

export default async function SettingsLayout({
	children,
}: SettingsLayoutProps) {
	return (
		<SettingsSidebarLayout>
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
		</SettingsSidebarLayout>
	);
}
