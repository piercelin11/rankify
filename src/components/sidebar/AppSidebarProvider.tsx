"use client";

import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/sidebarSlice";

interface AppSidebarProviderProps {
  children: React.ReactNode;
}

export function AppSidebarProvider({ children }: AppSidebarProviderProps) {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.sidebar.isSidebarOpen);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open !== isSidebarOpen) {
        dispatch(toggleSidebar());
      }
    },
    [dispatch, isSidebarOpen]
  );

  return (
    <SidebarProvider
      open={isSidebarOpen}
      onOpenChange={handleOpenChange}
      defaultOpen={true}
    >
      {children}
    </SidebarProvider>
  );
}