import { cn } from "@/lib/utils";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

type SearchInputProps = {} & React.InputHTMLAttributes<HTMLInputElement>;

export default function SearchInput({ className, ...props }: SearchInputProps) {
    return (
        <div className="flex w-2/3 items-center gap-2 rounded border border-neutral-700 bg-neutral-950 px-3 py-2">
            <MagnifyingGlassIcon className="text-neutral-500" width={20} height={20} />
            <input
                className={cn(
                    "bg-transparent w-full text-neutral-500 placeholder:text-neutral-500 focus:outline-none",
                    className
                )}
                autoComplete="off"
                {...props}
            />
        </div>
    );
}