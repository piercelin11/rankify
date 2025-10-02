import { TrackData } from "@/types/data";
import { SorterStateType } from "@/types/schemas/sorter";
import { RankingResultData } from "../types";

export function convertResultToDraftState(
	results: RankingResultData[],
	originalState: SorterStateType
): SorterStateType {
	const trackNameToIndex = new Map<string, number>();
	originalState.namMember.forEach((name, index) => {
		trackNameToIndex.set(name, index);
	});

	const newLstMember = [...originalState.lstMember];
	const newParent = [...originalState.parent];
	const newEqual = [...originalState.equal];

	const orderedIndices = results.map((result) => {
		const index = trackNameToIndex.get(result.name);
		if (index === undefined) {
			throw new Error(`Track "${result.name}" not found in original state`);
		}
		return index;
	});

	newLstMember[0] = orderedIndices;

	results.forEach((result, resultIndex) => {
		const trackIndex = orderedIndices[resultIndex];
		newParent[trackIndex] = resultIndex;

		if (resultIndex < results.length - 1) {
			const currentRanking = result.ranking;
			const nextRanking = results[resultIndex + 1].ranking;

			if (currentRanking === nextRanking) {
				newEqual[trackIndex] = orderedIndices[resultIndex + 1];
			} else {
				newEqual[trackIndex] = trackIndex;
			}
		} else {
			newEqual[trackIndex] = trackIndex;
		}
	});

	return {
		...originalState,
		lstMember: newLstMember,
		parent: newParent,
		equal: newEqual,
		finishFlag: 1,
		percent: 100,
		currentLeftIndex: null,
		currentRightIndex: null,
	};
}

export function generateFinalResult(
	state: SorterStateType,
	tracks: TrackData[]
): RankingResultData[] {
	let rankingNum = 1;
	let sameRank = 1;
	const resultArray: RankingResultData[] = [];

	const trackMap = new Map(tracks.map((track) => [track.name, track]));

	for (let i = 0; i < state.namMember.length; i++) {
		const foundTrack = trackMap.get(state.namMember[state.lstMember[0][i]])!;

		resultArray.push({
			ranking: rankingNum,
			...foundTrack,
		});

		if (i < state.namMember.length - 1) {
			if (state.equal[state.lstMember[0][i]] === state.lstMember[0][i + 1]) {
				sameRank++;
			} else {
				rankingNum += sameRank;
				sameRank = 1;
			}
		}
	}

	return resultArray;
}