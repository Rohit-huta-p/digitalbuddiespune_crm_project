"use client";

import { Button } from "@/components/ui/button";

const STATUSES = [
    { label: "All", value: "" },
    { label: "Open", value: "open" },
    { label: "Closed", value: "closed" },
] as const;

interface ProjectStatusFilterProps {
    value: string;
    onChange: (status: string) => void;
}

export function ProjectStatusFilter({
    value,
    onChange,
}: ProjectStatusFilterProps) {
    return (
        <div className="flex gap-1">
            {STATUSES.map((s) => (
                <Button
                    key={s.value}
                    variant={value === s.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs px-3 rounded-full"
                    onClick={() => onChange(s.value)}
                >
                    {s.label}
                </Button>
            ))}
        </div>
    );
}
