export function getScoreLabel(score: number): string {
	if (score >= 550) return "masterpiece";
	if (score >= 400) return "classic";
	if (score >= 300) return "solid";
	return "mid";
}