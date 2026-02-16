"use client";

import { FolderKanban } from "lucide-react";

export function ProjectEmptyState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="rounded-full bg-muted p-5 mb-4">
                <FolderKanban className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground">
                Select a project
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1.5 max-w-[280px]">
                Choose a project from the list to view its details, tasks, and team
                members.
            </p>
        </div>
    );
}
