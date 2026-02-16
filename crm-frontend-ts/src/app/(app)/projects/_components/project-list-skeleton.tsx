"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProjectListSkeleton() {
    return (
        <div className="space-y-2 p-2">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-3/5" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-4/5" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-14" />
                    </div>
                </div>
            ))}
        </div>
    );
}
