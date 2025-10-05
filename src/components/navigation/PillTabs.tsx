"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type TabOption = {
  label: string;
  value: string;
};

type PillTabsProps = {
  options: TabOption[];
  value: string;
  className?: string;
};

export default function PillTabs({ options, value, className }: PillTabsProps) {
  const router = useRouter();

  const handleTabClick = (newValue: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("view", newValue);
    router.push(currentUrl.toString(), { scroll: false });
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleTabClick(option.value)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            value === option.value
              ? "bg-foreground text-background"
              : "bg-secondary text-secondary-foreground hover:bg-accent"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}