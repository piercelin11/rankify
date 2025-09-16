import { SegmentOption } from "@/components/navigation/SegmentControl";

export const OVERVIEW_SEGMENT_OPTIONS: SegmentOption[] = [
        {
            label: "My Overview",
            value: "my-overview",
            queryParam: ["scope", "global"],
        },
        {
            label: "Global Overview",
            value: "global-overview",
            queryParam: ["scope", "personal"],
        },
    ];