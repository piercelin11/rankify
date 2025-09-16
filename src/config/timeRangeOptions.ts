import { SimpleDropdownOption } from "@/components/dropdown/SimpleDropdown";

export const TIME_RANGE_OPTIONS: SimpleDropdownOption[] = [
	{
		value: "past-month",
		label: "past month",
		queryParam: ["range", "past-month"],
	},
	{
		value: "past-6-months",
		label: "past 6 months",
		queryParam: ["range", "past-6-months"],
	},
	{
		value: "past-year",
		label: "past year",
		queryParam: ["range", "past-year"],
	},
	{
		value: "past-2-years",
		label: "past 2 years",
		queryParam: ["range", "past-2-years"],
	},
	{
		value: "all-time",
		label: "all time",
		queryParam: ["range", "all-time"],
	},
];