import { SorterStateType } from "@/lib/schemas/sorter";

/**
 * 使用者選擇類型
 * -1: 選擇左邊選項
 *  0: 平手
 *  1: 選擇右邊選項
 */
type SortChoice = -1 | 0 | 1;

/**
 * 核心歸併排序演算法
 * 根據使用者選擇 (-1: 左優先, 0: 平手, 1: 右優先) 更新排序狀態
 * @param state - 當前排序狀態
 * @param flag - 使用者選擇
 * @returns 新的排序狀態 (immutable)
 * @example
 * ```typescript
 * const initialState = initializeSorterState(tracks);
 * const newState = processSortChoice(initialState, -1); // 選擇左邊
 * ```
 */
export function processSortChoice(
	state: SorterStateType,
	flag: SortChoice
): SorterStateType {
	// 深拷貝需要修改的部分
	const newState: SorterStateType = {
		...state,
		lstMember: state.lstMember.map((arr) => [...arr]),
		parent: [...state.parent],
		equal: [...state.equal],
		rec: [...state.rec],
		namMember: [...state.namMember],
		history: [...state.history],
	};

	// 原本 sortList 的邏輯，完全相同
	if (flag === -1) {
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp1][newState.head1];
		newState.head1++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else if (flag === 1) {
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp2][newState.head2];
		newState.head2++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp2][newState.head2];
			newState.head2++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else {
		// flag === 0 (平手)
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp1][newState.head1];
		newState.head1++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
		newState.equal[newState.rec[newState.nrec - 1]] =
			newState.lstMember[newState.cmp2][newState.head2];
		newState.rec[newState.nrec] =
			newState.lstMember[newState.cmp2][newState.head2];
		newState.head2++;
		newState.nrec++;
		newState.finishSize++;
		while (newState.equal[newState.rec[newState.nrec - 1]] !== -1) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp2][newState.head2];
			newState.head2++;
			newState.nrec++;
			newState.finishSize++;
		}
	}

	// 處理組別結束的情況
	if (
		newState.head1 < newState.lstMember[newState.cmp1].length &&
		newState.head2 === newState.lstMember[newState.cmp2].length
	) {
		while (newState.head1 < newState.lstMember[newState.cmp1].length) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp1][newState.head1];
			newState.head1++;
			newState.nrec++;
			newState.finishSize++;
		}
	} else if (
		newState.head1 === newState.lstMember[newState.cmp1].length &&
		newState.head2 < newState.lstMember[newState.cmp2].length
	) {
		while (newState.head2 < newState.lstMember[newState.cmp2].length) {
			newState.rec[newState.nrec] =
				newState.lstMember[newState.cmp2][newState.head2];
			newState.head2++;
			newState.nrec++;
			newState.finishSize++;
		}
	}

	// 合併完成的組別
	if (
		newState.head1 === newState.lstMember[newState.cmp1].length &&
		newState.head2 === newState.lstMember[newState.cmp2].length
	) {
		const totalLength =
			newState.lstMember[newState.cmp1].length +
			newState.lstMember[newState.cmp2].length;
		for (let i = 0; i < totalLength; i++) {
			newState.lstMember[newState.parent[newState.cmp1]][i] = newState.rec[i];
		}
		newState.lstMember.pop();
		newState.lstMember.pop();
		newState.cmp1 = newState.cmp1 - 2;
		newState.cmp2 = newState.cmp2 - 2;
		newState.head1 = 0;
		newState.head2 = 0;

		if (newState.head1 === 0 && newState.head2 === 0) {
			for (let i = 0; i < newState.namMember.length; i++) {
				newState.rec[i] = 0;
			}
			newState.nrec = 0;
		}
	}

	// 檢查是否完成或更新當前比較對
	if (newState.cmp1 < 0) {
		newState.percent = 100;
		newState.finishFlag = 1;
	} else {
		newState.percent = Math.floor(
			(newState.finishSize * 100) / newState.totalSize
		);

		// 更安全的索引取得方式
		const leftGroup = newState.lstMember[newState.cmp1];
		const rightGroup = newState.lstMember[newState.cmp2];

		newState.currentLeftIndex =
			leftGroup && newState.head1 < leftGroup.length
				? leftGroup[newState.head1]
				: null;

		newState.currentRightIndex =
			rightGroup && newState.head2 < rightGroup.length
				? rightGroup[newState.head2]
				: null;
	}

	return newState;
}
