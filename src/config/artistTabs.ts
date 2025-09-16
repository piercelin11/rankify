export const getArtistTabOptions = (artistId: string) => [
	{
		id: "overview",
		label: "Overview",
		href: `/artist/${artistId}/overview`,
	},
	{
		id: "history",
		label: "My History",
		href: `/artist/${artistId}/history`,
	},
];