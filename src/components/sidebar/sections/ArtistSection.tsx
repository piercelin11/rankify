import Link from "next/link";
import Image from "next/image";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ArtistData } from "@/types/data";
import { PLACEHOLDER_PIC } from "@/constants";

interface ArtistSectionProps {
  artists: ArtistData[];
}

export function ArtistSection({ artists }: ArtistSectionProps) {
  if (artists.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent Artists</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {artists.map((artist) => (
            <SidebarMenuItem key={artist.id}>
              <SidebarMenuButton asChild tooltip={artist.name}>
                <Link href={`/artist/${artist.id}`}>
                  <div className="relative size-6 flex-shrink-0">
                    <Image
                      src={artist.img || PLACEHOLDER_PIC}
                      alt={artist.name}
                      fill
                      className="rounded-md object-cover"
                      sizes="24px"
                    />
                  </div>
                  <span className="truncate">{artist.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}