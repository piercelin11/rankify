import { db } from "@/db/client";
import {
	resolveAlbumPreviewUrls,
	findBestDirectMatchLoose,
	MatchOutcome,
} from "@/lib/itunes/resolveAlbumPreviewUrls";
import { fetchTrackPreviewDirect } from "@/lib/itunes/fetchPreviewUrl";

type TrackReport = {
	albumLabel: string;
	trackName: string;
	outcome: MatchOutcome;
};

async function processAlbum(
	album: {
		id: string;
		name: string;
		artist: { name: string };
		tracks: { id: string; name: string; previewUrl: string | null }[];
	},
	reports: TrackReport[]
) {
	const albumLabel = `${album.artist.name} / ${album.name}`;
	const tracksToWrite = album.tracks.filter((t) => !t.previewUrl);

	if (tracksToWrite.length === 0) {
		return;
	}

	// Phase 1/2 still benefit from seeing the full album tracklist (more
	// candidate collections to discover from), but only tracksToWrite get
	// written to the database.
	const result = await resolveAlbumPreviewUrls({
		albumId: album.id,
		albumName: album.name,
		artistName: album.artist.name,
		tracks: album.tracks,
	});

	console.log(`\n[${albumLabel}]  (${tracksToWrite.length}/${album.tracks.length} tracks missing)`);
	if (result.candidateCollections.length > 0) {
		console.log(
			`  candidates: ${result.candidateCollections
				.map((c) => `"${c.collectionName}" (${c.collectionId})`)
				.join(", ")}`
		);
	} else {
		console.log(`  candidates: none found in Phase 1 -> all tracks go to Phase 3`);
	}

	for (const track of tracksToWrite) {
		const newUrl = result.updates.get(track.id);
		const outcome = result.outcomes.get(track.id) ?? { kind: "unmatched" as const };

		await db.track.update({
			where: { id: track.id },
			data: { previewUrl: newUrl ?? null },
		});

		reports.push({ albumLabel, trackName: track.name, outcome });

		if (outcome.kind === "matched") {
			console.log(
				`  ${"✓"} ${track.name.padEnd(30)} via "${outcome.source}" score=${outcome.score.toFixed(2)}`
			);
		} else {
			const scoreLabel =
				outcome.bestScore !== undefined ? outcome.bestScore.toFixed(2) : "n/a";
			console.log(
				`  ${"✗"} ${track.name.padEnd(30)} no confident match (best score=${scoreLabel})`
			);
		}
	}
}

async function processStandaloneTracks(
	tracks: { id: string; name: string; artist: { name: string } }[],
	reports: TrackReport[]
) {
	if (tracks.length === 0) return;

	console.log(`\n[Standalone tracks without an album]  (${tracks.length} tracks)`);

	for (const track of tracks) {
		const direct = await fetchTrackPreviewDirect(track.name, track.artist.name);

		let outcome: MatchOutcome;
		let newUrl: string | null;

		if (direct.matched) {
			outcome = { kind: "matched", previewUrl: direct.previewUrl, source: "direct search", score: direct.score };
			newUrl = direct.previewUrl;
		} else {
			const loose = findBestDirectMatchLoose(track.name, direct.rawResults);
			if (loose) {
				outcome = { kind: "matched", previewUrl: loose.previewUrl, source: "direct search (loose)", score: loose.score };
				newUrl = loose.previewUrl;
			} else {
				outcome = { kind: "unmatched", bestScore: direct.bestScore };
				newUrl = null;
			}
		}

		await db.track.update({
			where: { id: track.id },
			data: { previewUrl: newUrl },
		});

		reports.push({ albumLabel: `${track.artist.name} / (no album)`, trackName: track.name, outcome });

		if (outcome.kind === "matched") {
			console.log(`  ${"✓"} ${track.name.padEnd(30)} score=${outcome.score.toFixed(2)}`);
		} else {
			console.log(`  ${"✗"} ${track.name.padEnd(30)} no confident match`);
		}
	}
}

function printSummary(reports: TrackReport[]) {
	let updated = 0;
	let stayedNull = 0;
	const borderlineCases: TrackReport[] = [];

	for (const report of reports) {
		if (report.outcome.kind === "matched") {
			updated++;
		} else {
			stayedNull++;
		}

		const score =
			report.outcome.kind === "matched" ? report.outcome.score : report.outcome.bestScore;
		if (score !== undefined && Math.abs(score - 0.85) <= 0.1) {
			borderlineCases.push(report);
		}
	}

	console.log("\n========== Summary ==========");
	console.log(`Total missing tracks processed: ${reports.length}`);
	console.log(`Updated (new match found): ${updated}`);
	console.log(`Stayed null (still no confident match): ${stayedNull}`);

	if (borderlineCases.length > 0) {
		console.log(`\nBorderline cases (score within 0.1 of threshold):`);
		borderlineCases.slice(0, 30).forEach((r) => {
			const score = r.outcome.kind === "matched" ? r.outcome.score : r.outcome.bestScore;
			console.log(`  - ${r.albumLabel} / ${r.trackName} — score ${score?.toFixed(2)}`);
		});
		if (borderlineCases.length > 30) {
			console.log(`  ... and ${borderlineCases.length - 30} more`);
		}
	}
}

async function backfillPreviewUrls() {
	const albums = await db.album.findMany({
		where: { tracks: { some: { previewUrl: null } } },
		include: {
			artist: true,
			tracks: {
				orderBy: [{ discNumber: { sort: "asc", nulls: "last" } }, { trackNumber: "asc" }],
			},
		},
		orderBy: [{ artistId: "asc" }, { name: "asc" }],
	});

	const standaloneTracks = await db.track.findMany({
		where: { albumId: null, previewUrl: null },
		include: { artist: true },
		orderBy: [{ artistId: "asc" }, { name: "asc" }],
	});

	const missingInAlbums = albums.reduce(
		(sum, a) => sum + a.tracks.filter((t) => !t.previewUrl).length,
		0
	);
	console.log(
		`Found ${missingInAlbums} missing tracks across ${albums.length} albums and ${standaloneTracks.length} standalone tracks. Starting...\n`
	);

	const reports: TrackReport[] = [];

	for (const album of albums) {
		await processAlbum(album, reports);
	}

	await processStandaloneTracks(standaloneTracks, reports);

	printSummary(reports);

	await db.$disconnect();
}

backfillPreviewUrls().catch((err) => {
	console.error("Script error:", err);
	db.$disconnect();
	process.exit(1);
});
