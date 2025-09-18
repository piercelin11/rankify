import { cn } from "@/lib/utils";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

type SearchInputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

export default function SearchInput({ className, ...props }: SearchInputProps) {
    return (
        <div className="flex w-full items-center gap-2 rounded border  bg-neutral-950 px-3 py-2">
            <MagnifyingGlassIcon className="text-muted-foreground" width={20} height={20} />
            <input
                className={cn(
                    "bg-transparent w-full text-muted-foreground placeholder:text-muted-foreground focus:outline-none",
                    className
                )}
                autoComplete="off"
                {...props}
            />
        </div>
    );
}