"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProjectWorkspaceSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {/* Tab header skeleton */}
            <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-md" />
                ))}
            </div>
            {/* Content skeleton */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-2/5" />
                <Skeleton className="h-4 w-3/5" />
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-24 rounded-lg" />
                    <Skeleton className="h-24 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-4/5 mt-4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-32 mt-4 rounded-lg" />
            </div>
        </div>
    );
}
