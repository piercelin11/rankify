export const getArtistTabOptions = (artistId: string) => [
	{
		id: "overview",
		label: "My Overview",
		href: `/artist/${artistId}/overview`,
	},
	{
		id: "history",
		label: "My History",
		href: `/artist/${artistId}/history`,
	},
	{
		id: "community",
		label: "Community",
		href: `/artist/${artistId}/community`,
	},
];