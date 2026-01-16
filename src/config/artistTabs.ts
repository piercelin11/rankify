export const getArtistTabOptions = (artistId: string) => [
	{
		id: "my-stats",
		label: "My Stats",
		href: `/artist/${artistId}`,
	},
	{
		id: "community",
		label: "Community",
		href: `/artist/${artistId}/community`,
	},
];