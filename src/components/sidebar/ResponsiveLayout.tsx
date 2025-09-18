"use client";

import { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useMediaQuery from "@/lib/hooks/useMediaQuery";

interface ResponsiveLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function ResponsiveLayout({ sidebar, children }: ResponsiveLayoutProps) {
  const isMobile = useMediaQuery("max", 768);

  if (isMobile) {
    return <MobileLayout sidebar={sidebar}>{children}</MobileLayout>;
  }

  return <DesktopLayout sidebar={sidebar}>{children}</DesktopLayout>;
}

function DesktopLayout({ sidebar, children }: ResponsiveLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {sidebar}
      <main className="flex-1 overflow-auto min-w-0">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

function MobileLayout({ sidebar, children }: ResponsiveLayoutProps) {
  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed right-4 top-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          {sidebar}
        </SheetContent>
      </Sheet>
      <main className="flex-1 overflow-auto mobile">
        <div className=" mx-auto">
          {children}
        </div>
      </main>
    </>
  );
}