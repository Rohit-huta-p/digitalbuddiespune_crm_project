"use client";

import { Activity } from "lucide-react";

export function ActivityTab() {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
                <Activity className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
                Activity Feed
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1.5 max-w-[320px]">
                Coming soon — Track project activity including task updates, member
                changes, and status transitions.
            </p>
        </div>
    );
}
