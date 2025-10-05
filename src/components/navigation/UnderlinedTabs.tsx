"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type TabOption = {
  label: string;
  value: string;
};

type UnderlinedTabsProps = {
  options: TabOption[];
  value: string;
  className?: string;
};

export default function UnderlinedTabs({
  options,
  value,
  className,
}: UnderlinedTabsProps) {
  const router = useRouter();

  const handleTabClick = (newValue: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("view", newValue);
    router.push(currentUrl.toString(), { scroll: false });
  };

  return (
    <div className={cn("border-b", className)}>
      <div className="-mb-px flex" aria-label="Tabs">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleTabClick(option.value)}
            className={cn(
              "whitespace-nowrap border-b py-2 px-2 text-sm font-medium",
              option.value === value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-accent-foreground"
            )}
            aria-current={option.value === value ? "page" : undefined}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
