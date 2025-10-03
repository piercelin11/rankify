'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { dateToLong } from '@/lib/utils/date.utils';
import type { ArtistRankingSession, ArtistViewType } from '@/types/artist';
import { CheckIcon, ChevronDownIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';

type Props = {
	artistId: string;
	currentSessionId: string | null;
	currentView: ArtistViewType;
	sessions: ArtistRankingSession[];
};

export default function HybridDataSourceControl({
	artistId,
	currentSessionId,
	currentView,
	sessions,
}: Props) {
	const router = useRouter();

	const currentSession = sessions.find(
		(session) => session.id === currentSessionId
	);

	return (
		<div className="flex gap-2">
			{/* Average 按鈕 */}
			<Button
				variant={!currentSessionId ? 'primary' : 'outline'}
				onClick={() => router.push(`/artist/${artistId}/my-stats?view=${currentView}`)}
			>
				Average
			</Button>

			{/* Snapshot 按鈕或下拉選單 */}
			{sessions.length === 0 ? (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" disabled>
								Snapshot
							</Button>
						</TooltipTrigger>
						<TooltipContent>尚無快照紀錄</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			) : (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={currentSessionId ? 'primary' : 'outline'}>
							{currentSession ? dateToLong(currentSession.createdAt) : 'Snapshot'}
							<ChevronDownIcon className="ml-1" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{sessions.map((session) => (
							<DropdownMenuItem
								key={session.id}
								onClick={() =>
									router.push(
										`/artist/${artistId}/my-stats/${session.id}?view=${currentView}`
									)
								}
							>
								<CheckIcon
									className={
										session.id === currentSessionId ? 'visible' : 'invisible'
									}
								/>
								{dateToLong(session.createdAt)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</div>
	);
}
