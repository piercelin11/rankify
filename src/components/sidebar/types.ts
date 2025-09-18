import { ReactNode } from "react";
import { ExtendedUser } from "@/types/auth";
import { ArtistData } from "@/types/data";

export interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  action?: () => void;
  children?: MenuItem[];
}

export interface SidebarProps {
  user: ExtendedUser;
  artists: ArtistData[];
}