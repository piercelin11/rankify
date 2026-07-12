"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { AlbumPointsParams } from "../types";
import { DEFAULT_PARAMS } from "../calculateAlbumPoints.sandbox";

type ParamKey = keyof AlbumPointsParams;

type SliderField = {
	key: ParamKey;
	label: string;
	min: number;
	max: number;
	step: number;
	format?: (value: number) => string;
};

const FIELD_GROUPS: { title: string; fields: SliderField[] }[] = [
	{
		title: "Ranking curve",
		fields: [
			{
				key: "curveExponent",
				label: "Exponent (k)",
				min: 0.1,
				max: 5,
				step: 0.1,
			},
		],
	},
	{
		title: "Album length penalty (Bayesian shrinkage)",
		fields: [
			{ key: "penaltyTolerance", label: "Tolerance", min: 0, max: 5, step: 1 },
			{ key: "penaltyScale", label: "Scale", min: 0.5, max: 10, step: 0.5 },
			{
				key: "penaltySteepness",
				label: "Steepness",
				min: 0.1,
				max: 5,
				step: 0.1,
			},
		],
	},
	{
		title: "Trim percentile (Bar 4)",
		fields: [
			{
				key: "trimPercentile",
				label: "Keep top %",
				min: 0.1,
				max: 1,
				step: 0.05,
				format: (value) => `${Math.round(value * 100)}%`,
			},
		],
	},
];

type Props = {
	params: AlbumPointsParams;
	onChange: (params: AlbumPointsParams) => void;
};

export default function ParameterPanel({ params, onChange }: Props) {
	function setField(key: ParamKey, value: number) {
		onChange({ ...params, [key]: value });
	}

	return (
		<Card>
			<CardHeader className="flex-row items-center justify-between space-y-0">
				<CardTitle className="text-base">Formula parameters</CardTitle>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onChange(DEFAULT_PARAMS)}
				>
					Reset to default
				</Button>
			</CardHeader>
			<CardContent className="space-y-6">
				{FIELD_GROUPS.map((group, index) => (
					<div key={group.title} className="space-y-4">
						{index > 0 && <Separator />}
						<h4 className="text-sm font-semibold text-muted-foreground">
							{group.title}
						</h4>
						{group.title === "Ranking curve" && (
							<p className="text-xs text-muted-foreground">
								Score = 1000 × percentile^k. k=1 is linear; k&gt;1 sharpens
								the gap at the top (head competition, flat tail); k&lt;1
								flattens it.
							</p>
						)}
						{group.title === "Album length penalty (Bayesian shrinkage)" && (
							<p className="text-xs text-muted-foreground">
								Albums within Tolerance tracks of this artist&apos;s average
								album length are not penalized. Beyond that, Scale/Steepness
								control how strongly the score is pulled toward the
								artist&apos;s overall average.
							</p>
						)}
						{group.title === "Trim percentile (Bar 4)" && (
							<p className="text-xs text-muted-foreground">
								Only the top N% best-ranked tracks in an album count toward
								its average — the rest are dropped before scoring (Bar 4
								only).
							</p>
						)}
						<div className="grid grid-cols-2 gap-6 md:grid-cols-4">
							{group.fields.map((field) => {
								const value = params[field.key];
								const defaultValue = DEFAULT_PARAMS[field.key];
								const formatValue = field.format ?? String;
								return (
									<div key={field.key} className="space-y-2">
										<div className="flex items-center justify-between">
											<Label>{field.label}</Label>
											<span className="font-numeric text-sm text-muted-foreground">
												{formatValue(value)}
												{value !== defaultValue && (
													<span className="ml-1 text-xs">
														(default: {formatValue(defaultValue)})
													</span>
												)}
											</span>
										</div>
										<Slider
											value={[value]}
											min={field.min}
											max={field.max}
											step={field.step}
											onValueChange={([next]) => setField(field.key, next)}
										/>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
