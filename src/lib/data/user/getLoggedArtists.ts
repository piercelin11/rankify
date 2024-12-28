import { db } from "@/lib/prisma";

type getLoggedArtistsProps = {
	userId: string;
};

export default async function getLoggedArtists({userId}: getLoggedArtistsProps ) {

	const user = await db.user.findFirst({
		where: {
			id: userId,
		},
		include: {
			loggedArtists: true
		},
	});

    return user?.loggedArtists || [];
}
