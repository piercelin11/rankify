import { SorterProvider } from "@/contexts/SorterContext";
import { ReactNode } from "react";

type layoutProps = {
	children: ReactNode;
};

export default function layout({ children }: layoutProps) {
	return <SorterProvider>{children}</SorterProvider>;
}
