import { TrackData } from "@/types/data";
import { SorterStateType } from "@/types/schemas/sorter";

export default function initializeSorterState(tracks: TrackData[]): SorterStateType {
	const namMember = tracks.map((item) => item.name);
	const lstMember: number[][] = [];
	const parent: number[] = [];
	let n = 0;
	let totalSize = 0;

	// 原本的 initList 邏輯，完全相同
	lstMember[n] = [];
	for (let i = 0; i < namMember.length; i++) {
		lstMember[n][i] = i;
	}
	parent[n] = -1;
	n++;

	for (let i = 0; i < lstMember.length; i++) {
		if (lstMember[i].length >= 2) {
			const mid = Math.ceil(lstMember[i].length / 2);
			lstMember[n] = lstMember[i].slice(0, mid);
			totalSize += lstMember[n].length;
			parent[n] = i;
			n++;
			lstMember[n] = lstMember[i].slice(mid, lstMember[i].length);
			totalSize += lstMember[n].length;
			parent[n] = i;
			n++;
		}
	}

	const rec = new Array(namMember.length).fill(0);
	const equal = new Array(namMember.length + 1).fill(-1);

	const cmp1 = lstMember.length - 2;
	const cmp2 = lstMember.length - 1;

	// 取得初始比較對的索引
	const leftIndex = (cmp1 >= 0 && lstMember[cmp1] && lstMember[cmp1].length > 0) ? lstMember[cmp1][0] : null;
	const rightIndex = (cmp2 >= 0 && lstMember[cmp2] && lstMember[cmp2].length > 0) ? lstMember[cmp2][0] : null;

	return {
		lstMember,
		parent,
		equal,
		rec,
		cmp1,
		cmp2,
		head1: 0,
		head2: 0,
		nrec: 0,
		totalSize,
		finishSize: 0,
		finishFlag: 0,
		percent: 0,
		namMember,  // 保留向後相容
		currentLeftIndex: leftIndex,
		currentRightIndex: rightIndex,
		history: [],  // 初始化空的歷史記錄
	};
}