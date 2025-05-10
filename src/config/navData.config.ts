export const getArtistTabOptions = (artistId: string) => [
	{
		id:"overview",
		label: "My Overview",
		href: `/artist/${artistId}/overview`,
	},
	{
		id:"history",
		label: "Ranking History",
		href: `/artist/${artistId}/history`,
	},
];

export const getOverviewDropdownData = (artistId: string) => 
 [
	{	id: "past-month",
		label: "past month", 
		href: `/artist/${artistId}/overview/past-month`,
	},
	{
		id: "past-6-months",
		label: "past 6 months",
		href: `/artist/${artistId}/overview/past-6-months`,
	},
	{
		id: "past-year",
		label: "past year",
		href: `/artist/${artistId}/overview/past-year`,
	},
	{
		id: "past-2-years",
		label: "past 2 years",
		href: `/artist/${artistId}/overview/past-2-years`,
	},
	{
		id: "all-time",
		label: "all time",
		href: `/artist/${artistId}/overview/all-time`,
	},
];
