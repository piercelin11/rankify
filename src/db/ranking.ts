'use cache';

import { cacheLife, cacheTag } from 'next/cache';
import { $Enums } from '@prisma/client';
import { db } from './client';
import { CACHE_TIMES } from '@/constants/cache';
import { CACHE_TAGS } from '@/constants/cacheTags';

export async function getPeakRankings({
	peak,
	trackId,
	userId,
}: {
	peak: number;
	trackId: string;
	userId: string;
}) {
	cacheLife(CACHE_TIMES.LONG);
	cacheTag(CACHE_TAGS.TRACK(trackId));

	const peakRankings = await db.trackRanking.findMany({
		where: {
			trackId,
			rank: peak,
			userId,
		},
		include: {
			submission: {
				select: {
					createdAt: true,
				},
			},
		},
		orderBy: {
			submission: {
				createdAt: "asc",
			},
		},
	});

	return peakRankings.map((ranking) => ({
		...ranking,
		date: ranking.submission.createdAt,
		ranking: ranking.rank, // 保持向後相容的字段名
	}));
}

export async function getLatestArtistRankingSubmissions({
  artistId,
  userId,
}: {
  artistId: string;
  userId: string;
}) {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.RANKING(userId, artistId));

  const latestSubmission = await db.rankingSubmission.findFirst({
    where: {
      artistId,
      userId,
      type: 'ARTIST',
      status: 'COMPLETED',
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return latestSubmission
    ? {
        id: latestSubmission.id,
        date: latestSubmission.createdAt,
      }
    : null;
}

export async function getArtistRankingSubmissions({
  artistId,
  userId,
}: {
  artistId: string;
  userId: string;
}) {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.RANKING(userId, artistId));

  const submissions = await db.rankingSubmission.findMany({
    where: {
      artistId,
      userId,
      type: 'ARTIST',
      status: 'COMPLETED',
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return submissions.map((submission) => ({
    id: submission.id,
    date: submission.createdAt,
  }));
}

export async function getIncompleteRankingSubmission({
  artistId,
  userId,
  type = 'ARTIST',
  albumId,
}: {
  artistId: string;
  userId: string;
  type?: $Enums.SubmissionType;
  albumId?: string;
}) {
  cacheLife(CACHE_TIMES.LONG);
  cacheTag(CACHE_TAGS.RANKING(userId, artistId));

  const submissions = await db.rankingSubmission.findMany({
    where: {
      artistId,
      userId,
      type,
      status: { not: 'COMPLETED' },
      albumId,
    },
  });

  if (submissions.length > 1) {
    throw new Error(
      `Data integrity error: Found ${submissions.length} incomplete submissions for artist ${artistId}, expected 0 or 1`
    );
  }

  return submissions[0];
}
